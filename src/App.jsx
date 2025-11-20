import { useEffect, useState } from "react";
import apiClient from "./apiClient";
import EventList from "./components/EventList";
import EventDetail from "./components/EventDetail";
import Auth from "./components/Auth";
import MyTickets from "./components/MyTickets";
import AdminPanel from "./components/admin/AdminPanel"; // Admin Paneli importu
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- CSS şart!
import SearchBar from "./components/SearchBar";
function App() {
  // --- 1. STATE TANIMLARI (Hepsi En Tepede) ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Sayfa Yönlendirme State'leri
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // Admin paneli açık mı?
  
  // Kullanıcı Rolü
  const userRole = localStorage.getItem("role"); // ADMIN mi USER mı?

  // --- 2. USE EFFECT ---
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // --- 3. YARDIMCI FONKSİYONLAR ---
 // searchParams isteğe bağlıdır, boş gelirse tümünü çeker
  async function loadEvents(searchParams = {}) {
    try {
      setLoading(true);
      
      let url = "/api/events";
      let config = {};

      // Boş olmayan filtreleri ayıkla (Temizlik)
      const cleanParams = {};
      if (searchParams.q && searchParams.q.trim() !== "") cleanParams.q = searchParams.q;
      if (searchParams.city && searchParams.city !== "") cleanParams.city = searchParams.city;
      if (searchParams.type && searchParams.type !== "") cleanParams.type = searchParams.type;

      // Eğer en az 1 filtre varsa arama moduna geç
      if (Object.keys(cleanParams).length > 0) {
        url = "/api/events/search";
        config = { params: cleanParams };
      }

      const response = await apiClient.get(url, config);
      const data = response.data;
      
      setEvents(Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []));
      setError("");
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 401) {
         handleLogout();
      } else {
         setError("Etkinlikler yüklenirken hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    // Temizlik İşlemi
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role"); // Rolü de siliyoruz

    // State'leri Sıfırla
    setIsAuthenticated(false);
    setSelectedEvent(null);
    setShowMyTickets(false);
    setShowAdmin(false); // Admin panelini kapat
    setEvents([]);
  };

  // --- 4. İÇERİK YÖNETİMİ (Sıralama Önemli) ---
  let content;

  if (!isAuthenticated) {
    content = <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  } else if (showAdmin) {
    // Admin Paneli (En öncelikli)
    content = <AdminPanel onBack={() => setShowAdmin(false)} />;
  } else if (showMyTickets) {
    // Biletlerim Sayfası
    content = <MyTickets onBack={() => setShowMyTickets(false)} />;
  } else if (loading) {
    content = <div className="text-center mt-5 text-white">Yükleniyor...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mt-5">{error}</div>;
  } else if (selectedEvent) {
    // Detay Sayfası
    content = <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  } else {
    // Varsayılan: Liste
    content = <EventList events={events} onEventSelect={(event) => setSelectedEvent(event)} />;
  }

  // --- 5. GÖRÜNÜM (RETURN) ---
return (
    <div style={{ width: "100vw", minHeight: "100vh", backgroundColor: "#212529", margin: 0, padding: 0, overflowX: "hidden" }}>
      <div className="container py-5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* --- 1. HEADER (BAŞLIK VE BUTONLAR) --- */}
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-secondary pb-3">
          <div role="button" onClick={() => {
              setSelectedEvent(null); 
              setShowMyTickets(false);
              setShowAdmin(false);
            }}>
            <h1 className="h2 fw-bold text-white mb-0">🎟️ Bilet Satış</h1>
          </div>
          
          {isAuthenticated && (
            <div className="d-flex gap-3">
               {/* Admin Butonu */}
               {userRole === 'ADMIN' && (
                 <button 
                   className={`btn ${showAdmin ? 'btn-danger' : 'btn-outline-danger'}`}
                   onClick={() => {
                      setShowAdmin(true);
                      setShowMyTickets(false);
                      setSelectedEvent(null);
                   }}
                 >
                   Yönetici Paneli
                 </button>
               )}
               {/* Biletlerim Butonu */}
               <button 
                 className={`btn ${showMyTickets ? 'btn-warning' : 'btn-outline-warning'}`}
                 onClick={() => {
                    setShowMyTickets(true); 
                    setSelectedEvent(null);
                    setShowAdmin(false);
                 }}
               >
                 Biletlerim
               </button>
               {/* Çıkış Butonu */}
               <button onClick={handleLogout} className="btn btn-outline-danger">
                 Çıkış ({localStorage.getItem("username")})
               </button>
            </div>
          )}
        </div>

        {/* --- 2. ARAMA ÇUBUĞU (SADECE ANA SAYFADA) --- */}
        {isAuthenticated && !selectedEvent && !showMyTickets && !showAdmin &&(
           <SearchBar onSearch={(filters) => loadEvents(filters)} />
        )}

        {/* --- 3. ANA İÇERİK --- */}
        {content}

      </div>

      {/* --- 4. BİLDİRİMLER --- */}
      <ToastContainer 
         position="top-right" 
         autoClose={3000} 
         theme="dark" 
      />
    </div>
  );
}

export default App;