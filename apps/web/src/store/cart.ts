import { create } from "zustand";

export type LicenseType = "STANDARD" | "EXTENDED";

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  title: string;
  priceCents: number;   // prix unitaire en centimes pour la licence choisie
  currency: string;     // "EUR"
  licenseType: LicenseType;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (payload: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setLicense: (id: string, licenseType: LicenseType, priceCents: number) => void;
  clear: () => void;
  totalCents: () => number;
  totalQty: () => number;
};

const STORAGE_KEY = "arm_cart_v1";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// Lecture initiale du LocalStorage
function readInitialItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return parsed.items as CartItem[];
    }
  } catch {}
  return [];
}

// Persistance après chaque mutation
function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  } catch {}
}

export const useCart = create<CartStore>((set, get) => ({
  // State initial hydraté
  items: readInitialItems(),

  // Actions
  addItem: (p) =>
    set((s) => {
      // Fusion si même produit + même licence: on incrémente la qty
      const idx = s.items.findIndex(
        (i) => i.productId === p.productId && i.licenseType === p.licenseType
      );
      const items =
        idx >= 0
          ? s.items.map((i, k) => (k === idx ? { ...i, qty: i.qty + p.qty } : i))
          : [{ id: genId(), ...p }, ...s.items];
      persist(items);
      return { items };
    }),

  removeItem: (id) =>
    set((s) => {
      const items = s.items.filter((i) => i.id !== id);
      persist(items);
      return { items };
    }),

  setQty: (id, qty) =>
    set((s) => {
      const items = s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, qty) } : i
      );
      persist(items);
      return { items };
    }),

  setLicense: (id, licenseType, priceCents) =>
    set((s) => {
      const items = s.items.map((i) =>
        i.id === id ? { ...i, licenseType, priceCents } : i
      );
      persist(items);
      return { items };
    }),

  clear: () => {
    persist([]);
    set({ items: [] });
  },

  // Selectors (derived state) — calculés à la demande
  totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.qty, 0),
  totalQty: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));
