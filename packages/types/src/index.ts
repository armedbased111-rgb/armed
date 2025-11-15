export type Currency = "EUR" | "USD" | "GBP";

export type ProductType = "SOUNDKIT" | "BEAT";

export type LicenseType = 
  | "STANDARD"   // Soundkit standard
  | "EXTENDED"   // Soundkit extended
  | "MP3"        // Beat MP3 lease
  | "WAV"        // Beat WAV lease
  | "EXCLUSIVE"; // Beat exclusive rights

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description?: string;
  priceCents: number;
  currency: Currency;
  tags?: string[];
  bpm?: number;
  key?: string;
  genre?: string;
  productType: ProductType;
  
  // Media
  coverUrl?: string;
  previewUrl?: string;
  durationSec?: number;
  waveformData?: any; // JSON
  
  // Download
  fileUrl?: string;
  fileSizeMb?: number;
  
  createdAt: string; // ISO
  updatedAt: string; // ISO
  
  licenses?: ProductLicense[];
}

export interface ProductLicense {
  id: string;
  productId: string;
  type: LicenseType;
  priceCents: number;
  currency: Currency;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  priceCents: number;
  currency: Currency;
  licenseType: LicenseType;
  
  product?: Product;
}

export interface Order {
  id: string;
  buyerEmail: string;
  totalCents: number;
  currency: Currency;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  
  items?: OrderItem[];
  downloads?: Download[];
  downloadPackage?: DownloadPackage;
}

export interface Download {
  id: string;
  orderId: string;
  orderItemId: string;
  token: string;
  expiresAt: string; // ISO
  maxDownloads: number;
  downloadCount: number;
  ipAddresses: string[];
  downloadDates: string[]; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface DownloadPackage {
  id: string;
  orderId: string;
  zipUrl?: string;
  zipHash: string;
  licenseUrl?: string;
  generatedAt: string; // ISO
  expiresAt: string; // ISO
  fileSizeMb?: number;
  downloadCount: number;
  maxDownloads: number;
  lastDownloadAt?: string; // ISO
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  detail?: string;
  statusCode?: number;
}
