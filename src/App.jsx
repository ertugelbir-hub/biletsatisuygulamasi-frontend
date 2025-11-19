import { useEffect, useState } from "react";
import apiClient from "./apiClient";
import EventList from "./components/EventList";
import EventDetail from "./components/EventDetail";
import "bootstrap/dist/css/bootstrap.min.css"; 
// App.css importunu da SİLİYORUZ.

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/events");
        const data = response.data;
        setEvents(Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []));
      } catch (e) {
        console.error(e);
        setError("Veriler sunucudan çekilemedi.");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // İçerik belirleme
  let content;
  if (loading) {
    content = <div className="text-center mt-5 text-white">Yükleniyor...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mt-5">{error}</div>;
  } else if (selectedEvent) {
    content = <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  } else {
    content = <EventList events={events} onEventSelect={(event) => setSelectedEvent(event)} />;
  }

  return (
    // EN DIŞ KATMAN: style ile tüm ekranı kapla ve arka planı ver (CSS dosyasına güvenme)
    <div style={{ 
      width: "100vw", 
      minHeight: "100vh", 
      backgroundColor: "#212529", 
      margin: 0, 
      padding: 0,
      overflowX: "hidden"
    }}>
      
      {/* ORTALAYICI KONTEYNER: Bootstrap container + manuel margin */}
      <div className="container py-5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Başlık */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white">🎟️ Bilet Satış</h1>
          <p className="lead text-secondary">Etkinlikleri incele ve biletini hemen al.</p>
          <hr className="border-secondary w-50 mx-auto" />
        </div>

        {/* İçerik */}
        {content}

      </div>
    </div>
  );
}

export default App;