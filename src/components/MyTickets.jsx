import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';

function MyTickets({ onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        // Backend'de bu endpoint yoksa hata alacağız, sonra düzelteceğiz
        const response = await apiClient.get("/api/tickets/mine"); 
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
      {/* Üst Başlık ve Geri Butonu */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">
          ← Geri
        </button>
        <h2 className="mb-0">🎟️ Biletlerim</h2>
      </div>

      {/* Durum Yönetimi */}
      {loading && <div className="text-center text-secondary">Biletler aranıyor...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && !error && tickets.length === 0 && (
        <div className="text-center py-5 text-muted border border-secondary rounded">
          <p className="fs-5">Henüz hiç bilet almamışsın.</p>
          <button onClick={onBack} className="btn btn-primary">Hemen Bir Etkinlik Seç!</button>
        </div>
      )}

      {/* Bilet Listesi */}
      <div className="row g-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="col-md-6 col-lg-4">
            <div className="card bg-dark border-secondary text-white h-100 shadow">
              <div className="card-header border-secondary d-flex justify-content-between align-items-center">
                <span className="badge bg-success">Satın Alındı</span>
                <small className="text-muted">#{ticket.ticketCode || ticket.id}</small>
              </div>
              <div className="card-body">
                <h5 className="card-title text-info">
                  {ticket.eventName || ticket.event?.title || "Etkinlik Adı Yükleniyor"}
                </h5>
                <p className="card-text small text-secondary mb-2">
                  Kişi: {ticket.customerName || "İsimsiz"}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="fw-bold">{ticket.quantity || 1} Adet</span>
                  <span className="text-warning fw-bold">
                    {ticket.totalPrice || (ticket.price * ticket.quantity) || "-"} ₺
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