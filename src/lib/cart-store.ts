'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, CarDetails } from './types';
import { safeLocalStorage } from './safe-storage';

interface CartStore {
  items: CartItem[];
  selectedStore: string | null;
  curbsideDelivery: boolean;
  carDetails: CarDetails;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedStore: (storeId: string) => void;
  setCurbsideDelivery: (enabled: boolean) => void;
  setCarDetails: (details: Partial<CarDetails>) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedStore: null,
      curbsideDelivery: false,
      carDetails: { carNumber: '', driverName: '' },

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], curbsideDelivery: false, carDetails: { carNumber: '', driverName: '' } });
      },

      setSelectedStore: (storeId) => {
        set({ selectedStore: storeId });
      },

      setCurbsideDelivery: (enabled) => {
        set({ curbsideDelivery: enabled });
        if (!enabled) {
          set({ carDetails: { carNumber: '', driverName: '' } });
        }
      },

      setCarDetails: (details) => {
        set({ carDetails: { ...get().carDetails, ...details } });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
