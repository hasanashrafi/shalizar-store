"use client";

import { useState } from "react";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface PersianDatePickerProps {
  name: string;
  /** Gregorian ISO date (YYYY-MM-DD) or JS ISO string used to seed the value. */
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (gregorianIso: string) => void;
}

/**
 * Persian (Jalali) calendar date picker.
 *
 * The visible calendar is Persian, but the hidden input stores a Gregorian ISO
 * date string so the existing server actions (which call `new Date(value)`)
 * keep working unchanged.
 */
export default function PersianDatePicker({
  name,
  defaultValue,
  required,
  placeholder = "انتخاب تاریخ",
  className = "",
  inputClassName = "",
  onChange,
}: PersianDatePickerProps) {
  const initialValue = defaultValue ? new Date(defaultValue) : null;
  const [isoValue, setIsoValue] = useState<string>(
    defaultValue && !Number.isNaN(new Date(defaultValue).getTime())
      ? new Date(defaultValue).toISOString()
      : "",
  );

  return (
    <div className={className} dir="rtl">
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={initialValue}
        calendarPosition="bottom-start"
        inputClass={`h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100 ${inputClassName}`}
        placeholder={placeholder}
        onChange={(date: DateObject | null) => {
          if (date && typeof date.toDate === "function") {
            const iso = date.toDate().toISOString();
            setIsoValue(iso);
            onChange?.(iso);
          } else {
            setIsoValue("");
            onChange?.("");
          }
        }}
      />
      <input type="hidden" name={name} value={isoValue} required={required} />
    </div>
  );
}