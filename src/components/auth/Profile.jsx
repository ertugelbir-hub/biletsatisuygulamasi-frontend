import React, { useState } from 'react';
import apiClient from '../../apiClient'; // Yola dikkat et (../../)
import { toast } from 'react-toastify';

function Profile({ onBack }) {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  // Şifre State'leri
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Yeni şifreler uyuşmuyor!");
      return;
    }

    setLoading(true);
    try {
      // Backend'e istek at
      await apiClient.post("/api/auth/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      toast.success("✅ Şifreniz başarıyla değiştirildi!");
      // Formu temizle
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });

    } catch (error) {
      const msg = error.response?.data?.message || "Şifre değiştirilemedi.";
      // Backend 'Mevcut şifre yanlış' derse burada yakalarız
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-white" style={{ maxWidth: '800px' }}>
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">← Geri</button>
        <h2 className="mb-0">👤 Profilim</h2>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card bg-dark border-secondary text-center p-4 shadow">
            <div className="mb-3">
              <div className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center fw-bold text-dark" style={{ width: '100px', height: '100px', fontSize: '3rem' }}>
                {username ? username.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            <h4 className="text-info">{username}</h4>
            <span className={`badge ${role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} mb-3`}>{role}</span>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card bg-dark border-secondary p-4 shadow">
            <h5 className="border-bottom border-secondary pb-2 mb-4 text-warning">Şifre Değiştir</h5>
            
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label text-secondary">Mevcut Şifre</label>
                <input 
                  type="password" name="oldPassword"
                  className="form-control bg-dark text-white border-secondary" 
                  value={passwords.oldPassword} onChange={handleChange} required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-secondary">Yeni Şifre</label>
                  <input 
                    type="password" name="newPassword"
                    className="form-control bg-dark text-white border-secondary" 
                    value={passwords.newPassword} onChange={handleChange} required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-secondary">Şifre Tekrar</label>
                  <input 
                    type="password" name="confirmPassword"
                    className="form-control bg-dark text-white border-secondary" 
                    value={passwords.confirmPassword} onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="text-end mt-3">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;