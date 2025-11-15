# S20 : Licences et ZIP personnalisé - Résumé d'implémentation

## 🎯 Objectif
Formaliser l'achat juridiquement et tracer les téléchargements avec un package personnalisé contenant les fichiers audio et un certificat de licence PDF.

## ✅ Fonctionnalités implémentées

### 1. Génération de PDF de licence
**Fichier:** `apps/api/src/services/license.ts`

- ✅ Génération de certificat de licence PDF personnalisé
- ✅ Informations incluses :
  - Numéro de commande (orderId)
  - Email de l'acheteur
  - Type de licence (Standard / Extended)
  - Nom des produits
  - Date d'achat
  - Montant payé
- ✅ Droits accordés selon le type de licence
- ✅ Restrictions clairement énoncées
- ✅ Hash de traçabilité invisible (en gris très clair)
- ✅ Design professionnel avec mise en page soignée

### 2. Génération de ZIP personnalisé
**Fichier:** `apps/api/src/services/packageGenerator.ts`

- ✅ Création d'un ZIP contenant :
  - Tous les fichiers audio de la commande
  - Le certificat de licence PDF
  - Un fichier `.package_info.json` (hash invisible) pour traçabilité
- ✅ Hash unique SHA-256 pour chaque package
- ✅ Stockage local avec possibilité d'extension vers S3
- ✅ Gestion de l'expiration (48h par défaut)
- ✅ Limite de téléchargements (3 par défaut)
- ✅ Nettoyage automatique des fichiers temporaires

### 3. Modèle de données
**Fichier:** `apps/api/prisma/schema.prisma`

Nouveau modèle `DownloadPackage` ajouté :
```prisma
model DownloadPackage {
  id              String   @id @default(uuid())
  orderId         String   @unique
  zipUrl          String?
  zipHash         String
  licenseUrl      String?
  generatedAt     DateTime @default(now())
  expiresAt       DateTime
  fileSizeMb      Float?
  downloadCount   Int      @default(0)
  maxDownloads    Int      @default(3)
  lastDownloadAt  DateTime?
  order           Order    @relation(...)
}
```

### 4. Routes API
**Fichier:** `apps/api/src/routes/downloads.ts`

Nouvelles routes ajoutées :

- `GET /api/orders/:orderId/package`
  - Récupère ou génère le package pour une commande
  - Retourne les métadonnées (hash, taille, expiration)

- `GET /api/orders/:orderId/package/download`
  - Télécharge le ZIP personnalisé
  - Vérifie les limites et l'expiration
  - Enregistre le téléchargement

- `GET /api/orders/:orderId/package/status`
  - Récupère le statut du package
  - Nombre de téléchargements restants
  - Disponibilité

### 5. Frontend - Hook React
**Fichier:** `apps/web/src/hooks/useDownloadPackage.ts`

- ✅ Hook personnalisé pour gérer le package
- ✅ Génération à la demande
- ✅ Récupération du statut
- ✅ Gestion du téléchargement
- ✅ Gestion des erreurs et états de chargement

### 6. Frontend - Interface utilisateur
**Fichier:** `apps/web/src/pages/CheckoutConfirmation.tsx`

- ✅ Section dédiée "Package complet (Recommandé)"
- ✅ Affichage des informations :
  - Taille du fichier
  - Téléchargements restants
  - Date d'expiration
  - Hash de traçabilité (aperçu)
- ✅ Bouton de génération si pas encore créé
- ✅ Bouton de téléchargement si disponible
- ✅ Indicateurs visuels (vert pour disponible)
- ✅ Messages d'erreur clairs
- ✅ Section séparée pour téléchargements individuels

## 🔒 Sécurité et traçabilité

### Hash de traçabilité
Chaque package génère un hash SHA-256 unique basé sur :
- `orderId`
- Email de l'acheteur
- Timestamp de génération
- Valeur aléatoire

Ce hash est stocké :
1. Dans la base de données (`DownloadPackage.zipHash`)
2. Dans le fichier `.package_info.json` inclus dans le ZIP
3. Dans le PDF de licence (texte en gris très clair)

### Limites de sécurité
- ✅ Expiration après 48h (configurable via `DOWNLOAD_EXPIRATION_HOURS`)
- ✅ Maximum 3 téléchargements (configurable via `MAX_PACKAGE_DOWNLOADS`)
- ✅ Validation à chaque téléchargement
- ✅ Tracking de la date du dernier téléchargement

