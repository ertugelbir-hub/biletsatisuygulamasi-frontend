import React, { useEffect, useState } from 'react'; 
import apiClient from '../../apiClient';
import EventItem from './EventItem';
import { toast } from "react-toastify";
import { Link } from "react-router-dom";


function EventList({ events, onEventSelect }) {
  // Kullanıcının favorilediği ID'leri tutacak bir liste
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  useEffect(() => {
    // Sayfa açılınca favori ID'lerini çek
    const fetchFavoriteIds = async () => {
      // Eğer kullanıcı giriş yapmamışsa hiç uğraşma
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
          console.log("Giriş yapılmamış, favoriler çekilmiyor.");
          return;
      }

      try {       
        const res = await apiClient.get('/api/favorites');
        // Gelen etkinlik objelerinden sadece ID'leri alıp listeye koyuyoruz
        const ids = res.data.map(event => event.id);
        console.log("🔥 FAVORİLER GELDİ:", ids);
        setFavoriteIds(ids);
      } catch (error) {
        console.error("Favori durumu kontrol edilemedi", error);
      }
    };
  fetchFavoriteIds();
  }, []); // Sadece ilk açılışta çalışsın

  if (!events || events.length === 0) {
    return <div className="text-center text-white mt-5">Etkinlik bulunamadı.</div>;
  }
  const leftAds = events ? events.slice(0, 2) : [];
  const rightAds = events ? [...events].reverse().slice(0, 2) : [];

  const MiniCard = ({ evt }) => (
    <div className="card bg-dark border-secondary mb-3 shadow-sm">
      {evt.imageUrl && (
        <img 
          src={evt.imageUrl} 
          className="card-img-top" 
          alt={evt.title} 
          style={{ height: '100px', objectFit: 'cover', opacity: 0.8 }} 
        />
      )}
      <div className="card-body p-2 text-white">
        <h6 className="fw-bold text-truncate" style={{fontSize: '0.85rem'}}>{evt.title}</h6>
        <div className="d-flex justify-content-between align-items-center mt-1">
            <span className="badge bg-secondary">{evt.price} ₺</span>
            {/* Link import edilmemişse burayı button yapabilirsin veya import ekleyebilirsin */}
            <Link to={`/events/${evt.id}`} className="btn btn-outline-light btn-sm py-0" style={{fontSize: '0.65rem'}}>
               Git
            </Link>
        </div>
      </div>
    </div>
  );

return (
    <div className="container-fluid mt-3">
      <div className="row">
        
        {/* --- SOL SÜTUN (Sadece Geniş Ekranda Görünür) --- */}
        <div className="col-lg-2 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '20px' }}>
                <h6 className="text-warning border-bottom border-secondary pb-2 mb-3 small">🔥 Haftanın Yıldızları</h6>
                {leftAds.map(evt => <MiniCard key={`L-${evt.id}`} evt={evt} />)}
            </div>
        </div>

        {/* --- ORTA SÜTUN (Ana Liste) --- */}
        <div className="col-lg-8 col-12">
            <div className="row g-4 justify-content-center">
              {events.map((event) => (
                // DÜZELTME: Buradaki fazlalık 'div'i kaldırdık.
                // EventItem zaten kendi 'col' ayarına sahip, direkt koyuyoruz.
                <EventItem 
                    key={event.id} 
                    event={event} 
                    onSelect={onEventSelect} 
                    isFavorite={favoriteIds.some(favId => String(favId) === String(event.id))}
                />
              ))}
            </div>
        </div>

        {/* --- SAĞ SÜTUN (Sadece Geniş Ekranda Görünür) --- */}
        <div className="col-lg-2 d-none d-lg-block">
             <div className="sticky-top" style={{ top: '20px' }}>
                <h6 className="text-info border-bottom border-secondary pb-2 mb-3 small">🚀 Sizin İçin</h6>
                {rightAds.map(evt => <MiniCard key={`R-${evt.id}`} evt={evt} />)}
            </div>
        </div>

      </div>
    </div>
  );
}

export default EventList;