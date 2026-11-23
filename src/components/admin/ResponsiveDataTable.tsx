"use client";

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode;
}

interface ResponsiveDataTableProps {
  items: Record<string, unknown>[];
  columns: Column[];
  emptyMessage?: string;
  rowKey?: string;
}

export default function ResponsiveDataTable({
  items,
  columns,
  emptyMessage = "داده‌ای برای نمایش وجود ندارد.",
  rowKey = "_id",
}: ResponsiveDataTableProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Desktop: normal table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-right text-sm sm:min-w-[800px]">
          <thead className="bg-stone-100 text-xs font-bold text-stone-600">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="p-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.length === 0 ? (
              <tr>
                <td
                  className="p-6 text-center text-stone-500"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr
                  key={String(item[rowKey]) || i}
                  className="align-top hover:bg-stone-50/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-3">
                      {col.render
                        ? col.render(item[col.key], item)
                        : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card view */}
      <div className="xl:hidden space-y-3 p-4">
        {items.length === 0 ? (
          <div className="p-6 text-center text-stone-500">
            {emptyMessage}
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={String(item[rowKey]) || i}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              {columns.map((col) => (
                <div key={col.key} className="mb-2 last:mb-0">
                  <span className="text-xs text-stone-400 block">
                    {col.label}
                  </span>
                  {col.render
                    ? col.render(item[col.key], item)
                    : String(item[col.key] ?? "-")}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
