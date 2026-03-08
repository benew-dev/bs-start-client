"use client";

import { useCallback } from "react";

export const GUEST_CART_KEY = "bin_guest_cart";

/**
 * Lit le panier guest depuis localStorage.
 * Structure stockée : [{ productId: string, quantity: number }]
 * On ne stocke JAMAIS les prix — ils sont recalculés côté serveur.
 */
export const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        /^[0-9a-fA-F]{24}$/.test(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1,
    );
  } catch {
    return [];
  }
};

export const writeGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    console.warn("[GuestCart] Impossible d'écrire dans localStorage");
  }
};

const useGuestCart = () => {
  const addToGuestCart = useCallback((productId, quantity = 1) => {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) return null;

    const current = readGuestCart();
    const existingIndex = current.findIndex(
      (item) => item.productId === productId,
    );

    let updated;
    if (existingIndex !== -1) {
      updated = current.map((item, i) =>
        i === existingIndex
          ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
          : item,
      );
    } else {
      updated = [...current, { productId, quantity }];
    }

    writeGuestCart(updated);
    return updated;
  }, []);

  const removeFromGuestCart = useCallback((productId) => {
    const current = readGuestCart();
    const updated = current.filter((item) => item.productId !== productId);
    writeGuestCart(updated);
    return updated;
  }, []);

  const updateGuestCartQuantity = useCallback((productId, newQuantity) => {
    const current = readGuestCart();
    if (newQuantity <= 0) {
      const updated = current.filter((item) => item.productId !== productId);
      writeGuestCart(updated);
      return updated;
    }
    const updated = current.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.min(newQuantity, 99) }
        : item,
    );
    writeGuestCart(updated);
    return updated;
  }, []);

  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch {
      console.warn("[GuestCart] Impossible de vider le localStorage");
    }
    return [];
  }, []);

  const getGuestCartItems = useCallback(() => readGuestCart(), []);

  const getGuestCartCount = useCallback(
    () => readGuestCart().reduce((sum, item) => sum + item.quantity, 0),
    [],
  );

  return {
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCartQuantity,
    clearGuestCart,
    getGuestCartItems,
    getGuestCartCount,
  };
};

export default useGuestCart;
