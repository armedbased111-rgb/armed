// apps/web/src/components/product/LicenseSelector.tsx
import type { ProductLicense } from "../../hooks/useProduct";

function formatEUR(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function LicenseSelector({ 
  licenses, 
  value, 
  onChange 
}: { 
  licenses?: ProductLicense[]; 
  value: "STANDARD" | "EXTENDED"; 
  onChange: (v: "STANDARD" | "EXTENDED") => void 
}) {
  const current = licenses?.find((l) => l.type === value);
  
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground">Licence</label>
      <select 
        className="h-9 px-3 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
        value={value} 
        onChange={(e) => onChange(e.target.value as "STANDARD" | "EXTENDED")}
      >
        <option value="STANDARD">Standard</option>
        <option value="EXTENDED">Extended</option>
      </select>
      {current && (
        <span className="text-sm text-muted-foreground">
          {current.currency === "EUR" ? formatEUR(current.priceCents) : `${current.priceCents} ${current.currency}`}
        </span>
      )}
    </div>
  );
}