## 📁 Structure des fichiers

### Package ZIP généré
```
reboul-{orderId}-{hash-court}.zip
├── LICENSE-{orderId}.pdf          # Certificat de licence
├── .package_info.json             # Métadonnées + hash complet
├── {produit-1}-{fichier}.wav      # Fichiers audio
└── {produit-2}-{fichier}.wav
```

### Stockage
- **Temporaire :** `apps/api/temp/{orderId}/`
- **Permanent :** `apps/web/public/packages/`

## 🚀 Utilisation

### Côté Backend

```typescript
import { getOrCreateDownloadPackage } from "../services/packageGenerator";

// Générer ou récupérer un package
const packageInfo = await getOrCreateDownloadPackage(orderId);

// Valider avant téléchargement
const validation = await validatePackageDownload(orderId);

// Enregistrer un téléchargement
await recordPackageDownload(packageId);
```

### Côté Frontend

```typescript
import { useDownloadPackage } from "../hooks/useDownloadPackage";

const {
  downloadPackage,      // Fonction pour télécharger
  packageStatus,        // Statut actuel
  generating,           // État de génération
  fetchOrGeneratePackage  // Générer manuellement
} = useDownloadPackage(orderId);
```

## 🎨 Expérience utilisateur

### Page de confirmation
1. **Section "Package complet"** (recommandée, en vert)
   - Bouton "Générer mon package personnalisé" si pas encore créé
   - Bouton "Télécharger le package complet" si disponible
   - Informations claires sur le contenu et les limites

2. **Section "Téléchargements individuels"**
   - Liste des fichiers disponibles séparément
   - Pour les utilisateurs qui préfèrent télécharger fichier par fichier

### Avantages du package complet
- ✓ Tous les fichiers en un seul téléchargement
- ✓ Certificat de licence officiel inclus
- ✓ Hash unique pour authenticité
- ✓ Traçabilité juridique

## 📝 Variables d'environnement

```bash
# Durée de validité des packages (en heures)
DOWNLOAD_EXPIRATION_HOURS=48

# Nombre maximum de téléchargements
MAX_PACKAGE_DOWNLOADS=3
```

## 🔄 Migration de la base de données

Après avoir mis à jour le schéma Prisma, exécuter :

```bash
cd apps/api
npx prisma migrate dev --name add_download_packages
npx prisma generate
```

## 🧪 Tests suggérés

1. ✅ Créer une commande test
2. ✅ Générer le package complet
3. ✅ Vérifier que le ZIP contient :
   - Les fichiers audio
   - Le PDF de licence
   - Le fichier `.package_info.json`
4. ✅ Télécharger le package plusieurs fois
5. ✅ Vérifier les limites de téléchargement
6. ✅ Vérifier l'expiration après 48h

## 🎯 Done when

Le Sprint 20 est considéré comme terminé quand :

- ✅ Le PDF de licence est généré avec toutes les informations requises
- ✅ Le ZIP personnalisé contient les fichiers + PDF + hash
- ✅ Le hash de traçabilité est stocké et invisible
- ✅ Le téléchargement du ZIP complet fonctionne
- ✅ Les limites (expiration, nombre de téléchargements) sont respectées
- ✅ L'interface utilisateur affiche clairement l'option du package complet
- ✅ Le tracking des téléchargements est fonctionnel

**Statut : ✅ DONE**

## 🔜 Améliorations futures possibles

1. **Stockage S3**
   - Implémenter l'upload vers AWS S3
   - Générer des URLs signées pour le téléchargement

2. **Email automatique**
   - Envoyer le lien du package par email après génération
   - Inclure le PDF de licence en pièce jointe

3. **Génération asynchrone**
   - Utiliser une queue (Bull, BullMQ) pour générer les packages en arrière-plan
   - Notifier l'utilisateur quand c'est prêt

4. **Watermarking**
   - Ajouter un watermark audio avec l'email de l'acheteur
   - Renforcer la traçabilité

5. **Personnalisation du PDF**
   - Logo REBOUL
   - QR code vers la page de vérification de licence
   - Numéro de série unique

6. **Dashboard admin**
   - Voir tous les packages générés
   - Statistiques de téléchargement
   - Régénération manuelle si nécessaire

