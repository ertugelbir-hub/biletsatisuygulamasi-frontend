📘 Bilet Satış Uygulaması - Frontend Özeti
Bu proje, Java Spring Boot (Backend) ile haberleşen, kullanıcıların konser/etkinlik biletleri satın alabildiği modern bir React uygulamasıdır.

🛠 1. Kullandığımız Teknolojiler ve Amaçları
React: Kullanıcı arayüzünü (UI) oluşturmak için kullandığımız kütüphane. Sayfayı yenilemeden (SPA - Single Page Application) hızlıca tepki vermesini sağlar.

Vite: Projeyi kuran ve çalıştıran motor. Eski (Create React App) yöntemlere göre çok daha hızlıdır.

Axios: Backend ile konuşan "postacı". Verileri (GET, POST) taşır.

Bootstrap: Hazır stil kütüphanesi. Butonların, kartların ve formların güzel görünmesini sağladık.

JWT (JSON Web Token): Kimlik kartımız. Backend bizi bu şifreli kod ile tanır.

🧠 2. Temel Yapı Taşları (Mantık)
A. apiClient.js (Akıllı Postacı)
Neden Yaptık? Her istekte (bilet alırken, listelerken) tek tek "Al bu benim tokenim" demek yorucudur. Nasıl Çalışır? Bu dosya, Backend'e giden her isteği havada yakalar (Interceptor). Eğer cebimizde (localStorage) bir token varsa, onu isteğin başlığına (Authorization: Bearer ...) otomatik yapıştırır.

B. App.jsx (Trafik Polisi / Ana Yönetici)
Neden Yaptık? Uygulamanın beynidir. Hangi ekranın gösterileceğine bu karar verir. Mantık (State Yönetimi): Burada react-router yerine Conditional Rendering (Şartlı Gösterim) kullandık. Yani if/else mantığıyla ekran değiştiriyoruz:

Kullanıcı giriş yapmamışsa (isAuthenticated = false) 👉 Auth (Giriş) Ekranını göster.

showMyTickets true ise 👉 Biletlerim Ekranını göster.

selectedEvent doluysa 👉 Detay Ekranını göster.

Hiçbiri değilse 👉 Etkinlik Listesini göster.

C. Auth.jsx (Giriş ve Kayıt Kapısı)
Neden Yaptık? Kullanıcının kim olduğunu doğrulamak ve Token almak için. Nasıl Çalışır?

"Giriş Yap" ve "Kayıt Ol" arasında gidip gelen bir state vardır.

Giriş başarılı olunca Backend bir Token verir.

Biz bu token'ı tarayıcının hafızasına (localStorage) kaydederiz. Böylece sayfa yenilense bile çıkış yapmamış oluruz.

D. EventList ve EventItem (Veri Gösterimi)
Neden Yaptık? Verileri düzenli göstermek için.

EventList: Backend'den gelen kocaman listeyi (Array) alır ve döngüye (map) sokar.

EventItem: Her bir etkinliğin nasıl görüneceğini (Kart tasarımı) belirler.

Props Mantığı: Veri yukarıdan aşağıya akar (App -> EventList -> EventItem).

🚀 3. Kritik Özellikler
🎫 Bilet Satın Alma (Modal Yapısı)
Olay: Kullanıcı detay sayfasında "Satın Al"a basınca sayfa değişmez, üstüne siyah bir pencere (Modal) açılır. Neden? Kullanıcıyı sayfadan koparmadan hızlıca işlem yaptırmak (UX - Kullanıcı Deneyimi) için. Kod: TicketModal.jsx içinde form doldurulur ve EventDetail üzerinden Backend'e gönderilir.

🕵️‍♂️ Kişiye Özel Liste (Biletlerim)
Olay: Herkes sadece kendi biletini görür. Nasıl Oldu? Biz Frontend'den /api/tickets/my adresine istek attığımızda, Backend bizim Token'ımıza bakar. Token içinde "Ben Ayşe'yim" bilgisi gizlidir. Backend bunu okur ve sadece Ayşe'nin biletlerini filtreleyip geri yollar.

📝 4. React İpuçları (Öğrendiklerin)
useState: Ekranın anlık durumunu tutar. (Örn: loading, error, events). Değişken değişince ekranı otomatik yeniden çizer.

useEffect: Sayfa ilk açıldığında (veya bir şey değiştiğinde) çalışacak kodlar. (Örn: Sayfa açılınca etkinlikleri çek).

Props: Bir bileşenden diğerine veri aktarmak. (Örn: Listeden Detaya tıklanan etkinliği göndermek).

localStorage: Tarayıcının basit veritabanı. Token'ı burada sakladık.
