function EventDetail({ event, onBack }) {
  if (!event) return null;

  return (
    <div className="container text-light mt-4">
      <button onClick={onBack} className="btn btn-outline-secondary mb-3">
        ← Listeye Dön
      </button>

      <div className="card bg-dark border-secondary text-light">
        <div className="card-body">
          <h2 className="card-title display-6">{event.title}</h2>
          <p className="text-muted fs-5">{event.description || "Açıklama bulunmuyor."}</p>
          
          <hr className="border-secondary"/>
          
          <div className="row">
            <div className="col-md-6">
                <p><strong>Şehir:</strong> {event.city}</p>
                <p><strong>Mekan:</strong> {event.venue}</p>
                <p><strong>Tarih:</strong> {event.dateTime ? new Date(event.dateTime).toLocaleString("tr-TR") : "-"}</p>
            </div>
            <div className="col-md-6 text-md-end">
                <h3 className="text-primary">{event.price} ₺</h3>
                <button className="btn btn-success btn-lg mt-3">Satın Al</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;