// src/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080", // Spring Boot
});

// İleride interceptor vs eklemek istersek burayı kullanırız
export default apiClient;
