// apps/web/src/pages/Checkout.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import { buildApiUrl } from "../utils/api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import type { PaymentRequest, PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

function CheckoutStripePart() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const items = useCart((s) => s.items);
  const totalCents = useCart((s) => s.totalCents());

  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("FR");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [paymentRequestAvailable, setPaymentRequestAvailable] = useState(false);

  // Init PaymentIntent côté API quand le panier est valide
  useEffect(() => {
    // Ne pas initialiser si le panier est vide ou le total est invalide
    if (items.length === 0 || totalCents <= 0) {
      setClientSecret(null);
      return;
    }

    const init = async () => {
      setErr(null);
      try {
        const resp = await fetch(buildApiUrl("payments/init"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents: totalCents,
            currency: "EUR",
            email: email || undefined, // Envoyer email seulement s'il est défini
            items: items.map((i) => ({
              productId: i.productId,
              slug: i.slug,
              title: i.title,
              licenseType: i.licenseType,
              qty: i.qty,
              priceCents: i.priceCents,
            })),
          }),
        });
        
        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.error || `HTTP ${resp.status}`);
        }
        
        const json = await resp.json();
        if (!json.clientSecret) {
          throw new Error("No clientSecret returned from server");
        }
        setClientSecret(json.clientSecret);
      } catch (e) {
        console.error("Error initializing payment:", e);
        setErr(e instanceof Error ? e.message : String(e));
        setClientSecret(null);
      }
    };
    
    init();
  }, [items, totalCents, email]); // Dépendre de items, totalCents et email

  // Configuration du PaymentRequest pour Apple Pay / Google Pay
  useEffect(() => {
    if (!stripe || !clientSecret || items.length === 0 || totalCents <= 0) {
      setPaymentRequest(null);
      setPaymentRequestAvailable(false);
      return;
    }

    let pr: PaymentRequest | null = null;
    let isMounted = true;

    // Créer les détails du paiement pour PaymentRequest
    // Afficher chaque article individuellement pour une meilleure transparence
    const displayItems = items.map((item) => ({
      label: `${item.title} (${item.licenseType})`,
      amount: item.priceCents * item.qty,
    }));

    const paymentRequestDetails = {
      country: country as string,
      currency: "eur",
      total: {
        label: `Total (${items.length} article${items.length > 1 ? "s" : ""})`,
        amount: totalCents,
      },
      displayItems: displayItems.length > 0 ? displayItems : undefined,
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: false,
    };

    // Créer le PaymentRequest
    pr = stripe.paymentRequest(paymentRequestDetails);

    // Vérifier si PaymentRequest est disponible (Apple Pay, Google Pay, etc.)
    pr.canMakePayment().then((result) => {
      if (!isMounted) return;
      
      console.log("PaymentRequest availability check:", {
        available: !!result,
        canMakePayment: result,
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        host: window.location.host,
      });
      
      if (result) {
        console.log("PaymentRequest available:", result);
        setPaymentRequest(pr);
        setPaymentRequestAvailable(true);
      } else {
        console.log("PaymentRequest not available. Reasons:", {
          isHTTPS: window.location.protocol === "https:",
          isLocalhost: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1",
          isSecureContext: window.isSecureContext,
          browser: navigator.userAgent,
        });
        setPaymentRequest(null);
        setPaymentRequestAvailable(false);
      }
    }).catch((error) => {
      console.error("Error checking PaymentRequest availability:", error);
      if (isMounted) {
        setPaymentRequest(null);
        setPaymentRequestAvailable(false);
      }
    });

    // Gérer l'événement paymentmethod (quand l'utilisateur confirme avec Apple Pay/Google Pay)
    const handlePaymentMethod = async (ev: PaymentRequestPaymentMethodEvent) => {
      const currentStripe = stripe;
      const currentClientSecret = clientSecret;
      
      if (!currentStripe || !currentClientSecret) {
        ev.complete("fail");
        setErr("Configuration de paiement invalide");
        return;
      }

      setLoading(true);
      setErr(null);

      // Récupérer l'email depuis PaymentRequest si disponible
      if (ev.payerEmail) {
        setEmail(ev.payerEmail);
      }

      try {
        // Confirmer le paiement avec Stripe en utilisant le payment method ID
        // Pour Apple Pay / Google Pay, Stripe gère généralement 3D Secure automatiquement
        const { error: confirmError } = await currentStripe.confirmCardPayment(
          currentClientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: true } // Laisser Stripe gérer les actions requises (3D Secure)
        );

        if (confirmError) {
          // Afficher l'erreur à l'utilisateur
          ev.complete("fail");
          setErr(confirmError.message || "Erreur de paiement");
          setLoading(false);
        } else {
          // Paiement réussi
          ev.complete("success");
          setLoading(false);
          
          // Rediriger vers la page de confirmation après un court délai
          // Le webhook créera l'Order côté serveur
          setTimeout(() => {
            navigate("/checkout/confirmation");
          }, 500);
        }
      } catch (error) {
        ev.complete("fail");
        setErr(error instanceof Error ? error.message : "Erreur lors de la confirmation du paiement");
        setLoading(false);
      }
    };

    pr.on("paymentmethod", handlePaymentMethod);

    // Nettoyer lors du démontage
    return () => {
      isMounted = false;
      if (pr) {
        pr.off("paymentmethod", handlePaymentMethod);
      }
    };
  }, [stripe, clientSecret, items, totalCents, country, navigate]);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const canConfirm = !!clientSecret && !!stripe && isEmailValid && items.length > 0;

  const onConfirm = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setErr(null);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element introuvable");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: { email },
        },
      });

      if (error) {
        setErr(error.message || "Stripe error");
      } else {
        // PaymentIntent passé en succeeded/processing → webhook écrira l'Order
        // Rediriger vers la page de confirmation avec les infos
        const params = new URLSearchParams({
          email: email,
          total: String(totalCents),
          cur: "EUR",
          country: country,
          pi: paymentIntent?.id || "unknown"
        });
        navigate(`/checkout/confirmation?${params.toString()}`);
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 grid gap-6">
      {/* Récap panier */}
      <div className="rounded-lg border border-neutral-700 p-4">
        <h1 className="text-xl font-semibold">Checkout (Stripe test)</h1>
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

      {/* Formulaire + Elements */}
      <form
        id="checkout-form"
        name="checkout-form"
        className="rounded-lg border border-neutral-700 p-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (canConfirm && !loading) {
            onConfirm();
          }
        }}
        autoComplete="on"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="checkout-email" className="text-sm text-neutral-400">
              Email
            </label>
            <input
              id="checkout-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="buyer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-3 rounded bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-400"
              aria-label="Adresse email"
              aria-required="true"
              data-form-type="email"
            />
            {!isEmailValid && email.length > 0 && (
              <p className="text-xs text-red-500" role="alert">
                Email invalide
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="checkout-country" className="text-sm text-neutral-400">
              Pays
            </label>
            <select
              id="checkout-country"
              name="country"
              autoComplete="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-11 px-3 rounded bg-neutral-900 border border-neutral-700 text-neutral-100"
              aria-label="Pays"
              data-form-type="country"
            >
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="CA">Canada</option>
              <option value="US">États-Unis</option>
            </select>
          </div>
        </div>

        {/* Apple Pay / Google Pay */}
        {paymentRequestAvailable && paymentRequest && (
          <div className="rounded-lg border border-violet-600/30 bg-violet-950/10 p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-neutral-200 mb-1 flex items-center gap-2">
                <span>⚡</span>
                Paiement rapide
              </h2>
              <p className="text-xs text-neutral-400">
                Utilisez Apple Pay ou Google Pay pour payer rapidement et en toute sécurité, sans saisir vos informations de carte
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full" style={{ minHeight: "48px" }}>
                <PaymentRequestButtonElement
                  options={{
                    paymentRequest,
                    style: {
                      paymentRequestButton: {
                        theme: "dark",
                        height: "48px",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Séparateur */}
        {paymentRequestAvailable && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-900 text-neutral-400">ou</span>
            </div>
          </div>
        )}

        <div className="rounded border border-neutral-700 p-3">
          <label className="text-sm text-neutral-400 mb-2 block">
            Informations de carte bancaire
          </label>
          <div id="card-element-wrapper">
            <CardElement 
              options={{ 
                style: { 
                  base: { 
                    color: "#ffffff", 
                    fontSize: "16px",
                    "::placeholder": { color: "#9CA3AF" } 
                  } 
                },
                hidePostalCode: false,
              }} 
            />
          </div>
        </div>

        {err && (
          <p className="text-sm text-red-500" role="alert">
            {err}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="h-11 px-4 rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 w-full sm:w-auto"
            disabled={!canConfirm || loading}
          >
            {loading ? "Confirmation…" : "Confirmer le paiement (test)"}
          </button>
          <button
            type="button"
            className="h-11 px-4 rounded bg-neutral-900 text-neutral-200 border border-neutral-700 w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutStripePart />
    </Elements>
  );
}
