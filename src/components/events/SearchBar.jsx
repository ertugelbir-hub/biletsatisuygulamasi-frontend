import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
function SearchBar({ onSearch }) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    
    q: "",      // Arama kelimesi (Backend 'q' bekliyor)
    city: "",   // Şehir
    type: ""    // Tür
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filtreleri üst bileşene (App.jsx) gönder
    onSearch(filters);
  };

  const handleClear = () => {
    const emptyFilters = { q: "", city: "", type: "" };
    setFilters(emptyFilters);
    onSearch(emptyFilters); // Temizlenmiş haliyle arama yap (tümünü getir)
  };

  return (
    <div className="card bg-dark border-secondary mb-4 p-3 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="row g-2 align-items-center">
          
          {/* Kelime Arama */}
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-secondary text-white border-secondary">🔍</span>
              <input 
                type="text" 
                name="q" 
                className="form-control bg-dark text-white border-secondary" 
                placeholder="Etkinlik ara..." 
                value={filters.q}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Şehir Seçimi */}
          <div className="col-md-3">
            <select 
              name="city" 
              className="form-select bg-dark text-white border-secondary" 
              value={filters.city}
              onChange={handleChange}
            >
              <option value="">{t('search.allCities')}</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Antalya">Antalya</option>
            </select>
          </div>

          {/* Tür Seçimi */}
          <div className="col-md-3">
            <select 
              name="type" 
              className="form-select bg-dark text-white border-secondary" 
              value={filters.type}
              onChange={handleChange}
            >
              <option value="">{t('search.allEvents')}</option>
              <option value="Concert">Konser</option>
              <option value="Theatre">Tiyatro</option>
              <option value="Cinema">Sinema</option>
              <option value="Sport">Spor</option>
            </select>
          </div>

          {/* Butonlar */}
          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary w-100">{t('search.button')}</button>
            {(filters.q || filters.city || filters.type) && (
                <button type="button" onClick={handleClear} className="btn btn-outline-secondary">X</button>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}

export default SearchBar;