import "./App.css";
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
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Favorites from "./components/events/Favorites";
import { useCart } from './context/CartContext';
import CartPage from './components/cart/CartPage';
import { useTranslation } from 'react-i18next';

function App() {
  // --- 1. STATE TANIMLARI (Hepsi En Tepede) ---
    // Adres çubuğu "/" değilse (örn: /admin, /abc) true olur
  const [isNotFound, setIsNotFound] = useState(window.location.pathname !== "/");
  const [isAuthenticated, setIsAuthenticated] = useState(!!(localStorage.getItem("token") || sessionStorage.getItem("token")));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveData, setLiveData] = useState(null);
  const { cartItems } = useCart();
  const [showCart, setShowCart] = useState(false);
  
  // Sayfalama State'leri (YENİ)
  const [page, setPage] = useState(0); // Şu anki sayfa (0'dan başlar)
  const [totalPages, setTotalPages] = useState(0); // Toplam sayfa sayısı
  const [currentFilters, setCurrentFilters] = useState({}); // Aktif filtreleri tutalım
  const [sortType, setSortType] = useState("upcoming"); // Kullanıcının seçtiği sıralama türü
  
  // Sayfa Yönlendirme State'leri
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // Admin paneli açık mı?
  const [showProfile, setShowProfile] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Kullanıcı Rolü
 const userRole = localStorage.getItem("role") || sessionStorage.getItem("role");
 // Çeviri
  const { t, i18n } = useTranslation();

  // --- 2. USE EFFECT ---
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  //Websocket
useEffect(() => {
    // Sadece giriş yapmış kullanıcılar dinlesin
    if (!isAuthenticated) return;

    let stompClient = null;

    const connectWebSocket = () => {
        // Backend'e bağlan
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(() => socket);
        
        // Konsol kirliliğini önlemek için logları kapat (isteğe bağlı)
        stompClient.debug = () => {}; 

        stompClient.connect({}, () => {
          console.log("🟢 App WebSocket Bağlantısı Başarılı");
            // '/topic/sales' kanalını dinle
            stompClient.subscribe('/topic/sales', (message) => {
                try {
                    const eventData = JSON.parse(message.body);    
                    //bildirim                
                    setLiveData(eventData);

                } catch (err) {
                    console.error("Mesaj okuma hatası:", err);
                }
            });
        }, (err) => {
            console.error("WebSocket Bağlantı Hatası:", err);
        });
    };

    connectWebSocket();

    // Temizlik: Sayfadan çıkınca bağlantıyı kes
    return () => {
        if (stompClient) stompClient.disconnect();
    };

  }, [isAuthenticated]);

        // 🔥 YENİ: Sadece "Sıralama" kutusunu dinleyen özel ajan
  useEffect(() => {
    // Eğer sayfaya ilk girişse veya sistem henüz yükleniyorsa durdur
    if (!isAuthenticated) return;

    if (sortType === "best-selling") {
      // 1. Çok satanlar: Backend'deki özel SQL'imize git
      apiClient.get('/api/events?sort=best-selling')
        .then(res => {
          setEvents(res.data);
          setTotalPages(1); 
          setPage(0);
        })
        .catch(err => console.error("Çok satanlar çekilemedi:", err));
    } 
    else {
      // 2. Yaklaşanlar VEYA Son Eklenenler: İkisi için de ana motoru çalıştır!
      // loadEvents zaten yukarıda yazdığımız mantıkla doğru parametreyi yollayacak.
      loadEvents(currentFilters, 0);
    } 
  }, [sortType]); // 👈 Bu kod sadece sortType (Sıralama kutusu) değiştiğinde çalışır
  // --- 3. YARDIMCI FONKSİYONLAR ---
 // Hem filtreleri hem de sayfa numarasını yönetir
  async function loadEvents(filters = {}, pageNum = 0) {
    try {
      setLoading(true);      
      await new Promise(r => setTimeout(r, 2000));
     // Backend'deki 'search' endpoint'i hem filtreleme hem sayfalama yapar
      // Parametreleri hazırlıyoruz
      const currentSortField = sortType === "newest-added" ? "id" : "dateTime";
      const currentSortDir = sortType === "newest-added" ? "desc" : "asc";
      const params = {
        page: pageNum,
        size: 6, // Her sayfada 6 etkinlik (3x2 ızgara için ideal)
       sort: currentSortField, // 👈 Artık dinamik
        dir: currentSortDir,    // 👈 Artık dinamik
        ...filters
        
      };

  
     // Temizlik: Boş string olan filtreleri gönderme
      if (!params.q) delete params.q;
      if (!params.city) delete params.city;
      if (!params.type) delete params.type;

      const response = await apiClient.get("/api/events/search", { params });
      const data = response.data; // Spring Page yapısı döner

      const content = data.content ? data.content : (Array.isArray(data) ? data : []);
      setEvents(data.content); // Liste 'content' içindedir
      setTotalPages(data.totalPages); // Toplam sayfa sayısı
      setPage(data.number); // Güncel sayfa numarası
      setCurrentFilters(filters); // Filtreleri hafızada tut (sayfa değişince lazım olacak)
      setError("");
    } catch (e) {
      console.error("Liste Hatası:", e);
      
      // HATA DETAYINI GÖRMEK İÇİN:
      if (e.response && e.response.status === 400) {
         console.error("400 Hatası Detayı:", e.response.data);
         // Ekrana backend'den gelen mesajı basalım ki sebebi anlayalım
         setError(e.response.data.message || "İstek hatalı (400). Backend loglarına bak.");
      } else if (e.response && e.response.status === 401) {
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
    // 1. HER İKİ HAFIZAYI DA TERTEMİZ YAP (Garantici yöntem)
    localStorage.clear();
    sessionStorage.clear();

    // 2. State'leri Sıfırla
    setIsAuthenticated(false);
    setSelectedEvent(null);
    setShowMyTickets(false);
    setShowAdmin(false);
    setEvents([]);
    setShowProfile(false);
    setCartItems([]); // Sepeti de temizlemek profesyonelce olur
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
    } else if (showCart) {
    // 🛒 SEPET SAYFASI
    content = <CartPage onBack={() => setShowCart(false)} />;
  } else if (showFavorites) {
    // Favoriler Sayfası
    content = <Favorites onEventSelect={(event) => {
        setSelectedEvent(event);
        setShowFavorites(false); // Detaya gidince favoriler kapansın
    }} />;
  } else if (loading) {
    content = (
      <div className="d-flex flex-column justify-content-center align-items-center mt-5">        
        <div className="mb-4">
           <RotateLoader color="#36d7b7" size={15} margin={2} />
        </div>
        <p className="text-light fs-5 mt-3">{t('app.loading')}</p>
      </div>
    );
  } else if (error) {
    content = <div className="alert alert-danger mt-5">{error}</div>;
  } else if (selectedEvent) {
    // Detay Sayfası
    content = <EventDetail event={selectedEvent}
    liveData={liveData}
    onBack={() => {setSelectedEvent(null); setLiveData(null);}}
     />;
  } else {
    // Varsayılan: Liste
    content = (
      <>
      <EventList 
          events={events} 
          onEventSelect={(event) => setSelectedEvent(event)} 
          sortType={sortType} 
          onSortChange={(newSort) => setSortType(newSort)} // 👈 Sadece bu kalsın!
      />
    {/* SAYFALAMA BUTONLARI (Sadece birden fazla sayfa varsa göster) */}
    {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
            <button 
              className="btn btn-outline-secondary" 
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              {t('pagination.prev')}
            </button>
            
            <span className="text-white fw-bold">
             {t('pagination.page', { current: page + 1, total: totalPages })}
            </span>
            
            <button 
              className="btn btn-outline-secondary" 
              disabled={page === totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              {t('pagination.next')}
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
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3 gap-3">
          
          {/* Logo / Başlık Kısmı (text-nowrap ile emojinin kopmasını engelledik) */}
          <div role="button" onClick={() => {
              setSelectedEvent(null); 
              setShowMyTickets(false);
              setShowAdmin(false);
              setShowCart(false);
              loadEvents({}, 0); 
              setShowFavorites(false);
            }}>
            <h1 className="h3 fw-bold text-white mb-0 text-nowrap">{t('app.title')}</h1>
          </div>
          
          {/* Butonlar Kısmı */}
          {isAuthenticated && (
            <div className="d-flex gap-2 align-items-center flex-wrap justify-content-end">
                
                {/* --- DİL SEÇİM BUTONLARI --- */}
                <div className="btn-group shadow-sm" role="group">
                    <button type="button" className={`btn btn-sm ${i18n.language === 'tr' ? 'btn-light fw-bold' : 'btn-outline-light'}`} onClick={() => {i18n.changeLanguage('tr'),localStorage.setItem('user-language', 'tr');}}>TR</button>
                    <button type="button" className={`btn btn-sm ${i18n.language === 'en' ? 'btn-light fw-bold' : 'btn-outline-light'}`} onClick={() => {i18n.changeLanguage('en'),localStorage.setItem('user-language', 'en');}}>EN</button>
                    <button type="button" className={`btn btn-sm ${i18n.language === 'de' ? 'btn-light fw-bold' : 'btn-outline-light'}`} onClick={() => {i18n.changeLanguage('de'),localStorage.setItem('user-language', 'de');}}>DE</button>
                </div>

                <button 
                  className={`btn btn-sm ${showCart ? 'btn-warning' : 'btn-outline-warning'} position-relative fw-bold`}
                  onClick={() => {
                    setShowCart(true); setShowMyTickets(false); setSelectedEvent(null);
                    setShowAdmin(false); setShowFavorites(false); setShowProfile(false);
                  }}
                >
                  {t('app.cart')}
                  {cartItems.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.65rem'}}>
                    {cartItems.length}
                    </span>
                  )}
                </button>

                {userRole === 'ADMIN' && (
                  <button className={`btn btn-sm ${showAdmin ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => { setShowAdmin(true); setShowMyTickets(false); setShowCart(false); setSelectedEvent(null); setShowFavorites(false); }}>
                    {t('app.adminPanel')}
                  </button>
                )}                                    
                
                <button className={`btn btn-sm ${showMyTickets ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => { setShowMyTickets(true); setShowCart(false); setSelectedEvent(null); setShowAdmin(false); setShowFavorites(false); }}>
                  {t('app.myTickets')}
                </button>
                
                <button className={`btn btn-sm ${showFavorites ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => { setShowFavorites(true); setShowCart(false); setShowMyTickets(false); setSelectedEvent(null); setShowAdmin(false); setShowProfile(false); }}>
                  {t('app.favorites')}
                </button>

                <button className={`btn btn-sm ${showProfile ? 'btn-info' : 'btn-outline-info'}`} onClick={() => { setShowProfile(true); setShowCart(false); setShowMyTickets(false); setSelectedEvent(null); setShowAdmin(false); setShowFavorites(false); }}>
                  👤 {localStorage.getItem("username") || sessionStorage.getItem("username")}
                </button>
                
                {/* Çıkış butonundaki fazla ismi kaldırdık ki yer kaplamasın */}
                <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
                  {t('app.logout')}
                </button>
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