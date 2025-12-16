import { useState, useEffect } from "react";
import apiClient from "../../apiClient";
import { toast } from 'react-toastify';
import { getErrorMessage } from "../../utils/errorHelper";
import SeatMap from "./SeatMap";
function EventDetail({ event, onBack,liveData }) {
 // const [showModal, setShowModal] = useState(false); 
  

  // Canlı Stok Bilgisi
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [currentStock, setCurrentStock] = useState(event.totalSeats);
  const [animate, setAnimate] = useState(false);
  const [sold24h, setSold24h] = useState(0);
  const [lastSoldAmount, setLastSoldAmount] = useState(null);
  const [animate24h, setAnimate24h] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Sayfa açılınca güncel stoğu veritabanından çek (Rapor endpointini kullanıyoruz)
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await apiClient.get("/api/events/reports/sales", { params: { eventId: event.id } });
        if(res.data) {
          if (res.data.remaining !== undefined) setCurrentStock(res.data.remaining);
          if (res.data.soldLast24Hours !== undefined) setSold24h(res.data.soldLast24Hours);
        }
      } catch (error) { 
          // Hata olursa varsayılan
          setCurrentStock(event.totalSeats);
      }
    };
    fetchStock();
  }, [event.id]);

  // 2. WebSocket'ten yeni veri geldiğinde çalışır
  useEffect(() => {
    if (liveData && liveData.eventId === event.id) {
        // Eğer şu an baktığımız etkinlik için veri geldiyse:
        // stok güncelle
        setCurrentStock(liveData.remainingSeats);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);  
        // 24 saatlik satış
        setSold24h(liveData.soldLast24Hours);
        setAnimate24h(true);
        setTimeout(() => setAnimate24h(false), 500);
        // 3. bilet satıldı bildirimi(gizli özellik)
        if (liveData.quantity > 0) {
            setLastSoldAmount(liveData.quantity);
            // 3 saniye sonra bildirimi gizle
            setTimeout(() => setLastSoldAmount(null), 10000);
        }
    }
  }, [liveData, event.id]);
  if (!event) return null;

  // Modal'dan "Onayla" gelince çalışacak fonksiyon
  const handlePurchase = async () => {
    if (selectedSeatIds.length === 0) {
        toast.warning("Lütfen haritadan en az bir koltuk seçin! 💺");
        return;
    }

    setLoading(true);
    try {
      const requestBody = {
        eventId: event.id,
        seatIds: selectedSeatIds, // 👈 ÖNEMLİ: Artık koltuk ID listesi gidiyor
        quantity: selectedSeatIds.length // Log için
      };

      await apiClient.post("/api/tickets/purchase", requestBody);

      toast.success(`🎉 ${selectedSeatIds.length} adet bilet başarıyla alındı!`);
      
      // Başarılı olunca listeye dönelim
      setTimeout(() => {
          onBack();
      }, 2000);

    } catch (error) {
      console.error("Satın alma hatası:", error);
      const errorMsg = error.response?.data?.message || "Satın alma işlemi başarısız oldu.";
      const msg = getErrorMessage(error);
      toast.error(`❌ ${msg}`);
    }
  };

  return (
    <div className="text-light mt-4">    
    
      {/* Geri Dön Butonu */}
      <button onClick={onBack} className="btn btn-outline-secondary mb-4">
        ← Listeye Dön
      </button>
      
     {event.imageUrl && (
        <div className="mb-4">
            <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="event-detail-banner"
            />
        </div>
      )}

      {/* Etkinlik Detay Kartı */}
      <div className="card bg-dark border-secondary text-light shadow-lg">
        <div className="card-body p-5">
          <div className="row">
            {/* Sol Taraf: Bilgiler */}
            <div className="col-md-8">              
              <div className="d-flex flex-column align-items-start gap-2 mb-4">
                <div className="d-flex align-items-center gap-3"></div>
                <h2 className="display-5 fw-bold mb-0">{event.title}</h2>
    
             {/* 1. KALAN STOK (KIRMIZI) */}
                    <div className={`border border-danger text-danger px-3 py-1 rounded d-flex align-items-center gap-2 ${animate ? 'stock-flash' : ''}`} style={{ transition: 'all 0.3s' }}>
                        <span className="fw-bold fs-5">{currentStock}</span>
                        <small className="text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Kalan</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {/* 2. SON 24 SAAT (SARI/TURUNCU) */}
                    <div className={`text-warning d-flex align-items-center gap-2 px-1 ${animate24h ? 'stock-flash' : ''}`} style={{ transition: 'all 0.3s' }}>
                        <span className="fs-6">🔥 Son 24 saatte</span>
                        <span className="fw-bold fs-5">{sold24h}</span>
                        <span className="fs-6">bilet satıldı</span>
                    </div>

                    {/* 3. GİZLİ BİLDİRİM (Biri alınca çıkar) */}
                    {lastSoldAmount && (
                        <div className="bg-danger text-white px-2 py-1 rounded shadow blink-infinite">
                            <small className="fw-bold">⚠️ Az önce {lastSoldAmount} bilet daha satıldı!</small>
                        </div>
                    )}
                  </div>              
              <p className="lead text-secondary">{event.description || "Açıklama bulunmuyor."}</p>
              
              <div className="mt-4">
                <p className="mb-2"><strong className="text-info">📍 Mekan:</strong> {event.venue}, {event.city}</p>
                <p className="mb-2"><strong className="text-warning">📅 Tarih:</strong> {event.dateTime ? new Date(event.dateTime).toLocaleString("tr-TR") : "-"}</p>
              </div>            
            {/* KOLTUK HARİTASI*/}
              <hr className="border-secondary" />
              <SeatMap 
                  eventId={event.id} 
                  onSelectionChange={(ids) => setSelectedSeatIds(ids)} 
              />
              </div>

            {/* Sağ Taraf: Fiyat ve Buton */}
            <div className="col-md-4 text-md-end border-start border-secondary ps-md-5 mt-4 mt-md-0 d-flex flex-column justify-content-center">
              <div className="mb-4">
                <span className="d-block text-secondary small">Bilet Fiyatı</span>
                <span className="display-6 fw-bold text-success">{event.price} ₺</span>
              </div>
              {/* Seçim Özeti */}
              <div className="bg-secondary bg-opacity-25 p-3 rounded mb-3 text-start">
                  <div className="d-flex justify-content-between mb-2">
                      <span>Seçilen:</span>
                      <span className="fw-bold">{selectedSeatIds.length} Adet</span>
                  </div>
                  <div className="d-flex justify-content-between">
                      <span>Toplam:</span>
                      <span className="fw-bold text-info fs-5">
                          {selectedSeatIds.length * event.price} ₺
                      </span>
                  </div>
              </div>
              <button 
            className="btn btn-success w-100 py-3 mt-3 fw-bold fs-5 shadow-sm"
            onClick={handlePurchase}
            disabled={loading || selectedSeatIds.length === 0}
          >
            {loading ? "İşleniyor..." : "🎟️ Biletleri Satın Al"}
          </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;