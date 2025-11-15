// apps/api/src/services/license.ts
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { LicenseType } from "@prisma/client";
import crypto from "crypto";

export interface LicenseInfo {
  orderId: string;
  buyerEmail: string;
  buyerName?: string;
  licenseType: LicenseType;
  productTitle: string;
  purchaseDate: Date;
  totalAmount: string;
  currency: string;
}

/**
 * Génère un PDF de licence pour un achat
 * @param licenseInfo Informations sur la licence
 * @returns Buffer contenant le PDF
 */
export async function generateLicensePDF(licenseInfo: LicenseInfo): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];

    // Collecter les chunks du PDF
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("CERTIFICAT DE LICENCE", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("REBOUL - Licence d'utilisation musicale", { align: "center" })
      .moveDown(2);

    // Ligne de séparation
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1.5);

    // Informations de la licence
    doc.fontSize(14).font("Helvetica-Bold").text("INFORMATIONS DE LA LICENCE");
    doc.moveDown(0.5);

    const labelX = 50;
    const valueX = 200;
    let currentY = doc.y;

    const addField = (label: string, value: string) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(label + ":", labelX, currentY);
      
      doc
        .font("Helvetica")
        .text(value, valueX, currentY);
      
      currentY += 25;
      doc.y = currentY;
    };

    addField("Numéro de commande", licenseInfo.orderId);
    addField("Titulaire de la licence", licenseInfo.buyerEmail);
    addField("Type de licence", getLicenseTypeName(licenseInfo.licenseType));
    addField("Produit", licenseInfo.productTitle);
    addField(
      "Date d'achat",
      licenseInfo.purchaseDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    addField("Montant payé", `${licenseInfo.totalAmount} ${licenseInfo.currency}`);

    doc.moveDown(2);

    // Ligne de séparation
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1.5);

    // Droits accordés
    doc.fontSize(14).font("Helvetica-Bold").text("DROITS ACCORDÉS");
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");

    const rights = getLicenseRights(licenseInfo.licenseType);
    rights.forEach((right) => {
      doc
        .text("• ", { continued: true })
        .text(right)
        .moveDown(0.3);
    });

    doc.moveDown(1.5);

    // Restrictions
    doc.fontSize(14).font("Helvetica-Bold").text("RESTRICTIONS");
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");

    const restrictions = getLicenseRestrictions(licenseInfo.licenseType);
    restrictions.forEach((restriction) => {
      doc
        .text("• ", { continued: true })
        .text(restriction)
        .moveDown(0.3);
    });

    doc.moveDown(2);

    // Footer
    doc.fontSize(9).font("Helvetica-Oblique").text(
      "Ce certificat est une preuve d'achat et de licence d'utilisation. " +
        "Il doit être conservé pour toute demande ultérieure. " +
        "Les conditions générales d'utilisation sont disponibles sur reboul.fr",
      {
        align: "center",
        width: 495,
      }
    );

    doc.moveDown(1);

    // Hash de traçabilité (invisible à l'œil mais présent dans le PDF)
    const traceHash = generateTraceHash(licenseInfo);
    doc
      .fontSize(6)
      .fillColor("#f0f0f0")
      .text(`TRACE:${traceHash}`, { align: "center" });

    // Finaliser le PDF
    doc.end();
  });
}

/**
 * Génère un hash de traçabilité unique pour cette licence
 */
function generateTraceHash(licenseInfo: LicenseInfo): string {
  const data = `${licenseInfo.orderId}-${licenseInfo.buyerEmail}-${licenseInfo.purchaseDate.toISOString()}`;
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);
}

/**
 * Retourne le nom lisible du type de licence
 */
function getLicenseTypeName(type: LicenseType): string {
  const names: Record<LicenseType, string> = {
    STANDARD: "Licence Standard",
    EXTENDED: "Licence Étendue (Extended)",
    MP3: "MP3 Lease",
    WAV: "WAV Lease",
    EXCLUSIVE: "Exclusive Rights",
  };
  return names[type] || type;
}

/**
 * Retourne les droits accordés selon le type de licence
 */
