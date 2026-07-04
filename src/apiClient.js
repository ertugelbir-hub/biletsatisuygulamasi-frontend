import axios from "axios";
import { toast } from 'react-toastify';
import i18n from './i18n';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// HER İSTEKTEN ÖNCE ÇALIŞACAK "KAPICI" (INTERCEPTOR)
let isRateLimitToastActive = false;
apiClient.interceptors.request.use(
  (config) => {
   // ÖNCE localStorage'a bak, YOKSA sessionStorage'a bak
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    // Eğer token varsa, isteğin başlığına (Header) yapıştır
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 2. GELEN CEVAPLAR (RESPONSE): Her cevaptan sonra çalışacak "Gümrük Memuru" (YENİ EKLENEN)
apiClient.interceptors.response.use(
  (response) => {
    // Sunucudan 200 OK falan dönerse hiç dokunma, sayfaya aynen ilet
    return response; 
  },
  (error) => {
    // Eğer backend bize 429 (Çok Fazla İstek / Rate Limit) fırlattıysa:
   // ... interceptor içindeki 429 bloğunu ise şununla değiştir:
if (error.response && error.response.status === 429) {
    // EĞER ZATEN BİR GERİ SAYIM AKIYORSA, YENİDEN TETİKLEME, İSTEĞİ DİREKT REDDET!
    if (isRateLimitToastActive) {
        return Promise.reject(error);
    }

    // Kilidi devreye sokuyoruz
    isRateLimitToastActive = true;
    toast.dismiss(); 

    let secondsLeft = error.response.data.retryAfter || 5;
    
    const toastId = toast.error(`Aga çok hızlısın, biraz yavaşla! Lütfen ${secondsLeft} saniye bekle. ⏳`, {
        duration: 5000, // 5sn kalıcak
        onClose: () => {
            // Toast bir şekilde elle veya süresi bitip kapanırsa kilidi aç
            isRateLimitToastActive = false;
        }
    });

    const interval = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
            clearInterval(interval);
            toast.dismiss(toastId);
            isRateLimitToastActive = false; // Süre bitti, kilidi kaldır!
        } else {
            toast.update(toastId, {
                render: `Aga çok hızlısın, biraz yavaşla! Lütfen ${secondsLeft} saniye bekle. ⏳`,
                type: "error"
            });
        }
    }, 1000);
}
    
    // Hatayı yola devam ettir ki, hangi sayfadaysak oranın yüklenme (loading) animasyonu kapanabilsin
    return Promise.reject(error); 
  }
);

export default apiClient;