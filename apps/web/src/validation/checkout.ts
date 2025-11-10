// apps/web/src/validation/checkout.ts
import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  country: z.string().min(2, { message: "Pays requis" }),
});
export type CheckoutForm = z.infer<typeof checkoutSchema>;
