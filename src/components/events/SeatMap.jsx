import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';

function SeatMap({ eventId, onSelectionChange }) {
  const [seats, setSeats] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Koltukları Backend'den Çek
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await apiClient.get(`/api/events/${eventId}/seats`);
        setSeats(res.data);
      } catch (error) {
        console.error("Koltuklar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [eventId]);

  // 2. Koltuk Seçme/Bırakma Mantığı
  const toggleSeat = (seat) => {
    if (seat.sold) return; // Doluysa dokunma

    let newSelection;
    if (selectedIds.includes(seat.id)) {
      // Zaten seçiliyse çıkar
      newSelection = selectedIds.filter(id => id !== seat.id);
    } else {
      // Seçili değilse ekle
      newSelection = [...selectedIds, seat.id];
    }

    setSelectedIds(newSelection);
    onSelectionChange(newSelection); // Üst bileşene (EventDetail) haber ver
  };

  if (loading) return <div className="text-white">Koltuklar yükleniyor...</div>;

  // 3. Koltukları Sıralara Göre Grupla (A: [s1, s2], B: [s3, s4]...)
  const rows = {};
  seats.forEach(seat => {
    if (!rows[seat.rowName]) rows[seat.rowName] = [];
    rows[seat.rowName].push(seat);
  });

  return (
    <div className="card bg-dark border-secondary mb-4">
      <div className="card-header text-white border-secondary">
        <h5 className="mb-0">💺 Sahne / Koltuk Seçimi</h5>
      </div>
      <div className="card-body">
        
        {/* Sahne Görseli */}
        <div className="w-100 bg-secondary text-white text-center py-2 mb-4 rounded" style={{ letterSpacing: '5px' }}>
            SAHNE
        </div>

        <div className="d-flex flex-column align-items-center gap-3">
          {Object.keys(rows).map(rowName => (
            <div key={rowName} className="d-flex align-items-center gap-2">
              {/* Sıra İsmi */}
              <span className="text-muted fw-bold" style={{ width: '30px' }}>{rowName}</span>
              
              {/* O sıradaki koltuklar */}
              <div className="d-flex gap-2">
                {rows[rowName].map(seat => {
                  const isSelected = selectedIds.includes(seat.id);
                  const isSold = seat.sold;

                  // Renk Ayarı
                  let btnClass = "btn-outline-light"; // Boş
                  if (isSold) btnClass = "btn-danger disabled"; // Dolu (Kırmızı)
                  else if (isSelected) btnClass = "btn-success"; // Seçili (Yeşil)

                  return (
                    <button
                      key={seat.id}
                      className={`btn btn-sm ${btnClass}`}
                      style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
                      onClick={() => toggleSeat(seat)}
                      disabled={isSold}
                      title={isSold ? "Dolu" : `${rowName}-${seat.seatNumber}`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Alt Bilgi (Legend) */}
        <div className="d-flex justify-content-center gap-4 mt-4 small text-white">
            <div className="d-flex align-items-center gap-1"><div className="bg-light border rounded" style={{width: 15, height: 15}}></div> Boş</div>
            <div className="d-flex align-items-center gap-1"><div className="bg-success rounded" style={{width: 15, height: 15}}></div> Seçili</div>
            <div className="d-flex align-items-center gap-1"><div className="bg-danger rounded" style={{width: 15, height: 15}}></div> Dolu</div>
        </div>

      </div>
    </div>
  );
}

export default SeatMap;