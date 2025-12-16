import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import { toast } from 'react-toastify';

function EventItem({ event, onSelect, onFavoriteToggle, isFavorite = false }) {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (isFavorite === true) {
        setIsLiked(true);
    } else {
        setIsLiked(false);
    }
  }, [isFavorite]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Karta tıklayınca detaya gitmesin, sadece favori çalışsın
    if (loading) return;

    setLoading(true);
    try {
      // Backend'e istek at (Ekle/Çıkar)
      const res = await apiClient.post(`/api/favorites/${event.id}`);
      
     // Toggle işlemi (Tersine çevir)
      const newState = !isLiked;
      setIsLiked(newState);
      
      // Mesaj göster
      if (res.data.includes("eklendi")) {
          toast.success("Favorilere eklendi ❤️");
      } else {
          toast.info("Favorilerden çıkarıldı 💔");
          // Eğer Favorilerim sayfasındaysak, listeden düşmesi için tetikle
          if (onFavoriteToggle) onFavoriteToggle(); 
      }

    } catch (error) {
      console.error(error);
      toast.error("İşlem başarısız (Giriş yaptınız mı?)");
      // Hata olursa eski haline döndür
      setIsLiked(!isLiked);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0 position-relative" style={{ backgroundColor: "#ffffff" }}>
        {/* --- ❤️ FAVORİ BUTONU (Senin eksik olan kısmın burası) --- */}
        <button 
            onClick={handleFavoriteClick}
            className="btn position-absolute top-0 end-0 m-2 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', zIndex: 10, border: 'none' }}
        >
            <i className={`bi ${isLiked ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`} style={{ fontSize: '1.2rem' }}></i>
        </button>
        {/* -------------------------------------------------------- */}

        <div style={{ height: "220px", overflow: "hidden" }}>
            <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="card-img-top-custom" 
            />
        </div>
        <div className="card-body d-flex flex-column text-dark">
          <h5 className="card-title fw-bold mb-2">{event.title}</h5>
          
          <p className="mb-1 text-secondary">
            {event.city} • {event.venue}
          </p>
          
          <p className="mb-3 small text-muted">
             {event.dateTime ? new Date(event.dateTime).toLocaleString("tr-TR") : "Tarih yok"}
          </p>

          <div className="mt-auto">
            <h6 className="fw-bold text-black mb-3">Fiyat: {event.price} ₺</h6>
            
            <button 
              className="btn btn-primary w-100 fw-bold"
              onClick={() => onSelect(event)} 
            >
              İncele
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventItem;