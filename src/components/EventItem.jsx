import React from 'react';

function EventItem({ event, onSelect }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm bg-light text-dark">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold mb-2">{event.title}</h5>
          
          <p className="mb-1 text-muted">
            {event.city} {event.venue ? `• ${event.venue}` : ""}
          </p>
          
          <p className="mb-2 small text-muted">
             {event.dateTime ? new Date(event.dateTime).toLocaleString("tr-TR") : "Tarih yok"}
          </p>

          <p className="mb-2">
            <span className="fw-semibold">Fiyat: </span>
            {event.price != null ? `${event.price} ₺` : "Belirsiz"}
          </p>

          <button 
            className="btn btn-primary w-100 mt-auto"
            onClick={() => onSelect(event)} 
          >
            İncele
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventItem;