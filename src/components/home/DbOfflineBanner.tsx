"use client";

export default function DbOfflineBanner({ message }: { message?: string }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-3 rounded-b-xl bg-amber-50 border-b border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200 shadow-lg"
      role="alert"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-sm font-semibold leading-tight">
        {message ||
          "اتصال به پایگاه داده برقرار نیست. لطفاً وی‌پی ان (VPN) را فعال کنید یا دوباره تلاش کنید."}
      </span>
    </div>
  );
}
