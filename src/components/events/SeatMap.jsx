import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
function SeatMap({ eventId, onSelectionChange }) {
  const [seats, setSeats] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  const parseHoldDate = (d) => {
    if (!d) return null;
    
    // Gelen metnin sonuna 'Z' (UTC) ekleyerek tarayıcıya "Bu saat İngiltere saatidir, sen bunu Türkiye'ye çevir" diyoruz.
    if (typeof d === 'string') {
        return new Date(d.endsWith('Z') ? d : d + 'Z');
    }
    
    return new Date(d);
  };
  // 1. Koltukları Backend'den Çek
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await apiClient.get(`/api/events/${eventId}/seats`);
        setSeats(res.data);
      } catch (error) {
        console.error("Koltuklar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [eventId]);

  // 2. ⚡ CANLI BAĞLANTI (Websocket) 
  useEffect(() => {
    // Backend'deki endpoint ile aynı olmalı (WebSocketConfig.java'da /ws tanımlıysa)
    const socket = new SockJS('http://localhost:8080/ws'); 
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    // Bağlan
    stompClient.connect({}, () => {
        console.log("🟢 Canlı Koltuk Takibi Başladı");

        // Backend'den gelen "/topic/events/{id}/seats" kanalını dinle
        stompClient.subscribe(`/topic/events/${eventId}/seats`, (message) => {     
            try {
                const incomingData = JSON.parse(message.body);               
                console.log("📡 BACKEND'DEN CANLI MESAJ GELDİ:", incomingData);
                

                // Backend bazen liste gönderiyor, bazen tek obje. Biz hepsini listeye çevirelim ki garanti olsun:
                const updatedSeatsList = Array.isArray(incomingData) ? incomingData : [incomingData];

                setSeats(prevSeats => {
                    // Mevcut koltuk listesini dönüyoruz
                    return prevSeats.map(seat => {
                        // Şu anki koltuk (seat), gelen güncellemeler listesinde (updatedSeatsList) var mı?
                        const matchingUpdate = updatedSeatsList.find(u => u.id === seat.id);
                        
                        // Varsa güncelle, yoksa eski halini bırak
                        if (matchingUpdate) {                           
                             return { ...seat, ...matchingUpdate };// Doğrudan sold=true yapıyoruz
                        }
                        return seat;
                    });
                });

            } catch (e) {
                console.error("❌ Mesaj işleme hatası:", e);
            }
       });
    }, (err) => {
        console.error("🔴 WebSocket Bağlantı Hatası:", err);
    });

    return () => {
        if (stompClient && stompClient.connected) stompClient.disconnect();
    };
}, [eventId]);
// ⏱️ KRONOMETRE VE OTOMATİK SEPET TEMİZLİĞİ
  useEffect(() => {
    // Eğer sepet boşsa (hiç koltuk seçmediysek) sayacı kapat ve durdur
    if (selectedIds.length === 0) {
        setTimeLeft(null);
        return;
    }

    // Her 1000 milisaniyede (1 saniye) bir çalışacak döngü
    const interval = setInterval(() => {
        let activeSelections = []; // Süresi henüz BİTMEMİŞ koltukları tutacağız
        let earliestExpiry = null; // En erken bitecek süreyi (sayacı ona göre kuracağız) bulacağız

        // Seçtiğimiz her bir koltuğu kontrol edelim
        selectedIds.forEach(id => {
            const seat = seats.find(s => s.id === id);
            if (seat) {
                const holdDate = parseHoldDate(seat.holdExpiresAt);
                
                // Eğer koltuğun süresi hala bitmemişse (gelecekteyse)
                if (holdDate && holdDate > new Date()) {
                    activeSelections.push(id); // Sepette tutmaya devam et
                    
                    // En erken bitecek olan koltuğun süresini bul
                    if (!earliestExpiry || holdDate < earliestExpiry) {
                        earliestExpiry = holdDate;
                    }
                }
            }
        });

        // EĞER TEMİZLİKÇİ ROBOT: Bir koltuğun süresi bittiyse onu sepetten (selectedIds) çıkar!
        if (activeSelections.length !== selectedIds.length) {
            setSelectedIds(activeSelections); // Kendi sepetimizi güncelle
            onSelectionChange(activeSelections); // Sağ taraftaki Cart (Sepet) bileşenini güncelle
        }

        // EKRANA YAZDIRMA: Kalan süreyi dakika ve saniye olarak hesapla
        if (earliestExpiry) {
            const now = new Date();
            const diff = earliestExpiry - now; // Kalan milisaniye
            
            if (diff > 0) {
                const m = Math.floor(diff / 60000); // Dakikayı bul
                const s = Math.floor((diff % 60000) / 1000); // Kalan saniyeyi bul
                // 9:5 yerine 09:05 yazsın diye padStart kullanıyoruz
                setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft("00:00");
            }
        } else {
            setTimeLeft(null);
        }

    }, 1000);

    // Kullanıcı sayfadan çıkarsa veya sepet değişirse eski sayacı hafızadan sil (temizlik)
    return () => clearInterval(interval);
  }, [selectedIds, seats, onSelectionChange]);

  // 3. Koltuk Seçme/Bırakma Mantığı
 const handleSeatClick = async (seat) => {
    if (seat.isSold || seat.sold) return; // Doluysa işlem yapma [cite: 13, 14]

    // A) Eğer koltuk zaten BİZİM tarafımızdan seçilmişse (Yeşilse) -> İPTAL ET (Unhold)
    if (selectedIds.includes(seat.id)) {
        try {
            await apiClient.post(`/api/tickets/events/${eventId}/seats/${seat.id}/unhold`);
            const newSelection = selectedIds.filter(id => id !== seat.id);
            setSelectedIds(newSelection);
            onSelectionChange(newSelection); // Sağ taraftaki bilet sepetini güncelle [cite: 14]
        } catch (error) {
            console.error("Seçim iptal hatası:", error);
        }
        return;       
    } 

    // B) Eğer koltuk boşsa -> REZERVE ET (Hold)
    try {
        // Backend'deki tam adres: /api/tickets/events/... [cite: 15]
        await apiClient.post(`/api/tickets/events/${eventId}/seats/${seat.id}/hold`);
        
        const newSelection = [...selectedIds, seat.id];
        setSelectedIds(newSelection);
        onSelectionChange(newSelection); // Sağ taraftaki bilet sepetini güncelle [cite: 16]
        
    } catch (error) {
        console.error("Rezerve hatası:", error);
        // Hata mesajını backend'den gelen cevaba göre göster [cite: 18]
        alert(error.response?.data || "Koltuk rezerve edilemedi! Başkası kapmış olabilir.");
    }
  };

  if (loading) return <div className="text-white">Koltuklar yükleniyor...</div>;

  // 4. Koltukları Sıralara Göre Grupla (A: [s1, s2], B: [s3, s4]...)
  const rows = {};
  seats.forEach(seat => {
    if (!rows[seat.rowName]) rows[seat.rowName] = [];
    rows[seat.rowName].push(seat);
  });

 return (
    <div className="card bg-dark border-secondary mb-4">
      <div className="card-header text-white border-secondary">
        <h5 className="mb-0">💺 Sahne / Koltuk Seçimi</h5>
      </div>
      <div className="card-body">
        
        <div className="w-100 bg-secondary text-white text-center py-2 mb-4 rounded" style={{ letterSpacing: '5px' }}>
            SAHNE
            {timeLeft && (
            <div className="alert alert-warning text-center fw-bold shadow-sm border-warning mb-4 py-2" style={{ letterSpacing: '2px' }}>
                <span className="fs-5">⏱️ Rezervasyon süreniz: </span>
                <span className="text-danger fs-3 ms-2">{timeLeft}</span>
            </div>
        )}
        </div>

        <div className="d-flex flex-column align-items-center gap-3">
          {Object.keys(rows).sort().map(rowName => (
            <div key={rowName} className="d-flex align-items-center gap-2">
              <span className="text-muted fw-bold" style={{ width: '30px' }}>{rowName}</span>
              
              <div className="d-flex gap-2">
                {rows[rowName].map(seat => {
                  const isSelected = selectedIds.includes(seat.id);
                  const isSold = seat.isSold || seat.sold;
                  
                  // Rezervasyon süresi kontrolü [cite: 24, 27]
                  const holdDate = parseHoldDate(seat.holdExpiresAt);
                  const isHeld = holdDate && holdDate > new Date();

                  // Renk Önceliği Mantığı [cite: 25, 26, 27, 28]
                  let btnClass = "btn-outline-light"; // Varsayılan: Boş
                  
                  if (isSold) {
                      btnClass = "btn-danger disabled"; // Kırmızı: Satıldı
                  } else if (isSelected) {
                      btnClass = "btn-success"; // Yeşil: Senin seçimin (En öncelikli)
                  } else if (isHeld) {
                      btnClass = "btn-warning"; // Sarı: Başkası tutuyor
                  }

                  return (
                    <button
                      key={seat.id}
                      className={`btn btn-sm ${btnClass}`}
                      style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
                      onClick={() => handleSeatClick(seat)}
                      disabled={isSold || (isHeld && !isSelected)}
                      title={isSold ? "Dolu" : isHeld ? "Rezerve" : `${rowName}-${seat.seatNumber}`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend / Bilgilendirme */}
        <div className="d-flex justify-content-center gap-4 mt-4 small text-white">
            <div className="d-flex align-items-center gap-1"><div className="bg-light border rounded" style={{width: 15, height: 15}}></div> Boş</div>
            <div className="d-flex align-items-center gap-1"><div className="bg-success rounded" style={{width: 15, height: 15}}></div> Seçili</div>
            <div className="d-flex align-items-center gap-1"><div className="bg-warning rounded" style={{width: 15, height: 15}}></div> Rezerve</div>
            <div className="d-flex align-items-center gap-1"><div className="bg-danger rounded" style={{width: 15, height: 15}}></div> Dolu</div>
        </div>
      </div>
    </div>
  );
}

export default SeatMap;