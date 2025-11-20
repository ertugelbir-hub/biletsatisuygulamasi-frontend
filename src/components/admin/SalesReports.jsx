import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';

function SalesReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalSold: 0, totalEvents: 0 });

  // Backend'den raporu çek
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Backend'deki hazır endpoint: /api/reports/sales/full
        const response = await apiClient.get("/api/reports/sales/full");
        const data = response.data;
        setReports(data);

        // Basitçe toplamları hesapla
        const totalRev = data.reduce((acc, item) => acc + (item.revenueAllTime || 0), 0);
        const totalTix = data.reduce((acc, item) => acc + (item.soldAllTime || 0), 0);
        
        setSummary({
          totalRevenue: totalRev,
          totalSold: totalTix,
          totalEvents: data.length
        });

      } catch (error) {
        console.error("Rapor hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Dosya indirme fonksiyonu (CSV veya PDF)
  const handleDownload = async (type) => {
    try {
      const endpoint = type === 'pdf' ? '/api/reports/sales/full.pdf' : '/api/reports/sales/full.csv';
      
      // Axios ile blob (dosya) olarak çekiyoruz
      const response = await apiClient.get(endpoint, { responseType: 'blob' });
      
      // Tarayıcıya indirme linki oluşturup tıklatıyoruz
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satis_raporu.${type}`); // Dosya adı
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("İndirme başarısız: " + error.message);
    }
  };

  if (loading) return <div className="text-center text-white mt-5">Veriler analiz ediliyor...</div>;

  return (
    <div>
      {/* --- ÜST ÖZET KARTLARI --- */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <h6 className="card-title opacity-75">Toplam Ciro</h6>
              <h2 className="fw-bold">{summary.totalRevenue.toLocaleString('tr-TR')} ₺</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <h6 className="card-title opacity-75">Toplam Satılan Bilet</h6>
              <h2 className="fw-bold">{summary.totalSold} Adet</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark h-100">
            <div className="card-body text-center">
              <h6 className="card-title opacity-75">Aktif Etkinlik</h6>
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

      {/* --- DETAYLI TABLO --- */}
      <div className="table-responsive">
        <table className="table table-dark table-striped border-secondary">
          <thead>
            <tr>
              <th>Etkinlik Adı</th>
              <th className="text-end">Kapasite</th>
              <th className="text-end">Satılan</th>
              <th className="text-end">Kalan</th>
              <th className="text-end">Gelir</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((row) => (
              <tr key={row.eventId}>
                <td className="text-info fw-bold">{row.title}</td>
                <td className="text-end">{row.totalSeats}</td>
                <td className="text-end">{row.soldAllTime}</td>
                <td className="text-end">
                    <span className={`badge ${row.remaining < 5 ? 'bg-danger' : 'bg-secondary'}`}>
                        {row.remaining}
                    </span>
                </td>
                <td className="text-end text-success fw-bold">
                    {row.revenueAllTime ? row.revenueAllTime.toLocaleString('tr-TR') : 0} ₺
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted">Veri yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesReports;