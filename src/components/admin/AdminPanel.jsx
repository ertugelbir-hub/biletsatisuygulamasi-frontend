import React, { useState, useEffect } from 'react';
import apiClient from "../../apiClient";
import EventTable from './EventTable'; // Tablo bileşenini çağırdık
import EventForm from './EventForm';   // Form bileşenini çağırdık
import SalesReports from './SalesReports';
import TicketManager from './TicketManager';
import UserManager from './UserManager';
function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState("list");
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // Düzenlenecek veri

  // --- API İŞLEMLERİ ---
  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/api/events");
      setEvents(response.data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)));
    } catch (error) {
      console.error("Liste hatası:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchEvents();
  }, [activeTab]);

  const handleSave = async (formData) => {
    try {
      if (editingEvent) {
        await apiClient.put(`/api/events/${editingEvent.id}`, formData);
        setMessage({ type: "success", text: "✅ Güncelleme başarılı!" });
      } else {
        await apiClient.post("/api/events", formData);
        setMessage({ type: "success", text: "✅ Kayıt başarılı!" });
      }
      
      // İşlem bitince listeye dön
      setEditingEvent(null);
      setTimeout(() => setActiveTab("list"), 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Hata oluştu.";
      setMessage({ type: "danger", text: `❌ ${errorMsg}` });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;
    try {
      await apiClient.delete(`/api/events/${id}`);
      setMessage({ type: "success", text: "🗑️ Silindi." });
      fetchEvents();
    } catch (error) {
      setMessage({ type: "danger", text: "Silinemedi." });
    }
  };

  // --- GÖRÜNÜM ---
  return (
    <div className="container text-white pb-5">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
          <button onClick={onBack} className="btn btn-outline-secondary me-3">← Çıkış</button>
          <h2 className="mb-0">👔 Yönetici Paneli</h2>
      </div>

      {/* Mesaj */}
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Sekmeler */}
      <ul className="nav nav-tabs mb-4 border-secondary">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "list" ? "active bg-dark text-warning border-secondary border-bottom-0" : "text-secondary"}`} 
            onClick={() => { setActiveTab("list"); setEditingEvent(null); }}
          >
            📋 Liste
            
          </button>       
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "form" ? "active bg-dark text-warning border-secondary border-bottom-0" : "text-secondary"}`} 
            onClick={() => { setEditingEvent(null); setActiveTab("form"); }}
          >
            ➕ Yeni Ekle
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "reports" ? "active bg-dark text-warning border-secondary border-bottom-0" : "text-secondary"}`} 
            onClick={() => setActiveTab("reports")}
          >
            📊 Raporlar
          </button>
        </li>
        <li className="nav-item">
      <button 
        className={`nav-link ${activeTab === "tickets" ? "active bg-dark text-warning border-secondary border-bottom-0" : "text-secondary"}`} 
        onClick={() => setActiveTab("tickets")}
      >
        🎫 Biletler
      </button>
    </li>
    <li className="nav-item">
      <button 
        className={`nav-link ${activeTab === "users" ? "active bg-dark text-warning border-secondary border-bottom-0" : "text-secondary"}`} 
        onClick={() => setActiveTab("users")}
      >
        👥 Üyeler
      </button>
    </li>
      </ul>

      {/* İÇERİK: Ne kadar temiz durduğuna bak 👇 */}
      {activeTab === "list" ? (
        <EventTable 
          events={events} 
          onDelete={handleDelete} 
          onEdit={(event) => {
             setEditingEvent(event);
             setActiveTab("form");
          }} 
        />
      ) : activeTab === "form" ? (
        <EventForm 
          initialData={editingEvent} 
          onSubmit={handleSave} 
        />
      ) :activeTab === "reports" ? (
        // Raporlar Sekmesi
        <SalesReports />
      ):activeTab === "tickets" ?(
     <TicketManager />    // <--- YENİ
  ) : (
     <UserManager />      // <--- YENİ
  )
      }
    </div>
  );
}

export default AdminPanel;