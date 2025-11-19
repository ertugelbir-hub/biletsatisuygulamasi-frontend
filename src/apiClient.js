import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// HER İSTEKTEN ÖNCE ÇALIŞACAK "KAPICI" (INTERCEPTOR)
apiClient.interceptors.request.use(
  (config) => {
    // Tarayıcının hafızasından token'ı al
    const token = localStorage.getItem("token");
    
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

export default apiClient;