# S19: Démarrage rapide - Checklist

## ⚡ Installation en 5 étapes

### 1️⃣ Installer les dépendances (2 min)

```bash
cd apps/api
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 2️⃣ Configurer les variables d'environnement (1 min)

Ajouter à `apps/api/.env`:

```env
# Générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=VOTRE_SECRET_ICI_32_CHARS_MINIMUM

DOWNLOAD_EXPIRATION_HOURS=48
MAX_DOWNLOADS=3
```

### 3️⃣ Créer la migration de base de données (1 min)

```bash
cd apps/api
npx prisma migrate dev --name add_downloads_tracking
npx prisma generate
```

### 4️⃣ Ajouter un fichier de test (2 min)

```bash
# Créer le dossier
mkdir -p apps/web/public/downloads

# Copier un fichier test (ou créer un zip)
echo "test" > apps/web/public/downloads/test.txt
cd apps/web/public/downloads
zip kit-808-foundation.zip test.txt
cd ../../../..
```

Mettre à jour le produit:

```sql
UPDATE "Product" 
SET 
  "fileUrl" = './public/downloads/kit-808-foundation.zip',
  "fileSizeMb" = 0.001
WHERE slug = 'kit-808-foundation';
```

Ou utiliser le script:

```bash
cd apps/api
# Modifier scripts/add-product-files.ts avec vos produits
npx tsx scripts/add-product-files.ts
```

### 5️⃣ Tester ! (2 min)

```bash
# Terminal 1
cd apps/api
npm run dev

# Terminal 2
cd apps/web
npm run dev
```

1. Ouvrir http://localhost:5173
2. Ajouter un produit au panier
3. Faire un checkout test
4. Sur la page de confirmation, cliquer "Télécharger"

## ✅ Vérifications

### Base de données

```sql
-- Vérifier que la table Download existe
SELECT * FROM "Download" LIMIT 1;

-- Vérifier les produits avec fichiers
SELECT slug, title, "fileUrl", "fileSizeMb" 
FROM "Product" 
WHERE "fileUrl" IS NOT NULL;
```

### API endpoints

```bash
# Tester la santé de l'API
curl http://localhost:4000/health

# Tester un order (remplacer ORDER_ID)
curl http://localhost:4000/api/orders/ORDER_ID/downloads
```

## 🐛 Dépannage

### Erreur: "Environment variable not found: DATABASE_URL"
→ Vérifier que `.env` existe dans `apps/api/`

### Erreur: "Environment variable not found: JWT_SECRET"
→ Ajouter `JWT_SECRET` dans `apps/api/.env`

### Erreur: "Table 'Download' does not exist"
→ Exécuter la migration: `npx prisma migrate dev`

### Les liens n'apparaissent pas
1. Vérifier que l'order existe et status = 'PAID'
2. Vérifier les logs de l'API
3. Vérifier la console du navigateur

### Le téléchargement ne fonctionne pas
1. Vérifier que `fileUrl` est renseigné dans Product
2. Vérifier que le fichier existe à l'emplacement indiqué
3. Vérifier les logs de l'API pour les erreurs

### "Download link has expired"
→ Normal si la date `expiresAt` est passée. Créer un nouvel order.

### "Download limit reached"
→ Normal après 3 téléchargements. Créer un nouvel order.

## 📚 Documentation complète

- **Guide détaillé**: `S19_SETUP_GUIDE.md`
- **Résumé complet**: `S19_IMPLEMENTATION_SUMMARY.md`
- **Configuration**: `apps/api/DOWNLOAD_CONFIG.md`

## 🎯 Prêt pour la production ?

Voir la checklist de déploiement dans `S19_IMPLEMENTATION_SUMMARY.md` section "Déploiement en production".

Points critiques:
- ✅ JWT_SECRET sécurisé et aléatoire
- ✅ HTTPS activé partout
- ✅ S3 ou équivalent configuré (pas de fichiers locaux)
- ✅ Webhook Stripe en mode production
- ✅ Tests complets effectués

---

🚀 **Bon téléchargement sécurisé !**


