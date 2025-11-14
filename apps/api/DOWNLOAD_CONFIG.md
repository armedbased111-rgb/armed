# Configuration des téléchargements sécurisés (S19)

## Variables d'environnement

Ajoutez ces variables à votre fichier `.env` dans `/apps/api/.env`:

```env
# JWT Secret pour signer les tokens de téléchargement
# ⚠️ IMPORTANT: Changez cette valeur en production !
JWT_SECRET=your-very-secure-secret-key-change-me-in-production

# Durée d'expiration des liens de téléchargement (en heures)
# Par défaut: 48 heures
DOWNLOAD_EXPIRATION_HOURS=48

# Nombre maximum de téléchargements par achat
# Par défaut: 3 téléchargements
MAX_DOWNLOADS=3

# URL de la base de données (déjà configurée)
DATABASE_URL=postgresql://...

# Stripe (déjà configurées)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Configuration des fichiers produits

### Option 1: Fichiers locaux (développement)

Stockez vos fichiers dans `/apps/web/public/downloads/` et référencez-les dans la base de données:

```sql
UPDATE "Product" 
SET "fileUrl" = './public/downloads/mon-kit.zip',
    "fileSizeMb" = 250.5
WHERE slug = 'kit-808-foundation';
```

### Option 2: AWS S3 (production recommandée)

1. **Installer le SDK AWS**:
```bash
cd apps/api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. **Ajouter les variables d'environnement**:
```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

3. **Uploader vos fichiers sur S3** et référencez-les:
```sql
UPDATE "Product" 
SET "fileUrl" = 'https://your-bucket.s3.eu-west-1.amazonaws.com/products/mon-kit.zip',
    "fileSizeMb" = 250.5
WHERE slug = 'kit-808-foundation';
```

## Architecture de sécurité

### Comment ça marche

1. **Achat**: Quand un utilisateur achète un produit via Stripe
2. **Génération**: Le webhook Stripe génère automatiquement des tokens JWT signés
3. **Stockage**: Les tokens et métadonnées sont stockés dans la table `Download`
4. **Distribution**: Les liens sont affichés sur la page de confirmation et envoyés par email
5. **Validation**: À chaque téléchargement:
   - Vérification de la signature JWT
   - Vérification de l'expiration (48h par défaut)
   - Vérification du nombre de téléchargements (max 3 par défaut)
   - Journalisation de l'IP et de la date
6. **Tracking**: Toutes les tentatives de téléchargement sont enregistrées

### Sécurité

- **Tokens signés**: Les liens contiennent des JWT signés, impossibles à falsifier
- **Expiration temporelle**: Les liens expirent automatiquement après 48h
- **Limite de téléchargements**: Maximum 3 téléchargements par achat
- **IP tracking**: Chaque téléchargement enregistre l'IP et la date
- **Validation stricte**: Vérifications multiples avant chaque téléchargement

### Endpoints API

```
GET  /api/orders/:orderId/downloads
     → Récupère les liens de téléchargement pour une commande

GET  /api/downloads/:token
     → Télécharge le fichier (consomme un crédit de téléchargement)

GET  /api/orders/:orderId/download-stats
     → Statistiques de téléchargement (nombre, IPs, dates)

POST /api/downloads/validate
     → Valide un token sans télécharger
```

## Migration de la base de données

Exécutez la migration pour créer la table `Download`:

```bash
cd apps/api
npx prisma migrate dev --name add_downloads_tracking
```

Ou créez la migration manuellement si nécessaire.

## Installation des dépendances

N'oubliez pas d'installer jsonwebtoken:

```bash
cd apps/api
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

## Testing

### Test manuel

1. Créez une commande de test via Stripe
2. Vérifiez que les liens apparaissent sur `/checkout/confirmation?cid=ORDER_ID`
3. Cliquez sur "Télécharger" et vérifiez que le fichier se télécharge
4. Testez l'expiration en modifiant `expiresAt` dans la base
5. Testez la limite en téléchargeant 3 fois

### Vérifier les logs

Les téléchargements sont enregistrés dans la table `Download`:

```sql
SELECT 
  d.id,
  d."downloadCount",
  d."maxDownloads",
  d."expiresAt",
  d."ipAddresses",
  d."downloadDates",
  p.title as product
FROM "Download" d
JOIN "Order" o ON d."orderId" = o.id
JOIN "OrderItem" oi ON d."orderItemId" = oi.id
JOIN "Product" p ON oi."productId" = p.id
ORDER BY d."createdAt" DESC;
```

## Production

### Checklist avant déploiement

- [ ] Changer `JWT_SECRET` avec une valeur sécurisée
- [ ] Configurer S3 ou équivalent pour le stockage
- [ ] Tester l'expiration des liens
- [ ] Tester la limite de téléchargements
- [ ] Configurer l'envoi d'emails avec les liens
- [ ] Mettre en place une page "Mes téléchargements" pour les clients
- [ ] Configurer un monitoring des téléchargements suspects

### Améliorations futures

- [ ] Email avec liens de téléchargement
- [ ] Page "Mes achats" avec historique des téléchargements
- [ ] Notification quand un lien approche de l'expiration
- [ ] Renouvellement de lien (payant ou service client)
- [ ] Détection d'abus (trop de téléchargements depuis différentes IPs)

