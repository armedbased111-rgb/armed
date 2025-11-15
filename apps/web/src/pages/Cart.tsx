// apps/web/src/pages/Cart.tsx
import { motion } from "framer-motion";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function Cart() {
  const items = useCart((s) => s.items);
  const totalCents = useCart((s) => s.totalCents());
  const removeItem = useCart((s) => s.removeItem);
  const setQty = useCart((s) => s.setQty);
  const setLicense = useCart((s) => s.setLicense);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panier</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Panier vide.</p>
          ) : (
            <div className="space-y-4">
              {items.map((i, idx) => (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-md border border-border bg-card p-4 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold">{i.title}</div>
                    <div className="text-sm text-muted-foreground">Licence: {i.licenseType}</div>
                    <div className="text-xs text-muted-foreground">Slug: {i.slug}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Qté</label>
                      <Input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) => setQty(i.id, Number(e.target.value))}
                        className="w-20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Licence</label>
                      <select
                        value={i.licenseType}
                        onChange={(e) => {
                          const next = e.target.value as "STANDARD" | "EXTENDED";
                          const nextPrice = next === "STANDARD" ? i.priceCents : Math.round(i.priceCents * 1.5);
                          setLicense(i.id, next, nextPrice);
                        }}
                        className="h-9 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="STANDARD">Standard</option>
                        <option value="EXTENDED">Extended</option>
                      </select>
                    </div>

                    <div className="text-lg font-bold">
                      {formatEUR(i.priceCents * i.qty)}
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(i.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-2xl font-bold">Total: {formatEUR(totalCents)}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={clear}
                disabled={items.length === 0}
              >
                Vider
              </Button>
              <Button
                disabled={items.length === 0}
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
