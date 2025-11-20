import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';

function MyTickets({ onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const response = await apiClient.get("/api/tickets/my");
        setTickets(response.data);
      } catch (err) {
        console.error("Biletler çekilemedi:", err);
        setError("Biletlerin yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, []);

  return (
    <div className="container text-white">
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">
          ← Geri
        </button>
        <h2 className="mb-0">🎟️ Biletlerim</h2>
      </div>

      {loading && <div className="text-center text-secondary">Biletler aranıyor...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && !error && tickets.length === 0 && (
        <div className="text-center py-5 text-muted border border-secondary rounded">
          <p className="fs-5">Henüz hiç bilet almamışsın.</p>
          <button onClick={onBack} className="btn btn-primary">Hemen Bir Etkinlik Seç!</button>
        </div>
      )}

      <div className="row g-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="col-md-6 col-lg-4">
            <div className="card bg-dark border-secondary text-white h-100 shadow">
              <div className="card-header border-secondary d-flex justify-content-between align-items-center">
                <span className="badge bg-success">Satın Alındı</span>
                <small className="text-muted">#{ticket.id}</small>
              </div>
              <div className="card-body">
                <h5 className="card-title text-info">
                  {ticket.event ? ticket.event.title : "Etkinlik Bilgisi Yok"}
                </h5>
                <p className="card-text small text-secondary mb-2">
                  {/* DÜZELTME 1: username'i gösteriyoruz */}
                  Kullanıcı: {ticket.username || localStorage.getItem("username")}
                </p>
                
                {ticket.event && (
                   <p className="card-text small text-muted mb-2">
                     📅 {new Date(ticket.event.dateTime).toLocaleString("tr-TR")}
                   </p>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3 border-top border-secondary pt-2">
                  <span className="fw-bold">{ticket.quantity} Adet</span>
                  <span className="text-warning fw-bold fs-5">
                    {/* DÜZELTME 2: Fiyatı event içinden alıp hesaplıyoruz */}
                    {ticket.event && ticket.event.price 
                      ? (ticket.event.price * ticket.quantity) 
                      : "-"} ₺
                  </span>
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