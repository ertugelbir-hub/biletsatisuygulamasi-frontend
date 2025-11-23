import { useEffect, useState } from "react";
import apiClient from "./apiClient";
import EventList from "./components/events/EventList";
import EventDetail from "./components/events/EventDetail";
import Auth from "./components/auth/Auth";
import MyTickets from "./components/tickets/MyTickets";
import AdminPanel from "./components/admin/AdminPanel"; // Admin Paneli importu
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- CSS şart!
import SearchBar from "./components/events/SearchBar";
import Profile from "./components/auth/Profile";
import { RotateLoader } from "react-spinners";
import NotFound from "./components/NotFound";
function App() {
  // --- 1. STATE TANIMLARI (Hepsi En Tepede) ---
    // Adres çubuğu "/" değilse (örn: /admin, /abc) true olur
  const [isNotFound, setIsNotFound] = useState(window.location.pathname !== "/");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Sayfalama State'leri (YENİ)
  const [page, setPage] = useState(0); // Şu anki sayfa (0'dan başlar)
  const [totalPages, setTotalPages] = useState(0); // Toplam sayfa sayısı
  const [currentFilters, setCurrentFilters] = useState({}); // Aktif filtreleri tutalım
  
  // Sayfa Yönlendirme State'leri
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // Admin paneli açık mı?
  const [showProfile, setShowProfile] = useState(false);
  
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
 // Hem filtreleri hem de sayfa numarasını yönetir
  async function loadEvents(filters = {}, pageNum = 0) {
    try {
      setLoading(true);      
      await new Promise(r => setTimeout(r, 2000));
     // Backend'deki 'search' endpoint'i hem filtreleme hem sayfalama yapar
      // Parametreleri hazırlıyoruz
      const params = {
        page: pageNum,
        size: 6, // Her sayfada 6 etkinlik (3x2 ızgara için ideal)
        sort: "dateTime",
        dir: "asc",
        ...filters // Gelen filtreleri (şehir, tür vb.) ekle
      };
      
     // Temizlik: Boş string olan filtreleri gönderme
      if (!params.q) delete params.q;
      if (!params.city) delete params.city;
      if (!params.type) delete params.type;

      const response = await apiClient.get("/api/events/search", { params });
      const data = response.data; // Spring Page yapısı döner
      
      setEvents(data.content); // Liste 'content' içindedir
      setTotalPages(data.totalPages); // Toplam sayfa sayısı
      setPage(data.number); // Güncel sayfa numarası
      setCurrentFilters(filters); // Filtreleri hafızada tut (sayfa değişince lazım olacak)
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
// Sayfa Değiştirme Butonuna Basınca
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadEvents(currentFilters, newPage); // Filtreleri koru, sayfayı değiştir
      window.scrollTo(0, 0); // Sayfanın tepesine çık
    }
  };

  const handleLogout = () => {
    // Temizlik İşlemi
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");     

    // State'leri Sıfırla
    setIsAuthenticated(false);
    setSelectedEvent(null);
    setShowMyTickets(false);
    setShowAdmin(false); // Admin panelini kapat
    setEvents([]);
    setShowProfile(false);
  };
  // Eğer sayfa bulunamadıysa, Header'ı falan gösterme, direkt bunu göster ve bitir.
  if (isNotFound) {
    return (
      <>
        <NotFound onGoHome={() => {
           // Adresi temizle ve ana sayfaya dön
           window.history.pushState(null, "", "/");
           setIsNotFound(false);
        }} />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </>
    );
  }

  // --- 4. İÇERİK YÖNETİMİ (Sıralama Önemli) ---
  let content;

  if (!isAuthenticated) {
    content = <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  } else if (showAdmin) {
    // Admin Paneli (En öncelikli)
    content = <AdminPanel onBack={() => setShowAdmin(false)} />;
  } else if (showProfile) {  
  content = <Profile onBack={() => setShowProfile(false)} />;
  } else if (showMyTickets) {
    // Biletlerim Sayfası
    content = <MyTickets onBack={() => setShowMyTickets(false)} />;
  } else if (loading) {
    content = (
      <div className="d-flex flex-column justify-content-center align-items-center mt-5">        
        <div className="mb-4">
           <RotateLoader color="#36d7b7" size={15} margin={2} />
        </div>
        <p className="text-light fs-5 mt-3">Yükleniyor...</p>
      </div>
    );
  } else if (error) {
    content = <div className="alert alert-danger mt-5">{error}</div>;
  } else if (selectedEvent) {
    // Detay Sayfası
    content = <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  } else {
    // Varsayılan: Liste
    content = (
      <>
      <EventList events={events} onEventSelect={(event) => setSelectedEvent(event)} />;
    {/* SAYFALAMA BUTONLARI (Sadece birden fazla sayfa varsa göster) */}
    {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
            <button 
              className="btn btn-outline-secondary" 
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              ← Önceki
            </button>
            
            <span className="text-white fw-bold">
              Sayfa {page + 1} / {totalPages}
            </span>
            
            <button 
              className="btn btn-outline-secondary" 
              disabled={page === totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              Sonraki →
            </button>
          </div>
        )}
      </>
    );
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
              loadEvents({}, 0); // Ana sayfaya dönünce sıfırla
            }}>
            <h1 className="h2 fw-bold text-white mb-0">🎟️ Bilet Satış</h1>
          </div>
          
          {isAuthenticated && (
            <div className="d-flex gap-3">
               {/* Admin Butonu */}
               {userRole === 'ADMIN' && (
                 <button 
                   className={`btn ${showAdmin ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => { setShowAdmin(true); setShowMyTickets(false); setSelectedEvent(null); }}>Yönetici Paneli</button>
                   )}                                    
               <button className={`btn ${showMyTickets ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => { setShowMyTickets(true); setSelectedEvent(null); setShowAdmin(false); }}>Biletlerim</button>
               {/* PROFİL BUTONU (İSİM) */}
               <button 
                 className={`btn ${showProfile ? 'btn-info' : 'btn-outline-info'}`}
                 onClick={() => {
                    setShowProfile(true);
                    setShowMyTickets(false);
                    setSelectedEvent(null);
                    setShowAdmin(false);
                 }}
               >
                 👤 {localStorage.getItem("username")}
               </button>
               <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış ({localStorage.getItem("username")})</button>
            </div>
          )}
        </div>

        {isAuthenticated && !selectedEvent && !showMyTickets && !showAdmin && (
           // Arama yapınca her zaman 0. sayfadan başlat
           <SearchBar onSearch={(filters) => loadEvents(filters, 0)} />
        )}

        {content}

      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}

export default App;