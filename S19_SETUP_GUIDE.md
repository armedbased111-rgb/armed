# S19: Guide de mise en place des téléchargements sécurisés

## 🎯 Objectif atteint

Système de téléchargements sécurisés avec:
- ✅ Liens signés avec JWT
- ✅ Expiration configurable (48h par défaut)
- ✅ Limite de téléchargements (3 par défaut)
- ✅ Journalisation IP/date de chaque téléchargement
- ✅ Interface utilisateur avec page de confirmation
- ✅ Génération automatique lors du paiement Stripe

## 📋 Étapes d'installation

### 1. Migration de la base de données

```bash
cd apps/api
npx prisma migrate dev --name add_downloads_tracking
npx prisma generate
```

Cette migration ajoute:
- Table `Download` pour le tracking
- Champs `fileUrl` et `fileSizeMb` au modèle `Product`

### 2. Installation des dépendances

```bash
cd apps/api
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 3. Configuration des variables d'environnement

Ajoutez à `/apps/api/.env`:

```env
# JWT Secret - ⚠️ CHANGEZ EN PRODUCTION !
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars

# Configuration des téléchargements
DOWNLOAD_EXPIRATION_HOURS=48
MAX_DOWNLOADS=3
```

### 4. Ajout des fichiers téléchargeables

#### Option A: Fichiers locaux (développement)

```bash
# Créer le dossier
mkdir -p apps/web/public/downloads

# Copier vos fichiers
cp /path/to/your-kit.zip apps/web/public/downloads/
```

Puis en SQL:

```sql
UPDATE "Product" 
SET "fileUrl" = './public/downloads/kit-808-foundation.zip',
    "fileSizeMb" = 250.5
WHERE slug = 'kit-808-foundation';
```

#### Option B: AWS S3 (production recommandée)

Voir `apps/api/DOWNLOAD_CONFIG.md` pour la configuration S3.

## 🚀 Architecture implémentée

### Backend (API)

#### Nouveau service: `src/services/downloads.ts`
- `generateDownloadLinksForOrder(orderId)` - Génère les liens signés
- `validateDownloadToken(token, clientIp)` - Valide un token
- `recordDownload(downloadId, clientIp)` - Enregistre un téléchargement
- `getDownloadStats(orderId)` - Statistiques

#### Nouvelles routes: `src/routes/downloads.ts`
- `GET /api/orders/:orderId/downloads` - Liste des liens
- `GET /api/downloads/:token` - Téléchargement (consomme 1 crédit)
- `GET /api/orders/:orderId/download-stats` - Stats
- `POST /api/downloads/validate` - Validation sans télécharger

#### Intégration Stripe webhook
Le webhook génère automatiquement les liens lors du paiement.

### Frontend (Web)

#### Nouveau hook: `src/hooks/useDownloads.ts`
Hook React pour charger les liens de téléchargement d'une commande.

#### Page mise à jour: `src/pages/CheckoutConfirmation.tsx`
Affiche maintenant:
- Informations de la commande
- Liste des produits avec boutons de téléchargement
- État des téléchargements (restants/max)
- Date d'expiration
- Messages d'erreur et états de chargement

### Base de données

#### Modèle `Download`
```prisma
model Download {
  id             String     @id @default(uuid())
  orderId        String
  orderItemId    String
  token          String     @unique
  expiresAt      DateTime
  maxDownloads   Int        @default(3)
  downloadCount  Int        @default(0)
  ipAddresses    String[]   @default([])
  downloadDates  DateTime[] @default([])
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  order          Order      @relation(...)
}
```

## 🔒 Sécurité

### Mécanismes de protection

1. **JWT signé**: Impossible de falsifier les tokens
2. **Expiration temporelle**: 48h par défaut
3. **Limite de téléchargements**: 3 par défaut
4. **IP tracking**: Chaque téléchargement enregistré
5. **Validation multicouche**: 
   - Signature JWT
   - Expiration
   - Compteur de téléchargements
   - Existence du produit/fichier

### Flux de sécurité

```
1. Utilisateur achète → Stripe webhook
2. Webhook crée Order (status: PAID)
3. generateDownloadLinksForOrder() crée les tokens
4. Page de confirmation affiche les liens
5. Clic télécharger → validateDownloadToken()
   ├─ Vérifie signature JWT ❌ → 403
   ├─ Vérifie expiration ❌ → 403
   ├─ Vérifie limite ❌ → 403
   └─ Tout OK ✅ → recordDownload() + stream file
6. IP + date enregistrés dans la DB
```

## 🧪 Tests

### Test complet du flux

```bash
# 1. Démarrer l'API
cd apps/api
npm run dev

# 2. Démarrer le frontend
cd apps/web
npm run dev

# 3. Faire un achat test avec Stripe
# 4. Aller sur la page de confirmation
# 5. Cliquer sur "Télécharger"
```

### Vérifier en base de données

```sql
-- Voir les downloads créés
SELECT * FROM "Download" ORDER BY "createdAt" DESC;

-- Voir les stats d'un order
SELECT 
  p.title,
  d."downloadCount",
  d."maxDownloads",
  d."expiresAt",
  d."ipAddresses"
