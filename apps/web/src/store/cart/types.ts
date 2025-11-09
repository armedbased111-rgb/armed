// apps/web/src/store/cart/types.ts
export type LicenseType = "STANDARD" | "EXTENDED";

export type CartItem = {
  id: string;            // id interne du panier (unique)
  productId: string;     // id du produit (ou slug si tu préfères)
  slug: string;
  title: string;
  priceCents: number;    // prix unitaire en centimes pour la licence choisie
  currency: string;      // "EUR"
  licenseType: LicenseType;
  qty: number;           // quantité
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> } // id généré côté store
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "SET_QTY"; payload: { id: string; qty: number } }
  | { type: "SET_LICENSE"; payload: { id: string; licenseType: LicenseType; priceCents: number } }
  | { type: "CLEAR" };
