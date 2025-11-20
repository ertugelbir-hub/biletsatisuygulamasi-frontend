import React from 'react';

function AdminPanel({ onBack }) {
  return (
    <div className="container text-white">
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-outline-secondary me-3">
          ← Ana Menü
        </button>
        <h2 className="mb-0">👔 Yönetici Paneli</h2>
      </div>

      <div className="p-5 bg-dark border border-warning rounded text-center">
        <h3 className="text-warning">🚧 Yapım Aşamasında</h3>
        <p className="lead">Buradan yeni konserler ekleyip silebileceksiniz.</p>
      </div>
    </div>
  );
}

export default AdminPanel;