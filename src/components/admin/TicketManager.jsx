import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';

function TicketManager() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      // Backend'deki 'listAll' metodu: GET /api/tickets
      const res = await apiClient.get("/api/tickets");
      setTickets(res.data);
    } catch (error) {
      console.error("Biletler çekilemedi", error);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Bu bileti iptal etmek (silmek) istediğine emin misin?")) return;
    try {
      await apiClient.delete(`/api/tickets/${id}`);
      alert("Bilet iptal edildi.");
      fetchTickets(); // Listeyi yenile
    } catch (error) {
      alert("Silinemedi: " + error.message);
    }
  };

  return (
    <div className="table-responsive">
      <h4 className="text-warning mb-3">🎫 Satılan Tüm Biletler</h4>
      <table className="table table-dark table-hover border-secondary">
        <thead>
          <tr>
            <th>ID</th>
            <th>Etkinlik</th>
            <th>Kullanıcı</th>
            <th>Adet</th>
            <th>Tarih</th>
            <th className="text-end">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              <td>#{t.id}</td>
              <td className="text-info">{t.event ? t.event.title : "Silinmiş Etkinlik"}</td>
              <td>{t.username}</td>
              <td>{t.quantity}</td>
              <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</td>
              <td className="text-end">
                <button onClick={() => handleDelete(t.id)} className="btn btn-sm btn-outline-danger">
                  İptal Et
                </button>
              </td>
            </tr>
          ))}
           {tickets.length === 0 && <tr><td colSpan="6" className="text-center text-muted">Satış yok.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default TicketManager;