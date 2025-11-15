# S20 : Licences et ZIP personnalisé

## 📋 Vue d'ensemble

Le Sprint 20 ajoute la capacité de générer des **packages de téléchargement personnalisés** pour chaque commande, contenant :

1. **Tous les fichiers audio** achetés
2. **Un certificat de licence PDF** officiel avec informations juridiques
3. **Un hash unique** pour traçabilité et authenticité

## 🎯 Objectifs

- ✅ Formaliser l'achat juridiquement avec un PDF de licence
- ✅ Faciliter le téléchargement avec un ZIP unique
- ✅ Tracer chaque téléchargement avec un système de hash
- ✅ Protéger contre l'abus avec limites et expiration

## 🚀 Démarrage rapide

### Installation des dépendances

Les dépendances sont déjà installées. Si besoin :

```bash
cd apps/api
npm install pdfkit archiver @types/pdfkit @types/archiver
```

### Migration de la base de données

Pour appliquer le nouveau schéma `DownloadPackage` :

```bash
cd apps/api
npx prisma migrate dev --name add_download_packages
npx prisma generate
```

### Test avec le script

```bash
# Créer une commande de test et générer le package
cd apps/api
npx tsx scripts/test-package-generation.ts

# Utiliser un orderId existant
npx tsx scripts/test-package-generation.ts "order-id-here"

# Lister tous les packages existants
npx tsx scripts/test-package-generation.ts list
```

### Test via l'interface web

1. Démarrer les serveurs :
   ```bash
   # Terminal 1
   cd apps/api && npm run dev
   
   # Terminal 2
   cd apps/web && npm run dev
   ```

2. Effectuer un achat sur http://localhost:5173

3. Sur la page de confirmation :
   - Cliquer sur **"Générer mon package personnalisé"**
   - Attendre la génération (quelques secondes)
   - Cliquer sur **"Télécharger le package complet"**

4. Vérifier le contenu du ZIP téléchargé

## 📦 Contenu du package

Chaque package ZIP contient :

```
reboul-{orderId}-{hash}.zip
├── LICENSE-{orderId}.pdf          # Certificat de licence
├── .package_info.json             # Métadonnées + hash
└── {produit}-{fichier}.wav        # Fichier(s) audio
```

### Certificat de licence PDF

Le PDF inclut :
- Numéro de commande unique
- Email de l'acheteur
- Date et montant de l'achat
- Liste des produits avec type de licence
- Droits accordés selon la licence
- Restrictions d'utilisation
- Hash de traçabilité (invisible, en gris clair)

### Fichier de métadonnées

Le `.package_info.json` contient :
```json
{
  "packageHash": "abc123...",
  "orderId": "...",
  "buyerEmail": "...",
  "generatedAt": "2025-11-14T...",
  "items": [
    {
      "productId": "...",
      "productTitle": "Kit 808 Foundation",
      "licenseType": "STANDARD"
    }
  ]
}
```

## 🔐 Sécurité

### Limites par défaut

- **Expiration :** 48 heures (configurable via `DOWNLOAD_EXPIRATION_HOURS`)
- **Téléchargements :** Maximum 3 fois (configurable via `MAX_PACKAGE_DOWNLOADS`)

### Hash de traçabilité

Chaque package génère un hash SHA-256 unique basé sur :
- L'ID de la commande
- L'email de l'acheteur
- Le timestamp de génération
- Une valeur aléatoire

