"use client";

import Link from "next/link";

interface PrintButtonProps {
  orderId: string;
}

export default function PrintButton({ orderId }: PrintButtonProps) {
  return (
    <Link
      href={`/orders/${orderId}/print`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all"
    >
      <span>🖨️ پرینت پیش‌فاکتور / ذخیره PDF</span>
    </Link>
  );
}
