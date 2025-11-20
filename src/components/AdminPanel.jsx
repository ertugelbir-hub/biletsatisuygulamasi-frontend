import React, { useState } from 'react';
import apiClient from '../apiClient';

function AdminPanel({ onBack }) {
  // Form verilerini tutacak State
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    venue: "",
    type: "Concert", // Varsayılan değer
    dateTime: "",
    totalSeats: 100,
    price: 0
  });

  const [message, setMessage] = useState(null); // Başarılı/Hatalı mesajı

  // Inputlar değişince state'i güncelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form gönderilince çalışacak fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Backend'e POST isteği at
      await apiClient.post("/api/events", formData);
      
      // Başarılı olursa
      setMessage({ type: "success", text: "✅ Etkinlik başarıyla oluşturuldu!" });
      
      // Formu temizle
      setFormData({
        title: "",
        city: "",
        venue: "",
        type: "Concert",
        dateTime: "",
        totalSeats: 100,
        price: 0
      });

    } catch (error) {
      console.error("Ekleme hatası:", error);
      // Backend'den gelen hatayı veya genel mesajı göster
      const errorMsg = error.response?.data?.message || "Etkinlik eklenirken bir hata oluştu.";
      setMessage({ type: "danger", text: `❌ Hata: ${errorMsg}` });
    }
  };

  return (
    <div className="container text-white pb-5">
      {/* Başlık ve Geri Butonu */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">
          ← Ana Menü
        </button>
        <h2 className="mb-0">👔 Yönetici Paneli</h2>
      </div>

      {/* Mesaj Kutusu */}
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* EKLEME FORMU KARTI */}
      <div className="card bg-dark border-warning shadow-lg">
        <div className="card-header border-warning text-warning fw-bold">
          ➕ Yeni Etkinlik Oluştur
        </div>
        <div className="card-body p-4">
          
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              
              {/* Başlık */}
              <div className="col-md-12">
                <label className="form-label">Etkinlik Adı</label>
                <input 
                  type="text" name="title" 
                  className="form-control bg-secondary text-white border-0" 
                  placeholder="Örn: Tarkan Konseri"
                  value={formData.title} onChange={handleChange} required 
                />
              </div>

              {/* Şehir & Mekan */}
              <div className="col-md-6">
                <label className="form-label">Şehir</label>
                <input 
                  type="text" name="city" 
                  className="form-control bg-secondary text-white border-0" 
                  placeholder="Örn: İstanbul"
                  value={formData.city} onChange={handleChange} required 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Mekan (Venue)</label>
                <input 
                  type="text" name="venue" 
                  className="form-control bg-secondary text-white border-0" 
                  placeholder="Örn: Harbiye Açık Hava"
                  value={formData.venue} onChange={handleChange} required 
                />
              </div>

              {/* Tarih & Tür */}
              <div className="col-md-6">
                <label className="form-label">Tarih ve Saat</label>
                <input 
                  type="datetime-local" name="dateTime" 
                  className="form-control bg-secondary text-white border-0" 
                  value={formData.dateTime} onChange={handleChange} required 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Etkinlik Türü</label>
                <select 
                  name="type" 
                  className="form-select bg-secondary text-white border-0"
                  value={formData.type} onChange={handleChange}
                >
                  <option value="Concert">Konser</option>
                  <option value="Theatre">Tiyatro</option>
                  <option value="Cinema">Sinema</option>
                  <option value="Sport">Spor</option>
                </select>
              </div>

             {/* Kapasite (Koltuk Sayısı) */}
              <div className="col-md-6">
                <label className="form-label text-secondary small">Toplam Kapasite</label>
                <div className="input-group">
                  <span className="input-group-text bg-secondary text-warning border-0">🔢</span>
                  <input 
                    type="number" name="totalSeats" min="1"
                    className="form-control bg-dark text-white border-secondary" 
                    placeholder="Örn: 500"
                    value={formData.totalSeats} onChange={handleChange} required 
                  />
                  <span className="input-group-text bg-secondary text-white border-0">Adet</span>
                </div>
              </div>

              {/* Fiyat */}
              <div className="col-md-6">
                <label className="form-label text-secondary small">Bilet Ücreti</label>
                <div className="input-group">
                  <span className="input-group-text bg-secondary text-success border-0">💲</span>
                  <input 
                    type="number" name="price" min="0" step="0.01"
                    className="form-control bg-dark text-white border-secondary" 
                    placeholder="Örn: 150.00"
                    value={formData.price} onChange={handleChange} required 
                  />
                  <span className="input-group-text bg-secondary text-white border-0">₺</span>
                </div>
              </div>

              {/* Kaydet Butonu */}
              <div className="col-12 mt-4">
                <button type="submit" className="btn btn-warning w-100 fw-bold py-2">
                  Kaydet ve Yayınla
                </button>
              </div>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default AdminPanel;