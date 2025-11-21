import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';
import { toast } from 'react-toastify';
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
      const errorMsg = error.response?.data?.message || "İptal işlemi başarısız.";
      toast.error(`❌ ${errorMsg}`);
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
                <small className="text-muted">Bilet #{ticket.id}{ticket.id}</small>
              </div>
              {/* Body */}
              <div className="card-body d-flex flex-column-body">
                <h5 className="card-title text-info">
                  {ticket.event ? ticket.event.title : "Etkinlik Bilgisi Yok"}
                </h5>
                <p className="card-text small text-secondary mb-2">                 
                  Kullanıcı: {ticket.username}
                </p>
                
                {ticket.event && (
                   <p className="card-text small text-muted mb-3">
                    📍 {ticket.event.city} <br/>
                     📅 {new Date(ticket.event.dateTime).toLocaleString("tr-TR")}
                   </p>
                )}

                <div className="mt-auto border-top border-secondary pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold">{ticket.quantity} Adet</span>
                  <span className="text-warning fw-bold fs-5">                    
                    {ticket.event && ticket.event.price ? (ticket.event.price * ticket.quantity): "-"} ₺
                  </span>
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