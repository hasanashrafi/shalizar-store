import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      toggleWishlist: (productId) => {
        if (!productId) return;
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(productId)
            ? state.wishlistIds.filter((id) => id !== productId)
            : [...state.wishlistIds, productId],
        }));
      },
      isWishlisted: (productId) => get().wishlistIds.includes(productId),
    }),
    {
      name: "shalizar_wishlist_storage",
      partialize: (state) => ({ wishlistIds: state.wishlistIds }),
      skipHydration: true,
    },
  ),
);
