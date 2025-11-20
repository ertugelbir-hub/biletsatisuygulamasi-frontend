import { useEffect, useState } from "react";
import apiClient from "./apiClient";
import EventList from "./components/EventList";
import EventDetail from "./components/EventDetail";
import Auth from "./components/Auth";
import MyTickets from "./components/MyTickets"; // YENİ EKLENDİ
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // SAYFA YÖNETİMİ
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showMyTickets, setShowMyTickets] = useState(false); // YENİ: Biletlerim sayfası açık mı?

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    } else {
      setLoading(false);
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
    setShowMyTickets(false);
    setEvents([]);
  };

  // --- İÇERİK YÖNETİMİ (SIRA ÖNEMLİ) ---
  let content;

  if (!isAuthenticated) {
    content = <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  } else if (showMyTickets) {
    // YENİ: Biletlerim sayfasını göster
    content = <MyTickets onBack={() => setShowMyTickets(false)} />;
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
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-secondary pb-3">
          <div role="button" onClick={() => {setSelectedEvent(null); setShowMyTickets(false);}}>
            <h1 className="h2 fw-bold text-white mb-0">🎟️ Bilet Satış</h1>
          </div>
          
          {isAuthenticated && (
            <div className="d-flex gap-3">
               {/* YENİ: Biletlerim Butonu */}
               <button 
                 className={`btn ${showMyTickets ? 'btn-warning' : 'btn-outline-warning'}`}
                 onClick={() => {
                    setShowMyTickets(true); 
                    setSelectedEvent(null);
                 }}
               >
                 Biletlerim
               </button>

               <button onClick={handleLogout} className="btn btn-outline-danger">
                 Çıkış ({localStorage.getItem("username")})
               </button>
            </div>
          )}
        </div>

        {content}

      </div>
    </div>
  );
}

export default App;