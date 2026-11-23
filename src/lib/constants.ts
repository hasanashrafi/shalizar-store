export const PROVINCES = [
  "تهران",
  "البرز",
  "اصفهان",
  "فارس",
  "خراسان رضوی",
  "آذربایجان شرقی",
  "مازندران",
  "خوزستان",
  "سایر استان‌ها",
] as const;

export const SHIPPING_TYPES = [
  { value: "EXCLUSIVE_TRUCK", label: "وانت / نیسان دربستی" },
  { value: "CARRIER", label: "نیسان خود شرکت (تحویل درب انبار)" },
  { value: "FACTORY_PICKUP", label: "بارگیری درب انبار (مرند)" },
] as const;

export const WAREHOUSE_ORIGIN = "مرند";

export type ShippingTypeValue = (typeof SHIPPING_TYPES)[number]["value"];