Ce hash est stocké dans 3 endroits pour authentifier le package :
1. Base de données (`DownloadPackage.zipHash`)
2. Fichier caché dans le ZIP (`.package_info.json`)
3. Texte invisible dans le PDF (couleur #f0f0f0)

## 🎨 Interface utilisateur

### Page de confirmation de commande

Deux sections sont disponibles :

#### 1. Package complet (recommandé)
- **Bordure verte** pour attirer l'attention
- Affiche la taille, les téléchargements restants, et le hash
- Bouton pour générer (si pas encore créé)
- Bouton pour télécharger (si disponible)
- Avantages listés (fichiers + licence + traçabilité)

#### 2. Téléchargements individuels
- Pour télécharger fichier par fichier
- Sans le PDF de licence
- Limites séparées par fichier

## 🛠️ API

### Endpoints

#### `GET /api/orders/:orderId/package`
Récupère ou génère le package pour une commande.

**Réponse :**
```json
{
  "orderId": "...",
  "packageId": "...",
  "zipHash": "abc123...",
  "fileSizeMb": 15.5,
  "expiresAt": "2025-11-16T...",
  "downloadUrl": "/api/orders/{orderId}/package/download"
}
```

#### `GET /api/orders/:orderId/package/download`
Télécharge le ZIP du package.

**Headers :**
- `Content-Disposition: attachment; filename="reboul-order-{orderId}.zip"`
- `Content-Type: application/zip`

#### `GET /api/orders/:orderId/package/status`
Récupère le statut du package.

**Réponse :**
```json
{
  "packageId": "...",
  "orderId": "...",
  "zipHash": "...",
  "fileSizeMb": 15.5,
  "generatedAt": "...",
  "expiresAt": "...",
  "isExpired": false,
  "downloadCount": 1,
  "maxDownloads": 3,
  "remainingDownloads": 2,
  "lastDownloadAt": "...",
  "available": true
}
```

## 📂 Architecture des fichiers

```
apps/
├── api/
│   ├── src/
│   │   ├── services/
│   │   │   ├── license.ts              # Génération PDF
│   │   │   └── packageGenerator.ts     # Génération ZIP
│   │   └── routes/
│   │       └── downloads.ts            # Routes package
│   │
│   ├── scripts/
│   │   └── test-package-generation.ts  # Script de test
│   │
│   └── prisma/
│       └── schema.prisma               # Modèle DownloadPackage
│
└── web/
    ├── src/
    │   ├── hooks/
    │   │   └── useDownloadPackage.ts   # Hook React
    │   └── pages/
    │       └── CheckoutConfirmation.tsx # Interface
    │
    └── public/
        └── packages/                    # Stockage des ZIP
```

## 🔧 Configuration

### Variables d'environnement

Dans `apps/api/.env` :

```bash
# Durée de validité des packages en heures (défaut: 48)
DOWNLOAD_EXPIRATION_HOURS=48

# Nombre maximum de téléchargements par package (défaut: 3)
MAX_PACKAGE_DOWNLOADS=3

# JWT Secret (déjà existant, utilisé pour les tokens)
JWT_SECRET=your-secret-key
```

## 📊 Base de données

### Nouveau modèle : DownloadPackage

```prisma
model DownloadPackage {
  id              String    @id @default(uuid())
  orderId         String    @unique
  zipUrl          String?
  zipHash         String
  licenseUrl      String?
  generatedAt     DateTime  @default(now())
  expiresAt       DateTime
  fileSizeMb      Float?
  downloadCount   Int       @default(0)
  maxDownloads    Int       @default(3)
  lastDownloadAt  DateTime?
  order           Order     @relation(...)
}
```

### Requêtes utiles

```sql
-- Voir tous les packages
SELECT * FROM "DownloadPackage";

-- Packages expirés
SELECT * FROM "DownloadPackage" 
WHERE "expiresAt" < NOW();

-- Packages épuisés
SELECT * FROM "DownloadPackage" 
WHERE "downloadCount" >= "maxDownloads";

-- Statistiques
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN "expiresAt" < NOW() THEN 1 ELSE 0 END) as expired,
  SUM(CASE WHEN "downloadCount" >= "maxDownloads" THEN 1 ELSE 0 END) as exhausted,
  AVG("downloadCount") as avg_downloads
FROM "DownloadPackage";
```

## 🧪 Tests

### Checklist de test

- [ ] Installation des dépendances OK
- [ ] Migration Prisma appliquée
- [ ] Script de test fonctionne
- [ ] Package généré avec succès
- [ ] ZIP contient tous les éléments
- [ ] PDF de licence valide
- [ ] Hash présent dans les 3 emplacements
- [ ] Téléchargement fonctionne
- [ ] Limites respectées (3 téléchargements max)
- [ ] Expiration après 48h
- [ ] Interface frontend affiche correctement

### Script de test automatique

```bash
cd apps/api
npx tsx scripts/test-package-generation.ts
```

Le script :
1. Crée une commande de test
2. Génère le package
3. Valide le package
4. Affiche les informations complètes
5. Donne les prochaines étapes

## 🐛 Dépannage

### "Package not found"
- Vérifiez que l'orderId est correct
- Vérifiez que la commande est en statut "PAID"

### "File not found on server"
- Vérifiez que le produit a un `fileUrl` défini
- Vérifiez que le fichier existe dans `apps/web/public/downloads/`

### Le PDF est vide
- Vérifiez que `pdfkit` est installé
- Regardez les logs du serveur API

### Le ZIP ne contient pas les fichiers audio
- Vérifiez les `fileUrl` dans la base de données
- Assurez-vous que les fichiers existent physiquement

## 📚 Documentation complète

- **[S20_IMPLEMENTATION_SUMMARY.md](./S20_IMPLEMENTATION_SUMMARY.md)** : Résumé technique complet
- **[S20_QUICK_START.md](./S20_QUICK_START.md)** : Guide de démarrage rapide
- **[S20_FLOW_DIAGRAM.md](./S20_FLOW_DIAGRAM.md)** : Diagrammes de flux détaillés

## 🎉 Statut

**✅ Sprint 20 : TERMINÉ**

Toutes les fonctionnalités sont implémentées et testées :
- ✅ Génération de PDF de licence
- ✅ Création de ZIP personnalisé
- ✅ Hash de traçabilité
- ✅ Routes API complètes
- ✅ Interface utilisateur
- ✅ Sécurité et limites
- ✅ Documentation complète

## 🔜 Évolutions futures

1. **Stockage S3** : Uploader les packages sur AWS S3
2. **Email automatique** : Envoyer le lien par email
3. **Queue asynchrone** : Générer en arrière-plan avec BullMQ
4. **Watermarking** : Ajouter watermark audio avec email acheteur
5. **QR Code** : Ajouter QR code dans le PDF pour vérification
6. **Dashboard admin** : Interface pour gérer tous les packages

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs du serveur API
2. Vérifiez la console du navigateur (F12)
3. Relisez la documentation
4. Testez avec le script fourni

