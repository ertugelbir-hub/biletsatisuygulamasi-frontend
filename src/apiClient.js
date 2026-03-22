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
    if (error.response && error.response.status === 429) {
      // Dil ne seçiliyse (TR/EN/DE) otomatik o dilde toast basar!
      toast.error(i18n.t('errors.rateLimit'));
    }
    
    // Hatayı yola devam ettir ki, hangi sayfadaysak oranın yüklenme (loading) animasyonu kapanabilsin
    return Promise.reject(error); 
  }
);

export default apiClient;