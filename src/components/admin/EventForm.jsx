import React, { useState, useEffect } from 'react';

function EventForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "", 
    city: "", 
    venue: "", 
    type: "Concert",
    dateTime: "",
    totalSeats: 100, 
    price: 0,
    imageUrl: ""
  });

 useEffect(() => {
    if (initialData) {
      // Backend'den gelen "2025-12-10T20:00:00" formatını
      // inputun istediği "2025-12-10T20:00" haline (ilk 16 karakter) getiriyoruz.
      const formattedDate = initialData.dateTime 
        ? initialData.dateTime.substring(0, 16) 
        : "";

      setFormData({
        ...initialData,
        dateTime: formattedDate
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card bg-dark border-secondary shadow-lg">
      <div className="card-body p-4">
        <h4 className="mb-4 text-warning">
            {initialData ? "✏️ Etkinliği Düzenle" : "➕ Yeni Etkinlik Ekle"}
        </h4>
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-md-12">
                    <label className="form-label">Etkinlik Adı</label>
                    <input 
                        type="text" name="title" 
                        className="form-control bg-secondary text-white border-0" 
                        placeholder="Örn: Tarkan Konseri" // <-- EKLENDİ
                        value={formData.title} onChange={handleChange} required 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Şehir</label>
                    <input 
                        type="text" name="city" 
                        className="form-control bg-secondary text-white border-0" 
                        placeholder="Örn: İstanbul" // <-- EKLENDİ
                        value={formData.city} onChange={handleChange} required 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Mekan</label>
                    <input 
                        type="text" name="venue" 
                        className="form-control bg-secondary text-white border-0" 
                        placeholder="Örn: Harbiye Açık Hava" // <-- EKLENDİ
                        value={formData.venue} onChange={handleChange} required 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Tarih</label>
                    <input type="datetime-local" name="dateTime" className="form-control bg-secondary text-white border-0" value={formData.dateTime} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Tür</label>
                    <select name="type" className="form-select bg-secondary text-white border-0" value={formData.type} onChange={handleChange}>
                        <option value="Concert">Konser</option>
                        <option value="Theatre">Tiyatro</option>
                        <option value="Cinema">Sinema</option>
                        <option value="Sport">Spor</option>
                    </select>
                </div>
                <div className="col-md-12">
                    <label className="form-label text-secondary small">Afiş Resmi (URL)</label>
                    <input 
                        type="text" name="imageUrl" 
                        className="form-control bg-dark text-white border-secondary" 
                        placeholder="https://ornek.com/resim.jpg (Boş bırakırsan rastgele atanır)" 
                        value={formData.imageUrl || ""} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label text-secondary small">Kapasite</label>
                    <div className="input-group">
                        <span className="input-group-text bg-secondary text-warning border-0">🔢</span>
                        <input 
                            type="number" name="totalSeats" 
                            className="form-control bg-dark text-white border-secondary" 
                            placeholder="100" // <-- EKLENDİ
                            value={formData.totalSeats} onChange={handleChange} required 
                        />
                        <span className="input-group-text bg-secondary text-white border-0">Adet</span>
                    </div>
                </div>
                
                <div className="col-md-6">
                    <label className="form-label text-secondary small">Fiyat</label>
                    <div className="input-group">
                        <span className="input-group-text bg-secondary text-success border-0">💲</span>
                        <input 
                            type="number" name="price" step="0.01" 
                            className="form-control bg-dark text-white border-secondary" 
                            placeholder="150.00" // <-- EKLENDİ
                            value={formData.price} onChange={handleChange} required 
                        />
                        <span className="input-group-text bg-secondary text-white border-0">₺</span>
                    </div>
                </div>
                <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-warning w-100 fw-bold py-2">
                        {initialData ? "Değişiklikleri Kaydet" : "Oluştur ve Yayınla"}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;