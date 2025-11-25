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

export default apiClient;