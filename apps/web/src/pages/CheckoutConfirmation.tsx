// apps/web/src/pages/CheckoutConfirmation.tsx
import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { formatEUR } from "../utils/format";
import { useCart } from "../store/cart";
import { useDownloads } from "../hooks/useDownloads";
import { useOrderByPaymentIntent } from "../hooks/useOrderByPaymentIntent";
import { buildApiUrl } from "../utils/api";
import Button from "../components/ui/Button";

export default function CheckoutConfirmation() {
  const loc = useLocation();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const cidParam = params.get("cid");
  const emailParam = params.get("email") ?? "unknown";
  const countryParam = params.get("country") ?? "unknown";
  const totalParam = Number(params.get("total") ?? "0");
  const currency = params.get("cur") ?? "EUR";
  const paymentIntentId = params.get("pi") ?? null;

  const clear = useCart((s) => s.clear);
  
  // Si on a un paymentIntentId, chercher l'order
  const { orderId: orderIdFromPI, order: orderFromPI, loading: piLoading, error: piError, retryCount } = 
    useOrderByPaymentIntent(paymentIntentId);
  
  // Déterminer l'orderId final
  const orderId = cidParam && cidParam !== "unknown" ? cidParam : orderIdFromPI;
  
  // Utiliser les données de l'order si disponibles, sinon les params
  const email = orderFromPI?.buyerEmail ?? emailParam;
  const country = countryParam;
  const total = orderFromPI?.totalCents ?? totalParam;
  const totalDisplay = currency === "EUR" ? formatEUR(total) : `${total} ${currency}`;
  
  // Charger les downloads une fois qu'on a l'orderId
  const { downloads, loading: downloadsLoading, error: downloadsError } = useDownloads(orderId);

  // Clear le panier après que la confirmation soit affichée
  useEffect(() => {
    clear();
  }, [clear]);

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (downloadToken: string, productTitle: string) => {
    const downloadUrl = buildApiUrl(`downloads/${downloadToken}`);
    
    // Créer un lien temporaire pour télécharger
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = productTitle;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = piLoading || downloadsLoading;
  const error = piError || downloadsError;
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 grid gap-6">
      <div className="rounded-lg border border-neutral-700 p-4">
        <h1 className="text-xl font-semibold">✅ Confirmation de commande</h1>
        <p className="mt-2 text-neutral-300">
          Merci ! Votre commande a été confirmée et payée.
        </p>
        
        {paymentIntentId && piLoading && !orderId && (
          <div className="mt-4 text-sm text-blue-400 animate-pulse">
            ⏳ Finalisation de votre commande... (tentative {retryCount + 1}/10)
          </div>
        )}
        
        <div className="mt-4 grid gap-2">
          <div className="text-sm text-neutral-400">
            Référence: <span className="text-neutral-200">{orderId || "En cours..."}</span>
          </div>
          <div className="text-sm text-neutral-400">
            Email: <span className="text-neutral-200">{email}</span>
          </div>
          <div className="text-sm text-neutral-400">
            Pays: <span className="text-neutral-200">{country}</span>
          </div>
          <div className="text-sm text-neutral-400">
            Total: <span className="text-neutral-200">{totalDisplay}</span>
          </div>
        </div>
      </div>

      {/* Section des téléchargements */}
      <div className="rounded-lg border border-neutral-700 p-4">
        <h2 className="text-lg font-semibold mb-4">📥 Vos téléchargements</h2>

        {isLoading && (
          <div className="text-neutral-400">
            <div className="animate-pulse">
              {piLoading && !orderId 
                ? "⏳ En attente de la confirmation du paiement..." 
                : "Chargement des liens de téléchargement..."}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-700 p-4">
            <p className="text-red-400">
              Erreur lors de la récupération des liens de téléchargement: {error}
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Veuillez réessayer dans quelques instants ou contactez le support.
            </p>
          </div>
        )}

        {downloads && !isLoading && !error && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              Vos fichiers sont disponibles ci-dessous. Chaque lien est valable pendant 48h et 
              peut être téléchargé jusqu'à 3 fois.
            </p>

            {downloads.downloads.map((download) => (
              <div
                key={download.productId}
                className="rounded-lg border border-neutral-600 p-4 bg-neutral-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{download.productTitle}</h3>
                    
                    <div className="mt-2 space-y-1 text-sm text-neutral-400">
                      <div>
                        Expire le: <span className="text-neutral-300">
                          {formatExpirationDate(download.expiresAt)}
                        </span>
                      </div>
                      <div>
                        Téléchargements restants: <span className="text-neutral-300">
                          {download.downloadsRemaining} / {download.maxDownloads}
                        </span>
                      </div>
                    </div>

                    {download.downloadsRemaining === 0 && (
                      <div className="mt-2 text-xs text-red-400">
                        ⚠️ Limite de téléchargements atteinte
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleDownload(download.downloadToken, download.productTitle)}
                    disabled={download.downloadsRemaining === 0}
                    className={
                      download.downloadsRemaining === 0
                        ? "bg-neutral-600 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700"
                    }
                  >
                    {download.downloadsRemaining === 0 ? "Épuisé" : "Télécharger"}
                  </Button>
                </div>
              </div>
            ))}

            <div className="rounded-lg bg-blue-900/20 border border-blue-700 p-4 mt-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Important:</strong> Un email de confirmation contenant ces liens 
                vous a été envoyé à <strong>{email}</strong>. Conservez-le précieusement !
              </p>
            </div>
          </div>
        )}

        {downloads && downloads.downloads.length === 0 && !isLoading && !error && (
          <div className="text-neutral-400 text-center py-8">
            Aucun fichier disponible pour cette commande.
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Link to="/catalog" className="inline-block">
          <Button className="bg-neutral-700 hover:bg-neutral-600">
            Retour au catalogue
          </Button>
        </Link>
      </div>
    </div>
  );
}
