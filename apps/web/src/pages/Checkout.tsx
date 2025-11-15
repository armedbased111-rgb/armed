// apps/web/src/pages/Checkout.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import { buildApiUrl } from "../utils/api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import type { PaymentRequest, PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

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

  // Init PaymentIntent côté API
  useEffect(() => {
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
            email: email || undefined,
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
  }, [items, totalCents, email]);

  // Configuration du PaymentRequest pour Apple Pay / Google Pay
  useEffect(() => {
    if (!stripe || !clientSecret || items.length === 0 || totalCents <= 0) {
      setPaymentRequest(null);
      setPaymentRequestAvailable(false);
      return;
    }

    let pr: PaymentRequest | null = null;
    let isMounted = true;

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

    pr = stripe.paymentRequest(paymentRequestDetails);

    pr.canMakePayment().then((result) => {
      if (!isMounted) return;
      
      if (result) {
        setPaymentRequest(pr);
        setPaymentRequestAvailable(true);
      } else {
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

      if (ev.payerEmail) {
        setEmail(ev.payerEmail);
      }

      try {
        const { error: confirmError } = await currentStripe.confirmCardPayment(
          currentClientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: true }
        );

        if (confirmError) {
          ev.complete("fail");
          setErr(confirmError.message || "Erreur de paiement");
          setLoading(false);
        } else {
          ev.complete("success");
          setLoading(false);
          
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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Récap panier */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Votre panier est vide.</p>
          ) : (
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/50 p-3">
                  <div className="space-y-1">
                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Licence: {i.licenseType} • Qté: {i.qty}
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{formatEUR(i.priceCents * i.qty)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="font-medium">Total</div>
                <div className="text-xl font-bold">{formatEUR(totalCents)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canConfirm && !loading) {
                onConfirm();
              }
            }}
            autoComplete="on"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="checkout-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="checkout-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="buyer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-required="true"
                />
                {!isEmailValid && email.length > 0 && (
                  <p className="text-xs text-destructive">Email invalide</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="checkout-country" className="text-sm font-medium">
                  Pays
                </label>
                <select
                  id="checkout-country"
                  name="country"
                  autoComplete="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold mb-1">⚡ Paiement rapide</h3>
                    <p className="text-xs text-muted-foreground">
                      Utilisez Apple Pay ou Google Pay pour payer rapidement
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">ou</span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Carte bancaire</label>
              <div className="rounded-md border border-border bg-secondary/50 p-3">
                <CardElement 
                  options={{ 
                    style: { 
                      base: { 
                        color: "hsl(var(--foreground))", 
                        fontSize: "16px",
                        "::placeholder": { color: "hsl(var(--muted-foreground))" } 
                      } 
                    },
                    hidePostalCode: false,
                  }} 
                />
              </div>
            </div>

            {err && (
              <p className="text-sm text-destructive">{err}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!canConfirm || loading}
              >
                {loading ? "Confirmation…" : "Confirmer le paiement"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate(-1)}
              >
                Retour
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutStripePart />
    </Elements>
  );
}
