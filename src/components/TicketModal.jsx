import { useState } from "react";

function TicketModal({ event, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Sadece adedi gönderiyoruz, isim zaten tokenda var
    onConfirm(quantity);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Bilet Satın Al: {event.title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              
              {/* GEREKSİZ İSİM ALANI SİLİNDİ */}
              
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
                <div className="form-text text-light mt-2">
                  Birim Fiyat: {event.price}₺ <br/>
                  <strong>Toplam Tutar: <span className="text-warning">{event.price * quantity}₺</span></strong>
                </div>
              </div>

            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Vazgeç</button>
              <button type="submit" className="btn btn-success">Onayla ve Satın Al</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default TicketModal;