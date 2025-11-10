// apps/web/src/pages/CheckoutConfirmation.tsx
import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { formatEUR } from "../utils/format";
import { useCart } from "../store/cart";

export default function CheckoutConfirmation() {
  const loc = useLocation();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const cid = params.get("cid") ?? "unknown";
  const email = params.get("email") ?? "unknown";
  const country = params.get("country") ?? "unknown";
  const total = Number(params.get("total") ?? "0");
  const currency = params.get("cur") ?? "EUR";
  const totalDisplay = currency === "EUR" ? formatEUR(total) : `${total} ${currency}`;

  const clear = useCart((s) => s.clear);

  // Clear le panier après que la confirmation soit affichée
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 grid gap-6">
      <div className="rounded-lg border border-neutral-700 p-4">
        <h1 className="text-xl font-semibold">Confirmation</h1>
        <p className="mt-2 text-neutral-300">
          Merci ! Votre commande a été initialisée.
        </p>
        <div className="mt-4 grid gap-2">
          <div className="text-sm text-neutral-400">Référence: <span className="text-neutral-200">{cid}</span></div>
          <div className="text-sm text-neutral-400">Email: <span className="text-neutral-200">{email}</span></div>
          <div className="text-sm text-neutral-400">Pays: <span className="text-neutral-200">{country}</span></div>
          <div className="text-sm text-neutral-400">Total: <span className="text-neutral-200">{totalDisplay}</span></div>
        </div>
        <div className="mt-4">
          <Link to="/catalog" className="inline-block h-11 px-4 rounded bg-violet-600 text-white hover:bg-violet-700">
            Retour au catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
