import { useState } from "react";
import apiClient from "../../apiClient";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import { getErrorMessage } from "../../utils/errorHelper";
function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Giriş modunda mı, Kayıt modunda mı?
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Sadece kayıt için  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));//test

    // Backend Endpointlerini kontrol et (Controller yapına göre)
   const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    const payload = isLogin 
      ? { username, password } 
      : { username, password, email, role: "USER" }; // Kayıtta email ve rol de gönderelim

    try {
      const response = await apiClient.post(endpoint, payload);
      console.log("Backend Cevabı:", response); // <--- LOG 1

      if (isLogin) {
        // GİRİŞ BAŞARILI: Token'ı kaydet
        // Backend'den dönen yapın { token: "..." } ise:
        const token = response.data.token || response.data; // String dönerse direkt al
        console.log("Gelen Token:", token); // <--- LOG 2
        // YENİ KISIM: Token'ı çöz ve rolü al,
        if (!token) {
            throw new Error("Backend'den Token gelmedi!");
        }
        let userRole = "USER";
       try {
            const decoded = jwtDecode(token);
            console.log("Çözülen Token:", decoded); // <--- LOG 3
            
            if (decoded.role) {
                userRole = decoded.role || "USER";
            }
            
            } catch (decodeError) {
            console.error("Token çözülemedi:", decodeError);
            // Token çözülemezse bile akışı bozmayalım, varsayılan role ile devam edelim
        }
        
        if (rememberMe) {
            // Kalıcı Hafıza (Beni Hatırla SEÇİLİ)
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("role", userRole);
        } else {
            // Geçici Hafıza (Beni Hatırla SEÇİLİ DEĞİL)
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("role", userRole);
        }
        toast.success("👋 Hoşgeldin " + username);
        onLoginSuccess(); // App.jsx'e haber ver
      } else {
        // KAYIT BAŞARILI: Giriş ekranına dön
        toast.success("✅ Kayıt başarılı! Şimdi giriş yapabilirsin.");
        setIsLogin(true);   
        setLoading(false);     
      }
      if (!isLogin) setLoading(false);
    } catch (err) {
      
      console.error("LOGIN HATASI DETAYI:", err); // <--- LOG 4 (Gerçek hatayı burada göreceğiz)
      if (!err.response) {
          setError("Uygulama hatası: " + err.message);
      }else{
      const msg = getErrorMessage(err); 
      toast.error(`❌ ${msg}`);
    }
      setLoading(false);
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
          {isLogin && (
            <div className="mb-3 form-check">
                <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-secondary" htmlFor="rememberMe">
                    Beni Hatırla
                </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading} >
            {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            İşleniyor...
          </>
        ) : (
          isLogin ? "Giriş Yap" : "Kayıt Ol"
        )}
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