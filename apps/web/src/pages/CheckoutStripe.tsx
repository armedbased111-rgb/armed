// apps/web/src/pages/CheckoutStripe.tsx
import { useEffect, useState } from "react";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

// Charge la clé publique (publishable) Stripe depuis .env front (Vite): import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const items = useCart((s) => s.items);
  const totalCents = useCart((s) => s.totalCents());
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("FR");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init PaymentIntent côté API au mount (ou au click)
  useEffect(() => {
    const init = async () => {
      setError(null);
      try {
        const resp = await fetch("http://localhost:4000/payments/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents: totalCents,
            currency: "EUR",
            email,
            items: items.map(i => ({ productId: i.productId, slug: i.slug, title: i.title, licenseType: i.licenseType, qty: i.qty, priceCents: i.priceCents })),
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setClientSecret(json.clientSecret);
      } catch (e) {
        setError(String(e));
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // on init une fois; si tu veux dépendre de email/items, ajoute-les

  const onConfirm = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setError(null);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card Element not found");

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Stripe error");
        setLoading(false);
        return;
      }

      // À ce stade, PaymentIntent est “processing/succeeded”; le webhook back écrira l’Order.
      // On affiche une confirmation UI (ou navigate vers /checkout/confirmation).
      alert("Paiement test confirmé (sandbox). La commande sera créée via webhook.");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-neutral-700 p-4">
        <h1 className="text-xl font-semibold">Paiement Stripe (test)</h1>
        <p className="text-neutral-400">Total: {formatEUR(totalCents)}</p>
      </div>

      <div className="rounded-lg border border-neutral-700 p-4 grid gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Email</label>
          <input
            type="email"
            placeholder="buyer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-3 rounded bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-400"
          />
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

        {/* Stripe CardElement */}
        <div className="rounded border border-neutral-700 p-3">
          <CardElement
            options={{
              style: {
                base: { color: "#ffffff", "::placeholder": { color: "#9CA3AF" } },
              },
            }}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="mt-2">
          <button
            className="h-11 px-4 rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={!clientSecret || !stripe || loading}
          >
            {loading ? "Confirmation…" : "Confirmer le paiement (test)"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutStripe() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
