# 🎨 Bilet Satış Uygulaması - Frontend

Bu klasör, Bilet Satış projesinin **React (Vite)** ile geliştirilmiş kullanıcı arayüzü kodlarını içerir.

## 🛠️ Kurulum

Projeyi çalıştırmadan önce bilgisayarınızda **Node.js** yüklü olmalıdır.

1. **Bağımlılıkları Yükle:**
   Terminalde bu klasörün içindeyken:
   ```bash
   npm install
Geliştirme Sunucusunu Başlat:

Bash

npm run dev
Uygulama varsayılan olarak http://localhost:5173 adresinde çalışır.

📂 Klasör Yapısı
Proje, modüler bir bileşen yapısına sahiptir:

src/apiClient.js: Axios tabanlı, JWT destekli HTTP istemcisi.

src/components/admin/: Yönetici paneli, raporlar, etkinlik formları.

src/components/auth/: Giriş, kayıt ve profil işlemleri.

src/components/events/: Etkinlik listeleme, arama ve detay sayfaları.

src/components/tickets/: Bilet satın alma (koltuk seçimi) ve "Biletlerim" sayfası.

src/utils/: Hata mesajlarını işleyen yardımcı fonksiyonlar.

📦 Kullanılan Paketler
Routing: React State & Conditional Rendering

Stil: Bootstrap 5

HTTP: Axios

UI/UX: React Toastify (Bildirimler), React Spinners (Loading), React Icons

Güvenlik: JWT Decode