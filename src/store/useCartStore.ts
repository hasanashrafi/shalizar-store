import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

function unitPriceForKg(product: Product | undefined, kg: number): number {
  if (!product?.tiers || product.tiers.length === 0) return 0;
  const sorted = [...product.tiers].sort((a, b) => a.minKg - b.minKg);
  const matched = sorted.find(
    (t) => kg >= t.minKg && (t.maxKg === null || kg <= t.maxKg),
  );
  if (matched) return matched.pricePerKg;
  if (kg < sorted[0].minKg) return sorted[0].pricePerKg;
  return sorted[sorted.length - 1].pricePerKg;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateBags: (productId: string, quantityBags: number) => void;
  updateRequestedKg: (productId: string, requestedKg: number) => void;
  clearCart: () => void;

  getTotalCartWeightKg: () => number;
  getTotalCartPrice: () => number;
  getTotalBagsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId,
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantityBags: newItem.quantityBags,
              requestedKg: newItem.requestedKg,
              totalKg: newItem.totalKg,
              unitPrice: newItem.unitPrice,
              totalPrice: newItem.totalPrice,
            };
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateBags: (productId, quantityBags) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.productId !== productId) return item;
              if (quantityBags <= 0) return null;
              const packageWeight = item.product?.packageWeightKg || 30;
              const requestedKg = quantityBags * packageWeight;
              const unitPrice = unitPriceForKg(item.product, requestedKg);
              return {
                ...item,
                quantityBags,
                requestedKg,
                totalKg: requestedKg,
                unitPrice,
                totalPrice: requestedKg * unitPrice,
              };
            })
            .filter(Boolean) as CartItem[],
        }));
      },

      updateRequestedKg: (productId, requestedKg) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.productId !== productId) return item;
              if (requestedKg <= 0) return null;
              const packageWeight = item.product?.packageWeightKg || 30;
              const quantityBags = Math.ceil(requestedKg / packageWeight);
              const unitPrice = unitPriceForKg(item.product, requestedKg);
              return {
                ...item,
                quantityBags,
                requestedKg,
                totalKg: requestedKg,
                unitPrice,
                totalPrice: requestedKg * unitPrice,
              };
            })
            .filter(Boolean) as CartItem[],
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalCartWeightKg: () =>
        get().items.reduce((sum, item) => sum + item.totalKg, 0),

      getTotalCartPrice: () =>
        get().items.reduce((sum, item) => sum + item.totalPrice, 0),

      getTotalBagsCount: () =>
        get().items.reduce((sum, item) => sum + item.quantityBags, 0),
    }),
    {
      name: "shalizar-b2b-cart-storage",
    },
  ),
);