// apps/web/src/pages/Cart.tsx
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";

export default function Cart() {
  const items = useCart((s) => s.items);
  const totalCents = useCart((s) => s.totalCents());
  const removeItem = useCart((s) => s.removeItem);
  const setQty = useCart((s) => s.setQty);
  const setLicense = useCart((s) => s.setLicense);
  const clear = useCart((s) => s.clear);

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-neutral-700 p-4">
        <h1 className="text-xl font-semibold">Panier</h1>
        {items.length === 0 ? (
          <p className="text-neutral-400 mt-2">Panier vide.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map((i) => (
              <div key={i.id} className="rounded border border-neutral-700 p-3 flex flex-wrap items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-neutral-400">Licence: {i.licenseType}</div>
                  <div className="text-sm text-neutral-400">Slug: {i.slug}</div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-400">Qté</label>
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => setQty(i.id, Number(e.target.value))}
                    className="w-16 h-10 px-2 rounded bg-neutral-900 border border-neutral-700"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-400">Licence</label>
                  <select
                    value={i.licenseType}
                    onChange={(e) => {
                      const next = e.target.value as "STANDARD" | "EXTENDED";
                      // Démo simple: EXTENDED = +50%, ajuste si tu as des prix par licence côté API
                      const nextPrice =
                        next === "STANDARD" ? i.priceCents : Math.round(i.priceCents * 1.5);
                      setLicense(i.id, next, nextPrice);
                    }}
                    className="h-10 px-3 rounded bg-neutral-900 border border-neutral-700"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXTENDED">Extended</option>
                  </select>
                </div>

                <div className="text-lg font-semibold">
                  {formatEUR(i.priceCents * i.qty)}
                </div>

                <button
                  className="h-10 px-3 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={() => removeItem(i.id)}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-700 p-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Total: {formatEUR(totalCents)}</div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded bg-neutral-900 text-neutral-200 border border-neutral-700" onClick={clear} disabled={items.length === 0}>
            Vider
          </button>
          <button className="h-10 px-4 rounded bg-violet-600 text-white hover:bg-violet-700" disabled={items.length === 0} onClick={() => alert("Checkout à implémenter")}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
