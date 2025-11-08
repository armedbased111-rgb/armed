type LicenseSelectorProps = {
  basePriceCents: number;
  currency: string;
  value: "STANDARD" | "EXTENDED";
  onChange: (v: "STANDARD" | "EXTENDED") => void;
};

function formatEUR(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function LicenseSelector({ basePriceCents, currency, value, onChange }: LicenseSelectorProps) {
  // Pricing dynamique simple: EXTENDED +50%
  const price = value === "STANDARD" ? basePriceCents : Math.round(basePriceCents * 1.5);
  return (
    <div className="rounded-lg border border-neutral-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <label className="text-sm text-neutral-400">Licence</label>
        <select
          className="h-10 px-3 rounded bg-neutral-900 border border-neutral-700"
          value={value}
          onChange={(e) => onChange(e.target.value as "STANDARD" | "EXTENDED")}
        >
          <option value="STANDARD">Standard</option>
          <option value="EXTENDED">Extended</option>
        </select>
      </div>
      <div className="text-lg font-semibold">
        {currency === "EUR" ? formatEUR(price) : `${price} ${currency}`}
      </div>
    </div>
  );
}
