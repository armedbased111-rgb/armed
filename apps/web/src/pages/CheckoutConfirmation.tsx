// apps/web/src/pages/CheckoutConfirmation.tsx
import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatEUR } from "../utils/format";
import { useCart } from "../store/cart";
import { useDownloads } from "../hooks/useDownloads";
import { useDownloadPackage } from "../hooks/useDownloadPackage";
import { useOrderByPaymentIntent } from "../hooks/useOrderByPaymentIntent";
import { buildApiUrl } from "../utils/api";
import Button from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";

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
  
  const { orderId: orderIdFromPI, order: orderFromPI, loading: piLoading, error: piError, retryCount } = 
    useOrderByPaymentIntent(paymentIntentId);
  
  const orderId = cidParam && cidParam !== "unknown" ? cidParam : orderIdFromPI;
  
  const email = orderFromPI?.buyerEmail ?? emailParam;
  const country = countryParam;
  const total = orderFromPI?.totalCents ?? totalParam;
  const totalDisplay = currency === "EUR" ? formatEUR(total) : `${total} ${currency}`;
  
  const { downloads, loading: downloadsLoading, error: downloadsError } = useDownloads(orderId);
  
  const {
    downloadPackage,
    packageInfo,
    packageStatus,
    generating,
    error: packageError,
    fetchOrGeneratePackage,
  } = useDownloadPackage(orderId);

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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✅ Confirmation de commande
          </CardTitle>
          <CardDescription>
            Merci ! Votre commande a été confirmée et payée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentIntentId && piLoading && !orderId && (
            <div className="mb-4 text-sm text-primary animate-pulse">
              ⏳ Finalisation de votre commande... (tentative {retryCount + 1}/10)
            </div>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Référence:</span>
              <span className="font-medium">{orderId || "En cours..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pays:</span>
              <span className="font-medium">{country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold">{totalDisplay}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section du package complet */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📦 Package complet (Recommandé)
          </CardTitle>
          <CardDescription>
            Téléchargez tous vos fichiers audio + votre certificat de licence en un seul ZIP personnalisé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packageStatus && packageStatus.available ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-muted-foreground">
                  Taille: <span className="text-foreground">
                    {packageStatus.fileSizeMb ? `${packageStatus.fileSizeMb.toFixed(2)} MB` : "En génération..."}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Téléchargements: <span className="text-foreground">
                    {packageStatus.remainingDownloads} / {packageStatus.maxDownloads} restants
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Expire le: <span className="text-foreground">
                    {formatExpirationDate(packageStatus.expiresAt)}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Hash: <span className="text-foreground font-mono text-xs">
                    {packageStatus.zipHash.substring(0, 12)}...
                  </span>
                </div>
              </div>

              <Button
                onClick={downloadPackage}
                disabled={packageStatus.remainingDownloads === 0}
                className="w-full"
              >
                {packageStatus.remainingDownloads === 0 
                  ? "❌ Limite atteinte" 
                  : "⬇️ Télécharger le package complet"}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Contient tous vos fichiers audio</p>
                <p>✓ Inclus le certificat de licence PDF officiel</p>
                <p>✓ Hash unique pour traçabilité et authenticité</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!packageStatus && orderId && !isLoading && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Votre package personnalisé n'est pas encore généré. Cliquez ci-dessous pour le créer.
                  </p>
                  <Button
                    onClick={fetchOrGeneratePackage}
                    disabled={generating}
                    className="w-full"
                  >
                    {generating 
                      ? "🔄 Génération en cours..." 
                      : "📦 Générer mon package personnalisé"}
                  </Button>
                </>
              )}

              {packageStatus && packageStatus.isExpired && (
                <div className="text-sm text-destructive">
                  ⚠️ Votre package a expiré. Contactez le support pour le régénérer.
                </div>
              )}

              {packageError && (
                <div className="text-sm text-destructive">
                  ❌ Erreur: {packageError}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section des téléchargements individuels */}
      <Card>
        <CardHeader>
          <CardTitle>📥 Téléchargements individuels</CardTitle>
          <CardDescription>
            Ou téléchargez chaque fichier séparément (sans licence PDF).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground animate-pulse">
              {piLoading && !orderId 
                ? "⏳ En attente de la confirmation du paiement..." 
                : "Chargement des liens de téléchargement..."}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
              <p className="text-destructive">
                Erreur lors de la récupération des liens de téléchargement: {error}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Veuillez réessayer dans quelques instants ou contactez le support.
              </p>
            </div>
          )}

          {downloads && !isLoading && !error && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vos fichiers sont disponibles ci-dessous. Chaque lien est valable pendant 48h et 
                peut être téléchargé jusqu'à 3 fois.
              </p>

              {downloads.downloads.map((download, idx) => (
                <motion.div
                  key={download.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{download.productTitle}</h3>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>
                          Expire le: <span className="text-foreground">
                            {formatExpirationDate(download.expiresAt)}
                          </span>
                        </div>
                        <div>
                          Téléchargements restants: <span className="text-foreground">
                            {download.downloadsRemaining} / {download.maxDownloads}
                          </span>
                        </div>
                      </div>

                      {download.downloadsRemaining === 0 && (
                        <div className="text-xs text-destructive">
                          ⚠️ Limite de téléchargements atteinte
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleDownload(download.downloadToken, download.productTitle)}
                      disabled={download.downloadsRemaining === 0}
                      variant={download.downloadsRemaining === 0 ? "outline" : "default"}
                    >
                      {download.downloadsRemaining === 0 ? "Épuisé" : "Télécharger"}
                    </Button>
                  </div>
                </motion.div>
              ))}

              <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
                <p className="text-sm">
                  💡 <strong>Important:</strong> Un email de confirmation contenant ces liens 
                  vous a été envoyé à <strong>{email}</strong>. Conservez-le précieusement !
                </p>
              </div>
            </div>
          )}

          {downloads && downloads.downloads.length === 0 && !isLoading && !error && (
            <div className="text-muted-foreground text-center py-8">
              Aucun fichier disponible pour cette commande.
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Link to="/catalog">
          <Button variant="outline">
            Retour au catalogue
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
