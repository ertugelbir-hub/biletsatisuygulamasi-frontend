import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Başlangıçta LocalStorage'a bak, varsa oradan çek
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('cart');
    return localData ? JSON.parse(localData) : [];
  });

  // Sepet her değiştiğinde LocalStorage'ı güncelle
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sepete Ekleme Fonksiyonu
  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
  };

  // Sepetten Silme Fonksiyonu
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter(item => item.id !== id));
  };

  // Sepeti Temizle
  const clearCart = () => {
    setCartItems([]);
  };

  // Toplam Tutar Hesaplama
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};