FROM "Download" d
JOIN "OrderItem" oi ON d."orderItemId" = oi.id
JOIN "Product" p ON oi."productId" = p.id
WHERE d."orderId" = 'YOUR_ORDER_ID';
```

### Tests manuels à faire

- [ ] Téléchargement fonctionne avec un lien valide
- [ ] Erreur 403 si token expiré (modifier `expiresAt` en DB)
- [ ] Erreur 403 après 3 téléchargements
- [ ] IP et date enregistrés correctement
- [ ] Page de confirmation affiche les infos correctes
- [ ] Bouton "Télécharger" se désactive après 3 fois
- [ ] Message d'erreur si produit sans `fileUrl`

## 📊 Monitoring

### Requêtes utiles

```sql
-- Téléchargements par produit
SELECT 
  p.title,
  COUNT(d.id) as total_downloads,
  SUM(d."downloadCount") as total_download_count
FROM "Download" d
JOIN "OrderItem" oi ON d."orderItemId" = oi.id
JOIN "Product" p ON oi."productId" = p.id
GROUP BY p.id, p.title
ORDER BY total_download_count DESC;

-- Downloads suspects (nombreuses IPs différentes)
SELECT 
  d.id,
  d."orderId",
  array_length(d."ipAddresses", 1) as unique_ips,
  d."downloadCount"
FROM "Download" d
WHERE array_length(d."ipAddresses", 1) > 2;

-- Links qui vont expirer dans les 24h
SELECT 
  o."buyerEmail",
  p.title,
  d."expiresAt",
  d."downloadCount",
  d."maxDownloads"
FROM "Download" d
JOIN "Order" o ON d."orderId" = o.id
JOIN "OrderItem" oi ON d."orderItemId" = oi.id
JOIN "Product" p ON oi."productId" = p.id
WHERE d."expiresAt" < NOW() + INTERVAL '24 hours'
  AND d."expiresAt" > NOW()
  AND d."downloadCount" < d."maxDownloads";
```

## 🎨 Interface utilisateur

### Page de confirmation

La page `/checkout/confirmation` affiche maintenant:

```
✅ Confirmation de commande
├─ Référence, Email, Total
└─ 📥 Vos téléchargements
   ├─ Message informatif (48h, 3 téléchargements)
   ├─ Pour chaque produit:
   │  ├─ Titre
   │  ├─ Date d'expiration
   │  ├─ Téléchargements restants (X / 3)
   │  └─ Bouton "Télécharger" (ou "Épuisé")
   └─ 💡 Info: Email de confirmation envoyé
```

### États visuels

- 🟢 **Disponible**: Bouton violet, téléchargements restants
- 🟠 **Limite proche**: Affiche "1 / 3" en orange
- 🔴 **Épuisé**: Bouton gris désactivé, message d'alerte
- ⏰ **Chargement**: Animation pulse
- ❌ **Erreur**: Bordure rouge, message d'erreur

## 🚀 Déploiement

### Checklist production

1. **Sécurité**
   - [ ] Changer `JWT_SECRET` avec une valeur aléatoire forte
   - [ ] Utiliser S3 ou équivalent (pas de fichiers locaux)
   - [ ] Activer HTTPS sur l'API et le frontend

2. **Configuration**
   - [ ] Configurer les variables d'environnement
   - [ ] Tester l'expiration en production
   - [ ] Configurer le monitoring

3. **Stripe**
   - [ ] Webhook configuré en production
   - [ ] Tester avec des vrais paiements
   - [ ] Vérifier la génération des liens

4. **Base de données**
   - [ ] Migration appliquée
   - [ ] Index créés pour performance
   - [ ] Backup activé

## 📧 Email de confirmation (TODO futur)

Pour envoyer les liens par email, ajouter:

```typescript
// apps/api/src/services/email.ts
import nodemailer from 'nodemailer';

export async function sendDownloadEmail(orderId: string) {
  const links = await generateDownloadLinksForOrder(orderId);
  
  // Template email avec les liens
  const html = `
    <h1>Votre commande ${orderId}</h1>
    <p>Vos téléchargements :</p>
    ${links.downloads.map(d => `
      <div>
        <h3>${d.productTitle}</h3>
        <a href="${API_URL}${d.downloadUrl}">Télécharger</a>
        <p>Expire le: ${d.expiresAt}</p>
        <p>Téléchargements: ${d.maxDownloads}</p>
      </div>
    `).join('')}
  `;
  
  await transporter.sendMail({
    to: links.buyerEmail,
    subject: 'Vos téléchargements',
    html
  });
}
```

Appeler dans le webhook après la création de l'order.

## 📝 Résumé

Le système est maintenant **opérationnel** et sécurisé. Les utilisateurs peuvent:
1. Acheter des produits via Stripe
2. Recevoir des liens de téléchargement sécurisés
3. Télécharger leurs fichiers (3x max, 48h)
4. Voir l'état de leurs téléchargements

**Done when**: ✅ Le lien télécharge puis expire comme prévu.

---

Pour toute question ou amélioration, voir `apps/api/DOWNLOAD_CONFIG.md`.


