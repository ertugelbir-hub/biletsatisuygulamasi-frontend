import { useState } from "react";

function TicketModal({ event, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(""); // Şimdilik isim de alalım

  const handleSubmit = (e) => {
    e.preventDefault();
    // Girilen bilgileri üst bileşene gönder
    onConfirm(quantity, customerName);
  };

  return (
    // Arka planı karartan katman
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          
          {/* BAŞLIK */}
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Bilet Satın Al: {event.title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              
              {/* Ad Soyad Alanı */}
              <div className="mb-3">
                <label className="form-label">Adınız Soyadınız</label>
                <input 
                  type="text" 
                  className="form-control bg-secondary text-white border-0" 
                  required 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Adet Alanı */}
              <div className="mb-3">
                <label className="form-label">Bilet Adedi</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control bg-secondary text-white border-0" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
                <div className="form-text text-light">
                  Tanesi {event.price}₺ — Toplam: <span className="text-warning fw-bold">{event.price * quantity}₺</span>
                </div>
              </div>

            </div>

            {/* BUTONLAR */}
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>vazgeç</button>
              <button type="submit" className="btn btn-success">Satın Almayı Onayla</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default TicketModal;