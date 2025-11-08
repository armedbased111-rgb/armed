// apps/web/src/components/product/LicenseSelector.tsx
import type { ProductLicense } from "../../hooks/useProduct";

function formatEUR(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function LicenseSelector({ licenses, value, onChange }: { licenses?: ProductLicense[]; value: "STANDARD" | "EXTENDED"; onChange: (v: "STANDARD" | "EXTENDED") => void }) {
  const current = licenses?.find((l) => l.type === value);
  return (
    <div className="rounded-lg border border-neutral-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <label className="text-sm text-neutral-400">Licence</label>
        <select className="h-10 px-3 rounded bg-neutral-900 border border-neutral-700" value={value} onChange={(e) => onChange(e.target.value as "STANDARD" | "EXTENDED")}>
          <option value="STANDARD">Standard</option>
          <option value="EXTENDED">Extended</option>
        </select>
      </div>
      <div className="text-lg font-semibold">{current ? (current.currency === "EUR" ? formatEUR(current.priceCents) : `${current.priceCents} ${current.currency}`) : "—"}</div>
    </div>
  );
}
