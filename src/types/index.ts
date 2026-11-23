export interface PriceTier {
  id?: string;
  productId?: string;
  minKg: number;
  maxKg: number | null;
  pricePerKg: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  caliber: string;
  wastePercent?: number | null;
  moisturePercent?: number | null;
  origin: string;
  packaging: string;
  moqKg: number;
  packageWeightKg: number;
  stockKg: number;
  imageUrl?: string | null;
  tiers: PriceTier[];
}

export interface CartItem {
  productId: string;
  product?: Product;
  quantityBags: number;
  requestedKg: number;
  totalKg: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDTO {
  customerName: string;
  userPhone: string;
  companyName?: string;
  destinationCity: string;
  warehouseName?: string;
  items: {
    productId: string;
    quantityBags: number;
  }[];
}

export interface Order {
  id: string;
  customerName: string;
  userPhone: string;
  companyName?: string;
  nationalId?: string;
  economicId?: string;
  destinationCity: string;
  deliveryAddress: string;
  shippingType: string;
  warehouseName?: string;
  notes?: string;
  items: Array<{
    productId: string;
    productTitle: string;
    productSlug: string;
    caliber: string;
    origin: string;
    packaging: string;
    packageWeightKg: number;
    bagsCount: number;
    requestedKg: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalWeightKg: number;
  totalAmount: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
