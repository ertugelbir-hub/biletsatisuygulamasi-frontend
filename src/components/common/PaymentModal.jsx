import React, { useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css'; // Senin çalışan CSS yolun
import { toast } from 'react-toastify';

const PaymentModal = ({ totalAmount, onClose, onConfirm }) => {
  const [state, setState] = useState({
    number: '',
    name: '',
    cvc: '',
    focus: '',
    expiryMonth: '', // Dropdown için ay
    expiryYear: ''   // Dropdown için yıl
  });

  // 1️⃣ KART NUMARASI KONTROLÜ (Sadece Rakam)
  const handleNumberChange = (e) => {
    // Sadece rakamları al, harfleri ve sembolleri sil
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 16) {
      setState((prev) => ({ ...prev, number: val }));
    }
  };

  // 2️⃣ İSİM KONTROLÜ (Sadece Harf)
  const handleNameChange = (e) => {
    const val = e.target.value;
    // Sadece harf ve boşluk kabul et (Türkçe karakter dahil)
    if (val === '' || /^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/.test(val)) {
      setState((prev) => ({ ...prev, name: val.toUpperCase() }));
    }
  };

  // 3️⃣ GENEL INPUT VE ODAKLANMA (Ay, Yıl, CVC için)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "cvc" && value.length > 3) return; // CVC max 3 hane
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputFocus = (evt) => {
    setState((prev) => ({ ...prev, focus: evt.target.name }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!state.number || state.number.length < 16 || !state.name || !state.expiryMonth || !state.expiryYear || !state.cvc) {
        toast.warning("Lütfen tüm kart bilgilerini eksiksiz doldurunuz!");
        return;
    }
    onConfirm();
  };

  // Yıl Listesi (Bu yıl + 10 yıl)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card bg-dark text-white border-secondary shadow-lg p-4" style={{ width: '450px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 text-warning">💳 Güvenli Ödeme</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {/* KART GÖRSELİ (SENİN İSTEDİĞİN KISIM) */}
        <div className="mb-4">
            <Cards
            number={state.number}
            name={state.name}
            expiry={`${state.expiryMonth}${state.expiryYear.slice(-2)}`} // Ay ve Yılı birleştirip görsele veriyoruz
            cvc={state.cvc}
            focused={state.focus}
            placeholders={{ name: 'ADINIZ SOYADINIZ' }}
            locale={{ valid: 'SKT' }}
            />
        </div>

        <form onSubmit={handleSubmit}>
            {/* KART NUMARASI */}
            <div className="mb-3">
                <input
                    type="tel" // 'number' yerine 'tel' yaptık, artık 'e' yazılamaz
                    name="number"
                    className="form-control bg-secondary text-white border-0"
                    placeholder="Kart Numarası (16 Hane)"
                    value={state.number}
                    onChange={handleNumberChange} // Özel kontrol
                    onFocus={handleInputFocus}
                />
            </div>

            {/* İSİM SOYİSİM */}
            <div className="mb-3">
                <input
                    type="text"
                    name="name"
                    className="form-control bg-secondary text-white border-0"
                    placeholder="Kart Üzerindeki İsim"
                    value={state.name}
                    onChange={handleNameChange} // Özel kontrol
                    onFocus={handleInputFocus}
                />
            </div>

            <div className="row mb-4">
                {/* SKT - AY ve YIL SEÇİMİ (DROPDOWN) */}
                <div className="col-8">
                    <div className="d-flex gap-2">
                        <select 
                            name="expiryMonth" 
                            className="form-select bg-secondary text-white border-0"
                            value={state.expiryMonth}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        >
                            <option value="" disabled>Ay</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        
                        <select 
                            name="expiryYear" 
                            className="form-select bg-secondary text-white border-0"
                            value={state.expiryYear}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        >
                            <option value="" disabled>Yıl</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* CVC */}
                <div className="col-4">
                    <input
                        type="tel"
                        name="cvc"
                        className="form-control bg-secondary text-white border-0 text-center"
                        placeholder="CVC"
                        maxLength={3}
                        value={state.cvc}
                        onChange={(e) => {
                             // Sadece rakam girilsin
                             const val = e.target.value.replace(/\D/g, '');
                             if(val.length <= 3) setState(prev => ({...prev, cvc: val}));
                        }}
                        onFocus={handleInputFocus}
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-success w-100 fw-bold py-2">
                {totalAmount} Öde ve Bitir ✅
            </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;