function getLicenseRights(type: LicenseType): string[] {
  const standard = [
    "Utilisation à des fins personnelles et non commerciales",
    "Enregistrement de démos et maquettes",
    "Partage sur les plateformes de streaming (jusqu'à 500 000 streams)",
    "Modification et adaptation du contenu audio",
  ];

  const extended = [
    "Tous les droits de la licence Standard",
    "Utilisation commerciale illimitée",
    "Distribution physique et numérique sans limite",
    "Utilisation pour films, publicités, jeux vidéo",
    "Streams et vues illimités",
    "Revente sous forme de composition originale",
  ];

  const mp3 = [
    "MP3 Format (320kbps)",
    "Droits non-exclusifs",
    "Distribution sur plateformes de streaming",
    "Jusqu'à 10 000 streams",
    "Version avec tag du producteur",
  ];

  const wav = [
    "WAV Format (Haute Qualité)",
    "Droits non-exclusifs",
    "Streams illimités",
    "Utilisation commerciale",
    "Version sans tag",
    "Stems disponibles en option",
  ];

  const exclusive = [
    "Formats WAV + MP3",
    "Propriété exclusive à 100%",
    "Distribution illimitée",
    "Beat retiré de la vente",
    "Stems complets inclus",
    "Option de retrait du crédit producteur",
    "Transfert des droits d'auteur",
  ];

  switch (type) {
    case "EXTENDED":
      return extended;
    case "MP3":
      return mp3;
    case "WAV":
      return wav;
    case "EXCLUSIVE":
      return exclusive;
    default:
      return standard;
  }
}

/**
 * Retourne les restrictions selon le type de licence
 */
function getLicenseRestrictions(type: LicenseType): string[] {
  const common = [
    "Interdiction de revendre le contenu audio original tel quel",
    "Interdiction de sous-licencier à des tiers",
  ];

  switch (type) {
    case "STANDARD":
      return [
        ...common,
        "Les droits d'auteur restent la propriété de REBOUL",
        "Usage commercial limité (consulter les CGV pour les détails)",
        "Limite de 500 000 streams sur les plateformes",
      ];
    
    case "MP3":
      return [
        ...common,
        "Les droits d'auteur restent la propriété du producteur",
        "Crédit du producteur obligatoire",
        "Limite de 10 000 streams",
        "Version avec tag audio",
      ];
    
    case "WAV":
      return [
        ...common,
        "Les droits d'auteur restent la propriété du producteur",
        "Crédit du producteur obligatoire",
        "Licence non-exclusive (le beat peut être vendu à d'autres)",
      ];
    
    case "EXCLUSIVE":
      return [
        "Aucune restriction majeure - vous possédez tous les droits",
      ];
    
    default:
      return [
        ...common,
        "Les droits d'auteur restent la propriété de REBOUL",
      ];
  }
}

/**
 * Génère un PDF de licence pour une commande complète
 * @param orderInfo Informations complètes de la commande
 * @returns Buffer du PDF
 */
export async function generateOrderLicensePDF(orderInfo: {
  orderId: string;
  buyerEmail: string;
  items: Array<{
    productTitle: string;
    licenseType: LicenseType;
  }>;
  totalAmount: string;
  currency: string;
  purchaseDate: Date;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("CERTIFICAT DE LICENCE", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("REBOUL - Licence d'utilisation musicale", { align: "center" })
      .moveDown(2);

    // Ligne de séparation
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1.5);

    // Informations générales
    doc.fontSize(14).font("Helvetica-Bold").text("INFORMATIONS DE LA COMMANDE");
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica");
    doc.text(`Numéro de commande: ${orderInfo.orderId}`);
    doc.text(`Titulaire: ${orderInfo.buyerEmail}`);
    doc.text(
      `Date d'achat: ${orderInfo.purchaseDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    );
    doc.text(`Montant total: ${orderInfo.totalAmount} ${orderInfo.currency}`);
    doc.moveDown(1.5);

    // Produits achetés
    doc.fontSize(14).font("Helvetica-Bold").text("PRODUITS SOUS LICENCE");
    doc.moveDown(0.5);

    orderInfo.items.forEach((item, index) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${item.productTitle}`);
      
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`   Licence: ${getLicenseTypeName(item.licenseType)}`)
        .moveDown(0.5);
    });

    doc.moveDown(1);

    // Note légale
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        "Ce certificat atteste de l'acquisition des licences d'utilisation pour les produits listés ci-dessus. " +
          "Chaque produit est soumis aux conditions de sa licence respective. " +
          "Consultez les CGV sur reboul.fr pour plus de détails.",
        { align: "justify" }
      );

    // Hash de traçabilité
    const traceHash = generateTraceHash({
      orderId: orderInfo.orderId,
      buyerEmail: orderInfo.buyerEmail,
      licenseType: "STANDARD",
      productTitle: "ORDER",
      purchaseDate: orderInfo.purchaseDate,
      totalAmount: orderInfo.totalAmount,
      currency: orderInfo.currency,
    });

    doc
      .fontSize(6)
      .fillColor("#f0f0f0")
      .text(`TRACE:${traceHash}`, { align: "center" });

    doc.end();
  });
}

