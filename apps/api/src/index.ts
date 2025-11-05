import "dotenv/config"; // charge .env avant de lire process.env
import express from "express";
import cors from "cors";
import { validateEnv } from "@arm/config";
import type { Product } from "@arm/types";

// Valide les variables d'environnement — si manquant, on stoppe
const env = validateEnv(process.env);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Petit exemple pour vérifier que @arm/types est OK
const demoProduct: Product = {
  id: "p_1",
  slug: "demo",
  title: "Demo Product",
  priceCents: 1999,
  currency: "EUR",
  published: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

app.get("/products/demo", (_req, res) => res.json(demoProduct));

app.listen(env.PORT, () => {
  console.log(`API listening on ${env.PORT} (${env.NODE_ENV})`);
});
