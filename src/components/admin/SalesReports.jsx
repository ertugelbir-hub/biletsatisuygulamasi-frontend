import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import { toast } from 'react-toastify';
function SalesReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalSold: 0, totalEvents: 0 });
// Tarih Filtreleri
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  // Backend'den raporu çek
 const fetchReports = async (filters = {}) => {
    setLoading(true);
      try {        
        const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      // Filtre var mı kontrolü (Başlangıç ve Bitiş doluysa filtre var demektir)
      const hasFilter = filters.from && filters.to;

        const response = await apiClient.get("/api/reports/sales/full", { params });
        const data = response.data;
        setReports(data);

        const totalRev = data.reduce((acc, item) => {
        // Filtre varsa sadece 'Range' değerini, yoksa 'AllTime' değerini al
        const val = hasFilter ? item.revenueRange : item.revenueAllTime;
        return acc + (val || 0);
      }, 0);

      const totalTix = data.reduce((acc, item) => {
        const val = hasFilter ? item.soldInRange : item.soldAllTime;
        return acc + (val || 0);
      }, 0);
        
        setSummary({
          totalRevenue: totalRev,
          totalSold: totalTix,
          totalEvents: data.length
        });

      } catch (error) {
        console.error("Rapor hatası:", error);
        toast.error("Rapor verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };
// Sayfa ilk açıldığında (Filtresiz - Tüm Zamanlar)
  useEffect(() => {
    fetchReports();
  }, []);
  // Filtreleme Butonu
  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports(dateRange);
    toast.info("Rapor filtrelendi.");
  };
  // Temizleme Butonu
  const handleClear = () => {
    setDateRange({ from: "", to: "" });
    fetchReports({}); // Parametresiz çağır (Tümü)
    toast.info("Filtre temizlendi.");
  };

  // Dosya indirme fonksiyonu (CSV veya PDF)
  const handleDownload = async (type) => {
    try {
      const endpoint = type === 'pdf' ? '/api/reports/sales/full.pdf' : '/api/reports/sales/full.csv';
      
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const response = await apiClient.get(endpoint, { 
        params, 
        responseType: 'blob' // Dosya verisi (binary) olarak çekiyoruz
      });
      
      // 1. Dosya Tipini Belirt (PDF mi CSV mi?)
      const mimeType = type === 'pdf' ? 'application/pdf' : 'text/csv';
      const blob = new Blob([response.data], { type: mimeType });

      // 2. İndirme Linki Oluştur
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 3. Dosya Adını Düzelt (Nokta ekledik: satis_raporu.pdf)
      link.setAttribute('download', `satis_raporu.${type}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Temizlik
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} indirildi.`);
    } catch (error) {
      console.error(error);
      toast.error("İndirme başarısız.");
    }
  };

  if (loading) return <div className="text-center text-white mt-5">Veriler analiz ediliyor...</div>;

  return (
    <div>
      {/* --- FİLTRE ALANI (YENİ) --- */}
      <div className="card bg-dark border-secondary mb-4 p-3">
        <form onSubmit={handleFilter}>
            <div className="row g-3 align-items-end">
                <div className="col-md-4">
                    <label className="text-secondary small mb-1">Başlangıç Tarihi</label>
                    <input 
                        type="datetime-local" 
                        className="form-control bg-secondary text-white border-0"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    />
                </div>
                <div className="col-md-4">
                    <label className="text-secondary small mb-1">Bitiş Tarihi</label>
                    <input 
                        type="datetime-local" 
                        className="form-control bg-secondary text-white border-0"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    />
                </div>
                <div className="col-md-4 d-flex gap-2">
                    <button type="submit" className="btn btn-primary flex-grow-1">🔍 Filtrele</button>
                    { (dateRange.from || dateRange.to) && 
                        <button type="button" onClick={handleClear} className="btn btn-outline-secondary">Temizle</button>
                    }
                </div>
            </div>
        </form>
      </div>

      {/* --- ÖZET KARTLARI --- */}
      {loading ? (
          <div className="text-center text-white py-5">Veriler hesaplanıyor...</div>
      ) : (
      <>
        <div className="row g-3 mb-4">
            <div className="col-md-4">
            <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                <h6 className="card-title opacity-75">Dönem Cirosu</h6>
                <h2 className="fw-bold">{summary.totalRevenue.toLocaleString('tr-TR')} ₺</h2>
                </div>
            </div>
            </div>
            <div className="col-md-4">
            <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                <h6 className="card-title opacity-75">Dönem Satışı</h6>
                <h2 className="fw-bold">{summary.totalSold} Adet</h2>
                </div>
            </div>
            </div>
            <div className="col-md-4">
            <div className="card bg-warning text-dark h-100">
                <div className="card-body text-center">
                <h6 className="card-title opacity-75">Rapordaki Etkinlik</h6>
                <h2 className="fw-bold">{summary.totalEvents}</h2>
                </div>
            </div>
            </div>
        </div>

        {/* --- İNDİRME BUTONLARI --- */}
        <div className="d-flex justify-content-end mb-3 gap-2">
            <button onClick={() => handleDownload('csv')} className="btn btn-outline-info btn-sm">
            📥 Excel (CSV) İndir
            </button>
            <button onClick={() => handleDownload('pdf')} className="btn btn-outline-danger btn-sm">
            📄 PDF İndir
            </button>
        </div>

        {/* --- TABLO --- */}
        <div className="table-responsive">
            <table className="table table-dark table-striped border-secondary">
            <thead>
                <tr>
                <th>Etkinlik Adı</th>
                <th className="text-end">Kapasite</th>
                <th className="text-end">Dönem Satışı</th>
                <th className="text-end">Tüm Zaman</th>
                <th className="text-end">Dönem Geliri</th>
                </tr>
            </thead>
            <tbody>
                {reports.map((row) => (
                <tr key={row.eventId}>
                    <td className="text-info fw-bold">{row.title}</td>
                    <td className="text-end">{row.totalSeats}</td>
                    <td className="text-end text-warning fw-bold">{row.soldInRange}</td>
                    <td className="text-end text-muted">{row.soldAllTime}</td>
                    <td className="text-end text-success fw-bold">
                        {row.revenueRange ? row.revenueRange.toLocaleString('tr-TR') : 0} ₺
                    </td>
                </tr>
                ))}
                {reports.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-muted">Bu tarih aralığında veri yok.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </>
      )}
    </div>
  );
}

export default SalesReports;