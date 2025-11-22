import React from 'react';

function EventItem({ event, onSelect }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: "#ffffff" }}>
        <div style={{ height: "200px", overflow: "hidden" }}>
            <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-100 h-100" 
                style={{ objectFit: "cover" }} 
            />
        </div>
        <div className="card-body d-flex flex-column text-dark">
          <h5 className="card-title fw-bold mb-2">{event.title}</h5>
          
          <p className="mb-1 text-secondary">
            {event.city} • {event.venue}
          </p>
          
          <p className="mb-3 small text-muted">
             {event.dateTime ? new Date(event.dateTime).toLocaleString("tr-TR") : "Tarih yok"}
          </p>

          <div className="mt-auto">
            <h6 className="fw-bold text-black mb-3">Fiyat: {event.price} ₺</h6>
            
            <button 
              className="btn btn-primary w-100 fw-bold"
              onClick={() => onSelect(event)} 
            >
              İncele
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventItem;