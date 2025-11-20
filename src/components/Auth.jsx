import { useState } from "react";
import apiClient from "../apiClient";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Giriş modunda mı, Kayıt modunda mı?
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Sadece kayıt için
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Backend Endpointlerini kontrol et (Controller yapına göre)
   const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    const payload = isLogin 
      ? { username, password } 
      : { username, password, email, role: "USER" }; // Kayıtta email ve rol de gönderelim

    try {
      const response = await apiClient.post(endpoint, payload);

      if (isLogin) {
        // GİRİŞ BAŞARILI: Token'ı kaydet
        // Backend'den dönen yapın { token: "..." } ise:
        const token = response.data.token || response.data; // String dönerse direkt al
        // YENİ KISIM: Token'ı çöz ve rolü al
        const decoded = jwtDecode(token); 
        const userRole = decoded.role; // Backend'de "role" diye kaydetmiştik
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", userRole); // <-- ROLÜ KAYDETTİK
        toast.success("👋 Hoşgeldin " + username);
        onLoginSuccess(); // App.jsx'e haber ver
      } else {
        // KAYIT BAŞARILI: Giriş ekranına dön
        toast.success("✅ Kayıt başarılı! Şimdi giriş yapabilirsin.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ İşlem başarısız! Bilgileri kontrol et.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card bg-dark text-white border-secondary p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Kullanıcı Adı</label>
            <input 
              type="text" 
              className="form-control bg-secondary text-white border-0"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          {!isLogin && (
            <div className="mb-3">
              <label>Email</label>
              <input 
                type="email" 
                className="form-control bg-secondary text-white border-0"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="mb-4">
            <label>Şifre</label>
            <input 
              type="password" 
              className="form-control bg-secondary text-white border-0"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-secondary">
            {isLogin ? "Hesabın yok mu? " : "Zaten üye misin? "}
            <span 
              className="text-primary text-decoration-underline cursor-pointer" 
              style={{ cursor: "pointer" }}
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </span>
          </small>
        </div>

      </div>
    </div>
  );
}

export default Auth;