"use client";

interface ResponsiveTableProps {
  headers: string[];
  rows: React.ReactNode[];
  rowFields: Record<string, string>;
  emptyMessage?: string;
}

export default function ResponsiveTable({
  headers,
  rows,
  rowFields,
  emptyMessage = "داده‌ای برای نمایش وجود ندارد.",
}: ResponsiveTableProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-x-auto">
      {/* Desktop: normal table */}
      <table className="w-full min-w-full text-right text-sm sm:min-w-[800px]">
        <thead className="bg-stone-100 text-xs font-bold text-stone-600">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.length === 0 ? (
            <tr>
              <td
                className="p-6 text-center text-stone-500"
                colSpan={headers.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>

      {/* Mobile: card view */}
      <div className="xl:hidden space-y-3 mt-4">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            {row}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-6 text-center text-stone-500">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
