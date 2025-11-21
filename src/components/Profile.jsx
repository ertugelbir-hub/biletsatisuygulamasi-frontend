import React from 'react';

function Profile({ onBack }) {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <div className="container text-white" style={{ maxWidth: '800px' }}>
      {/* Başlık ve Geri Butonu */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">
          ← Geri
        </button>
        <h2 className="mb-0">👤 Profilim</h2>
      </div>

      <div className="row g-4">
        {/* SOL TARAFI: KULLANICI KARTI */}
        <div className="col-md-4">
          <div className="card bg-dark border-secondary text-center p-4 shadow">
            <div className="mb-3">
              {/* Profil Resmi (Temsili Emoji) */}
              <div 
                className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center fw-bold text-dark"
                style={{ width: '100px', height: '100px', fontSize: '3rem' }}
              >
                {username ? username.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            <h4 className="text-info">{username}</h4>
            <span className={`badge ${role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} mb-3`}>
              {role}
            </span>
            <p className="text-muted small">Üyelik Durumu: Aktif</p>
          </div>
        </div>

        {/* SAĞ TARAF: BİLGİLER VE AYARLAR */}
        <div className="col-md-8">
          <div className="card bg-dark border-secondary p-4 shadow">
            <h5 className="border-bottom border-secondary pb-2 mb-4 text-warning">Hesap Ayarları</h5>
            
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label className="form-label text-secondary">Kullanıcı Adı</label>
                <input type="text" className="form-control bg-secondary text-white border-0" value={username} disabled />
                <div className="form-text text-muted">Kullanıcı adı değiştirilemez.</div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-secondary">Yeni Şifre</label>
                  <input type="password" class="form-control bg-dark text-white border-secondary" placeholder="******" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-secondary">Şifre Tekrar</label>
                  <input type="password" class="form-control bg-dark text-white border-secondary" placeholder="******" />
                </div>
              </div>

              <div className="text-end mt-3">
                <button className="btn btn-success disabled">Güncelle (Yakında)</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;