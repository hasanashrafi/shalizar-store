"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<
    BeforeInstallPromptEvent | null
  >(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-md flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {isIOS ? (
        <div
          className="flex w-full items-center justify-between rounded-xl border border-[#E5E5E2] bg-white p-4 shadow-lg sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-900 text-sm font-bold">
              SH
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">
                افزودن به صفحه اصلی
              </h3>
              <p className="text-xs text-stone-500">
                دکمه Share را بزنید و «افزودن به صفحه اصلی» را انتخاب کنید
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInstall(false)}
            className="text-xs font-bold text-stone-500 hover:text-stone-700"
          >
            بستن
          </button>
        </div>
      ) : (
        <div
          className="flex w-full items-center justify-between rounded-xl border border-[#E5E5E2] bg-white p-4 shadow-lg sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-900 text-sm font-bold">
              SH
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">
                نصب برنامه شالیزار
              </h3>
              <p className="text-xs text-stone-500">
                سایت را مانند یک اپلیکیشن روی گوشی خود استفاده کنید
              </p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="flex min-h-8 items-center justify-center rounded-full bg-[#14532D] px-3 text-xs font-bold text-white shadow-sm hover:bg-[#0f3d22] transition"
          >
            نصب
          </button>
        </div>
      )}
    </div>
  );
}
