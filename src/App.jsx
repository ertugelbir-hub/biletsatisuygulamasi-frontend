import { useEffect, useState } from "react";
import apiClient from "./apiClient";
import EventList from "./components/EventList";
import EventDetail from "./components/EventDetail";
import Auth from "./components/Auth"; // Yeni bileşeni ekledik
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  // KULLANICI OTURUM DURUMU
  // localStorage'da token varsa true kabul et
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Token varsa Eventleri Yükle
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    } else {
      setLoading(false); // Giriş yapmamışsa yüklemeyi durdur
    }
  }, [isAuthenticated]);

  async function loadEvents() {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/events");
      const data = response.data;
      setEvents(Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []));
      setError("");
    } catch (e) {
      console.error(e);
      // Eğer 401 hatası alırsak (Token geçersizse) oturumu düşür
      if (e.response && e.response.status === 401) {
         handleLogout();
      } else {
         setError("Veriler sunucudan çekilemedi.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setSelectedEvent(null);
    setEvents([]);
  };

  // --- İÇERİK YÖNETİMİ ---
  let content;

  if (!isAuthenticated) {
    // GİRİŞ YAPMAMIŞSA -> AUTH EKRANI
    content = <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  } else if (loading) {
    content = <div className="text-center mt-5 text-white">Yükleniyor...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mt-5">{error}</div>;
  } else if (selectedEvent) {
    content = <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  } else {
    content = <EventList events={events} onEventSelect={(event) => setSelectedEvent(event)} />;
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", backgroundColor: "#212529", margin: 0, padding: 0, overflowX: "hidden" }}>
      <div className="container py-5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-secondary pb-3">
          <div>
            <h1 className="h2 fw-bold text-white mb-0">🎟️ Bilet Satış</h1>
          </div>
          
          {/* Çıkış Yap Butonu (Sadece giriş yapmışsa görünür) */}
          {isAuthenticated && (
             <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
               Çıkış Yap ({localStorage.getItem("username")})
             </button>
          )}
        </div>

        {content}

      </div>
    </div>
  );
}

export default App;