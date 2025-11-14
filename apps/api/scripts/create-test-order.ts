import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestOrder() {
  // Utiliser le PaymentIntent de votre dernier test
  const paymentIntentId = "pi_3STU9WJNwWlJ5csL09mndUrM";
  const email = "zxransounds@gmail.com";
  
  // Trouver le produit
  const product = await prisma.product.findUnique({
    where: { slug: "kit-808-foundation" }
  });
  
  if (!product) {
    console.error("❌ Produit non trouvé!");
    return;
  }
  
  // Créer l'Order
  const order = await prisma.order.create({
    data: {
      buyerEmail: email,
      currency: "EUR",
      status: "PAID",
      totalCents: 4900,
      paymentIntentId: paymentIntentId,
      items: {
        create: [{
          productId: product.id,
          priceCents: 4900,
          currency: "EUR",
          licenseType: "STANDARD",
        }]
      }
    }
  });
  
  console.log("✅ Order créé:", order.id);
  console.log("🔗 Allez sur:");
  console.log(`   https://localhost:5173/checkout/confirmation?pi=${paymentIntentId}`);
  
  await prisma.$disconnect();
}

createTestOrder();