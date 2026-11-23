"use client";

import type { Order } from "@/types";

interface OrderPrintViewProps {
  order: Order;
}

const statusMap: Record<string, { label: string }> = {
  PENDING: { label: "در انتظار تأیید انبار" },
  APPROVED: { label: "در انتظار واریز بیعانه" },
  PAID: { label: "پرداخت‌شده" },
  CANCELLED: { label: "لغو شده" },
};

export default function OrderPrintView({ order }: OrderPrintViewProps) {
  const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalTons = (order.totalWeightKg / 1000).toFixed(2);
  const currentStatus = statusMap[order.status] || { label: order.status };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <title>پیش‌فاکتور سفارش #{order.id.slice(-8).toUpperCase()}</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            `,
          }}
        />
        <style jsx>{`
          @page {
            size: A4;
            margin: 1.5cm;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-family: "Dana", "Vazirmatn", "Tahoma", sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: #000;
            }
            .no-print {
              display: none !important;
            }
            .invoice-container {
              box-shadow: none;
              border: 1px solid #ddd;
              border-radius: 0;
              padding: 0;
              max-width: 100%;
            }
            .print-header {
              page-break-after: avoid;
            }
            .items-table {
              page-break-inside: auto;
            }
            .items-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .totals-section {
              page-break-inside: avoid;
            }
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: "Dana", "Vazirmatn", "Tahoma", sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #1a1a1a;
            background: #fff;
          }
          .invoice-container {
            max-width: 21cm;
            margin: 0 auto;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
          }
          .header-banner {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #fff;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .header-banner .badge {
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
            width: fit-content;
          }
          .header-banner h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
          }
          .header-banner p {
            margin: 0;
            font-size: 11px;
            opacity: 0.9;
          }
          .order-meta {
            background: #fafafa;
            border-top: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
            padding: 12px 20px;
            font-size: 11px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: space-between;
          }
          .order-meta div {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .order-meta label {
            color: #666;
            font-size: 10px;
            text-transform: uppercase;
          }
          .order-meta value {
            font-weight: bold;
            color: #1a1a1a;
            font-family: "Dana", monospace;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid;
          }
          .status-pending { background: #fffbeb; color: #92400e; border-color: #fcd34d; }
          .status-approved { background: #eff6ff; color: #1e40af; border-color: #93c5fd; }
          .status-paid { background: #ecfdf5; color: #065f46; border-color: #6ee7b7; }
          .status-cancelled { background: #fef2f2; color: #991b1b; border-color: #fca5a5; }
          .warning-box {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 10px 14px;
            margin: 16px 20px;
            font-size: 11px;
            color: #92400e;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .parties-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            padding: 0 20px 16px;
            font-size: 11px;
          }
          .party-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px;
          }
          .party-box h3 {
            margin: 0 0 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
            font-weight: 900;
            color: #1a1a1a;
          }
          .party-box .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }
          .party-box .label {
            color: #6b7280;
            font-size: 10px;
          }
          .party-box .value {
            font-weight: 700;
            color: #1a1a1a;
            text-align: left;
            max-width: 60%;
            word-break: break-word;
          }
          .items-table-wrapper {
            margin: 0 20px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow-x: auto;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .items-table th {
            background: #f3f4f6;
            color: #374151;
            font-weight: 800;
            text-align: right;
            padding: 8px 6px;
            border-bottom: 2px solid #e0e0e0;
            white-space: nowrap;
          }
          .items-table td {
            padding: 7px 6px;
            border-bottom: 1px solid #f3f4f6;
            text-align: right;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .items-table tr:hover td {
            background: #fafafa;
          }
          .items-table .text-left {
            text-align: left;
          }
          .items-table .font-bold {
            font-weight: 800;
          }
          .totals-section {
            background: #1f2937;
            color: #fff;
            border-radius: 0 0 8px 8px;
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .totals-section h4 {
            margin: 0 0 10px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #fbbf24;
          }
          .totals-section .delivery-info {
            font-size: 10px;
            line-height: 1.8;
            color: #d1d5db;
          }
          .totals-section .totals-info {
            text-align: left;
          }
          .totals-section .totals-info .row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
            font-size: 11px;
            color: #e5e7eb;
          }
          .totals-section .totals-info .row .label {
            color: #9ca3af;
          }
          .totals-section .totals-info .grand-total {
            border-top: 1px solid #374151;
            padding-top: 10px;
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .totals-section .totals-info .grand-total .label {
            font-size: 12px;
            font-weight: 800;
            color: #fbbf24;
          }
          .totals-section .totals-info .grand-total .value {
            font-size: 20px;
            font-weight: 900;
            color: #fff;
          }
          .print-footer {
            margin-top: 20px;
            padding: 16px 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: center;
            gap: 12px;
            font-size: 11px;
          }
          .print-footer button {
            background: #1f2937;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </head>
      <body>
        <div className="invoice-container">
          {/* Header Banner */}
          <div className="header-banner print-header">
            <span className="badge">پیش‌فاکتور رسمی فروش عمده</span>
            <h1>پلتفرم بازرگانی و عمده‌فروشی شالیزار</h1>
            <p>مرکز پخش مستقیم حبوبات درجه یک ایرانی و وارداتی</p>
          </div>

          {/* Order Meta */}
          <div className="order-meta">
            <div>
              <span className="label">شماره سفارش</span>
              <span className="value">{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div>
              <span className="label">تاریخ صدور</span>
              <span className="value">{orderDate}</span>
            </div>
            <div>
              <span className="label">وضعیت</span>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="warning-box">
            <span>⚠️</span>
            <span>
              این پیش‌فاکتور بر مبنای اطلاعات ثبت‌شده صادر شده است. نهایی‌شدن
              قیمت، موجودی و هزینه حمل منوط به تأیید فروشنده است.
            </span>
          </div>

          {/* Parties Grid */}
          <div className="parties-grid">
            {/* Seller */}
            <div className="party-box">
              <h3>فروشنده (تأمین‌کننده)</h3>
              <div className="row">
                <span className="label">نام شرکت:</span>
                <span className="value">بازرگانی شالیزار</span>
              </div>
              <div className="row">
                <span className="label">تماس:</span>
                <span className="value">پشتیبانی و هماهنگی پس از تأیید سفارش</span>
              </div>
            </div>

            {/* Buyer */}
            <div className="party-box">
              <h3>خریدار (مشتری حقوقی/حقیقی)</h3>
              <div className="row">
                <span className="label">نام تحویل‌گیرنده:</span>
                <span className="value">{order.customerName}</span>
              </div>
              <div className="row">
                <span className="label">شماره موبایل:</span>
                <span className="value">{order.userPhone}</span>
              </div>
              {order.companyName && (
                <div className="row">
                  <span className="label">نام مجموعه:</span>
                  <span className="value">{order.companyName}</span>
                </div>
              )}
              {order.nationalId && (
                <div className="row">
                  <span className="label">کد ملی:</span>
                  <span className="value">{order.nationalId}</span>
                </div>
              )}
              {order.economicId && (
                <div className="row">
                  <span className="label">شناسه ملی/اقتصادی:</span>
                  <span className="value">{order.economicId}</span>
                </div>
              )}
              <div className="row">
                <span className="label">شهر و مقصد:</span>
                <span className="value">{order.destinationCity}</span>
              </div>
              <div className="row">
                <span className="label">آدرس تحویل:</span>
                <span className="value">{order.deliveryAddress}</span>
              </div>
              <div className="row">
                <span className="label">نوع لجستیک:</span>
                <span className="value">{order.warehouseName}</span>
              </div>
              {order.notes && (
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <span className="label">توضیحات:</span>
                  <span className="value">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>ردیف</th>
                  <th style={{ width: '28%' }}>نام محصول</th>
                  <th style={{ width: '15%' }}>کالیبر و مبدأ</th>
                  <th style={{ width: '10%' }}>بسته‌بندی</th>
                  <th style={{ width: '8%' }}>تعداد (کیسه)</th>
                  <th style={{ width: '10%' }}>وزن کل (کیلو)</th>
                  <th style={{ width: '12%' }}>نرخ واحد (تومان)</th>
                  <th className="text-left" style={{ width: '12%' }}>مبلغ کل (تومان)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.productId.toString()}>
                    <td className="font-bold" style={{ color: '#6b7280' }}>{index + 1}</td>
                    <td className="font-bold">{item.productTitle}</td>
                    <td style={{ color: '#4b5563' }}>{item.caliber} - {item.origin}</td>
                    <td style={{ color: '#4b5563' }}>{item.packageWeightKg} کیلویی</td>
                    <td className="font-semibold">{item.bagsCount.toLocaleString("fa-IR")}</td>
                    <td className="font-semibold">{item.requestedKg.toLocaleString("fa-IR")}</td>
                    <td className="font-semibold">{item.unitPrice.toLocaleString("fa-IR")}</td>
                    <td className="text-left font-extrabold">{item.totalPrice.toLocaleString("fa-IR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Delivery */}
          <div className="totals-section">
            <div className="delivery-info">
              <h4>شرایط تحویل و تسویه</h4>
              <p>
                روش حمل انتخاب‌شده:{' '}
                {order.shippingType === "CARRIER"
                  ? "باربری عمومی"
                  : order.shippingType === "EXCLUSIVE_TRUCK"
                    ? "خودروی دربستی"
                    : "تحویل از انبار"}
              </p>
              {order.warehouseName && <p>باربری: {order.warehouseName}</p>}
              <p>
                هزینه حمل در مبلغ کالا محاسبه نشده و شرایط تسویه پس از تأیید
                فروشنده اعلام می‌شود.
              </p>
            </div>
            <div className="totals-info">
              <div className="row">
                <span className="label">وزن ناخالص بار:</span>
                <span className="value font-bold">
                  {order.totalWeightKg.toLocaleString("fa-IR")} کیلو ({totalTons} تن)
                </span>
              </div>
              <div className="row">
                <span className="label">مجموع اقلام:</span>
                <span className="value font-bold">
                  {order.items.length} نوع محصول
                </span>
              </div>
              <div className="grand-total">
                <span className="label">مبلغ کل پیش‌فاکتور:</span>
                <span className="value">
                  {order.totalAmount.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="no-print print-footer">
            <button onClick={() => window.print()}>🖨️ پرینت / ذخیره PDF</button>
            <button onClick={() => window.close()}>بستن</button>
          </div>
        </div>
      </body>
    </html>
  );
}