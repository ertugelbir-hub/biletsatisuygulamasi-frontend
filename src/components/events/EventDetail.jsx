import { useState } from "react";
import TicketModal from "../tickets/TicketModal"; 
import apiClient from "../../apiClient";
import { toast } from 'react-toastify';
import { getErrorMessage } from "../../utils/errorHelper";
function EventDetail({ event, onBack }) {
  const [showModal, setShowModal] = useState(false); 
  if (!event) return null;

  // Modal'dan "Onayla" gelince çalışacak fonksiyon
  const handlePurchase = async (quantity) => { // <-- Artık sadece quantity alıyor
    try {
      const requestBody = {
        eventId: event.id,
        quantity: quantity
        // customerName sildik, backend zaten token'dan alıyor
      };

      await apiClient.post("/api/tickets/purchase", requestBody); // Senin endpointin /purchase idi

      setShowModal(false);
      toast.success("🎉 Bilet başarıyla satın alındı! İyi eğlenceler.");

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

      {/* Etkinlik Detay Kartı */}
      <div className="card bg-dark border-secondary text-light shadow-lg">
        <div className="card-body p-5">
          <div className="row">
            {/* Sol Taraf: Bilgiler */}
            <div className="col-md-8">
              <h2 className="display-5 fw-bold mb-3">{event.title}</h2>
              <p className="lead text-secondary">{event.description || "Açıklama bulunmuyor."}</p>
              
              <div className="mt-4">
                <p className="mb-2"><strong className="text-info">📍 Mekan:</strong> {event.venue}, {event.city}</p>
                <p className="mb-2"><strong className="text-warning">📅 Tarih:</strong> {event.dateTime ? new Date(event.dateTime).toLocaleString("tr-TR") : "-"}</p>
              </div>
            </div>

            {/* Sağ Taraf: Fiyat ve Buton */}
            <div className="col-md-4 text-md-end border-start border-secondary ps-md-5 mt-4 mt-md-0 d-flex flex-column justify-content-center">
              <div className="mb-4">
                <span className="d-block text-secondary small">Bilet Fiyatı</span>
                <span className="display-6 fw-bold text-success">{event.price} ₺</span>
              </div>
              
              <button 
                className="btn btn-success btn-lg w-100 py-3 fw-bold"
                onClick={() => setShowModal(true)} // Butona basınca Modalı aç
              >
                🎟️ Bilet Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Eğer showModal true ise ekrana gelir */}
      {showModal && (
        <TicketModal 
          event={event} 
          onClose={() => setShowModal(false)} // Kapatma
          onConfirm={handlePurchase}          // Satın alma işlemi
        />
      )}

    </div>
  );
}

export default EventDetail;