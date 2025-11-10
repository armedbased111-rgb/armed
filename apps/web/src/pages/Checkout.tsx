// apps/web/src/pages/Checkout.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import { checkoutSchema } from "../validation/checkout";


/*
  Page Checkout:
  - Récap panier (items/total)
  - Formulaire email/pays (contrôlé via useState)
  - Appel API /checkout/init (mock)
  - Redirection vers /checkout/confirmation si OK
*/
export default function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const totalCents = useCart((s) => s.totalCents());
  const clear = useCart((s) => s.clear);

  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("FR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // validations minimalistes — comme des “PropTypes” côté formulaire
  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isFormValid = isEmailValid && country.length > 0 && items.length > 0;

  const onSubmit = async () => {
    const result = checkoutSchema.safeParse({ email, country });
    if (!result.success) {
      const messages = result.error.errors.map(e => e.message).join(" • ");
      setError(messages || "Formulaire invalide");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // formate la payload pour l’API
      const payload = {
        email,
        country,
        items: items.map((i) => ({
          productId: i.productId,
          slug: i.slug,
          title: i.title,
          licenseType: i.licenseType,
          qty: i.qty,
          priceCents: i.priceCents,
          currency: i.currency,
        })),
      };

      const resp = await fetch("http://localhost:4000/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      // flow UX: on va sur une page de confirmation avec les détails mock
      navigate(`/checkout/confirmation?cid=${encodeURIComponent(json.confirmationId)}&email=${encodeURIComponent(json.email)}&country=${encodeURIComponent(json.country)}&total=${json.totalCents}&cur=${json.currency}`);
      // optionnel: clear le panier après mock (on peut aussi le faire sur la page de confirmation)
      // clear();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 grid gap-6">
      {/* Récap panier */}
      <div className="rounded-lg border border-neutral-700 p-4">
        <h1 className="text-xl font-semibold">Checkout</h1>
        {items.length === 0 ? (
          <p className="mt-2 text-neutral-400">Votre panier est vide.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map((i) => (
              <div key={i.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded border border-neutral-700 p-3 gap-2">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-neutral-400">Licence: {i.licenseType}</div>
                  <div className="text-sm text-neutral-400">Qté: {i.qty}</div>
                </div>
                <div className="text-lg font-semibold">{formatEUR(i.priceCents * i.qty)}</div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded border border-neutral-700 p-3">
              <div className="text-neutral-400">Total</div>
              <div className="text-xl font-semibold">{formatEUR(totalCents)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      <div className="rounded-lg border border-neutral-700 p-4">
        <h2 className="text-lg font-semibold">Informations</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Email</label>
            <input
              type="email"
              placeholder="buyer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-3 rounded bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-400"
            />
            {!isEmailValid && email.length > 0 && (
              <p className="text-xs text-red-500">Email invalide</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Pays</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-11 px-3 rounded bg-neutral-900 border border-neutral-700 text-neutral-100"
            >
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="CA">Canada</option>
              <option value="US">États-Unis</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            className="h-11 px-4 rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 w-full sm:w-auto"
            disabled={!isFormValid || loading}
            onClick={onSubmit}
          >
            {loading ? "Validation…" : "Confirmer la commande"}
          </button>
          <button
            className="h-11 px-4 rounded bg-neutral-900 text-neutral-200 border border-neutral-700 w-full sm:w-auto"
            onClick={() => history.back()}
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
