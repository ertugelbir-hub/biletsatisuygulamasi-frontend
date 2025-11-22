// Backend'den gelen hatayı analiz edip okunabilir metin döndürür
export const getErrorMessage = (error) => {
  const resData = error.response?.data;

  // 1. Backend hiç cevap vermediyse (Sunucu kapalıysa)
  if (!resData) {
    return "Sunucuya erişilemiyor veya bilinmeyen bir hata oluştu.";
  }

  // 2. Validasyon Hatası mı? (Liste döner)
  // Backend'deki GlobalExceptionHandler: map.put("details", ...)
  if (resData.details && Array.isArray(resData.details)) {
    // Örn: "Şifre en az 4 karakter olmalı | Email formatı hatalı"
    return resData.details.map(err => err.message).join(" | ");
  }

  // 3. Normal Hata Mesajı mı?
  // Backend: map.put("message", ...)
  if (resData.message) {
    return resData.message;
  }

  // 4. Hiçbiri değilse (Fallback)
  return "Beklenmedik bir hata oluştu.";
};