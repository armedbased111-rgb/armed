export type Currency = "EUR" | "USD" | "GBP";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description?: string;
  priceCents: number;
  currency: Currency;
  published: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface License {
  id: string;
  productId: string;
  key: string;
  assignedEmail?: string;
  issuedAt: string; // ISO
  expiresAt?: string; // ISO
  active: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPriceCents: number;
  currency: Currency;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
  totalCents: number;
  currency: Currency;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
