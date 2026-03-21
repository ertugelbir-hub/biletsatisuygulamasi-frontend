import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import PaymentModal from '../common/PaymentModal';
import { toast } from 'react-toastify';
import apiClient from "../../apiClient"; // API isteği için
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CartPage = ({ onBack }) => {
  const { cartItems, removeFromCart, clearCart, totalPrice } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Sepetteki TÜM ürünleri tek tek satın alan fonksiyon
  const handleCheckout = async () => {
    try {
      // Sepetteki her kalem için backend'e istek at
      // (Gerçek projede 'batch' endpoint olur ama şimdilik döngüyle yapalım)
      for (const item of cartItems) {
        await apiClient.post("/api/tickets/purchase", {
          eventId: item.eventId,
          seatIds: item.seatIds,
          quantity: item.quantity,
          couponCode: item.couponCode || ""
        });
      }
      
      toast.success("🎉 Ödeme başarılı! İyi eğlenceler.");
      clearCart(); // Sepeti boşalt
      navigate('/my-tickets'); // Biletlerime git

    } catch (error) {
      console.error(error);
      toast.error("Ödeme sırasında bir hata oluştu: " + (error.response?.data?.message || "Bilinmeyen hata"));
    }
  };

 if (cartItems.length === 0) {
    return (
      <div className="text-center text-white mt-5">
        <h2>{t('cartPage.empty')}</h2>
        {/* 👇 BU BUTONU EKLEDİK */}
        <button onClick={onBack} className="btn btn-primary mt-3">
          {t('cartPage.backToEvents')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-4">🛒 Alışveriş Sepetim</h2>
      <button onClick={onBack} className="btn btn-outline-light">
          ← Alışverişe Devam Et
        </button>
      
      <div className="row">
        {/* LİSTE */}
        <div className="col-md-8">
          {cartItems.map((item) => (
            <div key={item.id} className="card bg-dark border-secondary mb-3 shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title text-info">{item.eventTitle}</h5>
                  <p className="mb-0 text-secondary small">
                    {t('cartPage.seats')} {item.seatIds.join(", ")} | {t('cartPage.qty')} {item.quantity}
                    {item.couponCode && <span className="badge bg-warning text-dark ms-2">{t('cartPage.coupon')} {item.couponCode}</span>}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="fs-5 fw-bold">{item.price.toFixed(2)} ₺</span>
                  <button onClick={() => removeFromCart(item.id)} className="btn btn-outline-danger btn-sm">{t('cartPage.delete')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ÖZET KUTUSU */}
        <div className="col-md-4">
          <div className="card bg-secondary bg-opacity-25 text-white p-3">
            <h4>{t('cartPage.summaryTitle')}</h4>
            <hr />
            <div className="d-flex justify-content-between fs-4 fw-bold mb-4">
              <span>{t('cartPage.total')}</span>
              <span className="text-warning">{totalPrice.toFixed(2)} ₺</span>
            </div>
            
            <button 
              onClick={() => setShowPayment(true)} 
              className="btn btn-success w-100 py-2 fs-5"
            >
             {t('cartPage.checkoutBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* ÖDEME MODALI */}
      {showPayment && (
        <PaymentModal 
          totalAmount={totalPrice.toFixed(2)}
          onClose={() => setShowPayment(false)}
          onConfirm={() => {
            setShowPayment(false);
            handleCheckout();
          }}
        />
      )}
    </div>
  );
};

export default CartPage;