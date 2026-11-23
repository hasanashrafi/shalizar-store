"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  productId: string;
}

/**
 * Registers a single product view per browser session (per product),
 * then notifies the server. Renders nothing.
 */
export default function ViewTracker({ productId }: ViewTrackerProps) {
  useEffect(() => {
    if (!productId) return;
    const key = `shalizar:viewed:${productId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage may be unavailable; still count the view
    }

    const controller = new AbortController();
    fetch(`/api/products/${productId}/view`, {
      method: "POST",
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {});

    return () => controller.abort();
  }, [productId]);

  return null;
}