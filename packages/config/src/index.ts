import { z } from "zod";

const NodeEnvSchema = z.enum(["development", "test", "production"]);

export const EnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  API_BASE: z.string().url(), // ex: http://localhost:3001
  JWT_SECRET: z.string().min(16).optional(), // si nécessaire
  // Ajoute d’autres vars critiques ici
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): Env {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    // Message clair pour l’opérateur + codes manquants
    const details = parsed.error.issues
      .map(i => `${i.path.join(".")}: ${i.message}`)
      .join("\n - ");
    throw new Error(`Invalid environment configuration:\n - ${details}`);
  }
  return parsed.data;
}
