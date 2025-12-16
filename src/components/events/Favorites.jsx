import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient'; // App.jsx'in konumuna göre ../../ ayarladık
import EventItem from './EventItem'; // Aynı klasörde olduğu için direkt çağırıyoruz
import { toast } from 'react-toastify';

function Favorites({ onEventSelect }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Favorileri Backend'den Çek
  const fetchFavorites = async () => {
    try {
      const res = await apiClient.get('/api/favorites');
      setFavorites(res.data);
    } catch (error) {
      console.error("Favoriler alınamadı", error);
      // Hata olsa bile loading'i kapat ki sonsuz döngü olmasın
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Kalbe basıp favoriden çıkarınca listeden de silinsin
  const handleRemoveFromList = (eventId) => {
    setFavorites(prev => prev.filter(e => e.id !== eventId));
  };

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-light" role="status"></div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2 className="text-white mb-4 border-bottom border-secondary pb-2">❤️ Favori Etkinliklerim</h2>
      
      {favorites.length === 0 ? (
        <div className="alert alert-secondary text-center py-5">
          <h4>Henüz favori etkinliğin yok 🤷‍♂️</h4>
          <p>Etkinliklere göz atıp beğendiklerini kalp butonuna basarak buraya ekleyebilirsin!</p>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map(event => (
            <EventItem 
                key={event.id} 
                event={event} 
                // Karta tıklayınca App.jsx'teki detay fonksiyonunu çalıştır
                onSelect={(e) => onEventSelect(e)} 
                // Kalbe basınca bu listeden düşür
                onFavoriteToggle={() => handleRemoveFromList(event.id)}
                isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;