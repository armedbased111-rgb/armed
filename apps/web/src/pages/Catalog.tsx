import type { Product } from "@arm/types";

export function Catalog() {
  const products: Product[] = [
    {
      id: "p_1",
      slug: "demo",
      title: "Demo Product",
      priceCents: 1999,
      currency: "EUR",
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return (
    <div>
      <h1>Catalog</h1>
      {products.map(p => (
        <div key={p.id}>
          {p.title} — {p.priceCents / 100} {p.currency}
        </div>
      ))}
    </div>
  );
}
