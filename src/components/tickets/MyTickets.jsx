import React, { useEffect, useState } from 'react';
import apiClient from "../../apiClient";
import { toast } from 'react-toastify';
import { getErrorMessage } from "../../utils/errorHelper";
function MyTickets({ onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  
   const fetchMyTickets = async () => {
    try {
      const response = await apiClient.get("/api/tickets/my");
      setTickets(response.data);
    } catch (err) {
      console.error("Biletler çekilemedi:", err);
      toast.error("Biletlerin yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };
     useEffect(() => {
     fetchMyTickets();
    }, []);
   const handleCancel = async (ticketId) => {
    if (!window.confirm("Bu bileti iptal etmek istediğine emin misin?")) return;

    try {
      await apiClient.delete(`/api/tickets/${ticketId}`);
      toast.success("✅ Bilet başarıyla iptal edildi.");
      
      // Listeyi yenile
      fetchMyTickets();
    } catch (error) {
      console.error("İptal hatası:", error);
      const msg = getErrorMessage(error);
      toast.error(`❌ ${msg}`);
    }
  };


  return (
    <div className="container text-white">
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">
          ← Geri
        </button>
        <h2 className="mb-0">🎟️ Biletlerim</h2>
      </div>

      {loading && <div className="text-center text-secondary">Biletler aranıyor...</div>}     
            
      {!loading && tickets.length === 0 && (
        <div className="text-center py-5 text-muted border border-secondary rounded">
          <p className="fs-5">Henüz hiç bilet almamışsın.</p>
          <button onClick={onBack} className="btn btn-primary">Hemen Bir Etkinlik Seç!</button>
        </div>
      )}

      <div className="row g-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="col-md-6 col-lg-4">
            <div className="card bg-dark border-secondary text-white h-100 shadow">
              {/* Header */}
              <div className="card-header border-secondary d-flex justify-content-between align-items-center">
                <span className="badge bg-success">Satın Alındı</span>
                <small className="text-muted">Bilet #{ticket.id}</small>
              </div>
              {/* Body */}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-info">
                  {ticket.event ? ticket.event.title : "Etkinlik Bilgisi Yok"}
                </h5>
                <p className="card-text small text-secondary mb-2">                 
                  Kullanıcı: {ticket.username}
                </p>
                
               {ticket.event && (
                   <div className="mb-3 small text-light opacity-75"> {/* Rengi açtık */}
                    <div className="mb-1">📍 {ticket.event.city}</div>
                    <div>📅 {new Date(ticket.event.dateTime).toLocaleString("tr-TR")}</div>
                   </div>
                )}

                <div className="mt-auto border-top border-secondary pt-3">

               {/* FİYAT HESAPLAMA ALANI */}
  <div className="d-flex justify-content-between align-items-end mb-3">
      {/* SOL: Adet ve Birim Fiyat Bilgisi */}
      <div className="d-flex flex-column">
          <span className="fw-bold text-white fs-5">{ticket.quantity} Adet</span>
          <small className="text-muted">
             (Tanesi: {ticket.price ? ticket.price : ticket.event.price} ₺)
          </small>
      </div>

      {/* SAĞ: Kocaman Toplam Fiyat (Adet * Fiyat) */}
      <div className="text-end">
          <span className="text-secondary small d-block">Toplam Ödenen</span>
          <span className="text-warning fw-bold display-6" style={{ fontSize: '1.8rem' }}>
              {/* ÇARPMA İŞLEMİ BURADA YAPILIYOR: */}
              { (ticket.quantity * (ticket.price || ticket.event.price)).toFixed(2) } ₺
          </span>
      </div>
  </div>
                {/* İPTAL BUTONU */}
                <button 
                        onClick={() => handleCancel(ticket.id)} 
                        className="btn btn-outline-danger w-100 btn-sm">
                        Bileti İptal Et (İade)
                        </button>
             </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTickets;