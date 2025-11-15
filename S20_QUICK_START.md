# S20 : Guide de démarrage rapide

## 🚀 Démarrage rapide pour tester les packages personnalisés

### 1. Migration de la base de données

Si vous souhaitez appliquer la migration (optionnel pour l'instant) :

```bash
cd apps/api
npx prisma migrate dev --name add_download_packages
npx prisma generate
```

**Note :** Vous pouvez continuer sans appliquer la migration pour l'instant. Le code est prêt à être utilisé dès que vous aurez appliqué la migration.

### 2. Créer le dossier de stockage

Le système stockera les packages dans `apps/web/public/packages/`. Ce dossier sera créé automatiquement lors de la première génération.

### 3. Tester le système

#### Option A : Via l'interface web

1. **Démarrer les serveurs** (si pas déjà fait)
   ```bash
   # Terminal 1 - API
   cd apps/api
   npm run dev
   
   # Terminal 2 - Frontend
   cd apps/web
   npm run dev
   ```

2. **Effectuer un achat test**
   - Aller sur le catalogue : http://localhost:5173/catalog
   - Ajouter un produit au panier
   - Procéder au checkout
   - Utiliser une carte test Stripe : `4242 4242 4242 4242`

3. **Télécharger le package**
   - Sur la page de confirmation, cliquer sur "Générer mon package personnalisé"
   - Attendre la génération (quelques secondes)
   - Cliquer sur "Télécharger le package complet"

#### Option B : Via API directement

1. **Créer une commande test** (si vous avez un orderId existant, passez cette étape)
   ```bash
   cd apps/api
   npx tsx scripts/create-test-order.ts
   ```
   
   Notez l'`orderId` retourné.

2. **Générer le package**
   ```bash
   curl http://localhost:3000/api/orders/{orderId}/package
   ```
   
   Exemple de réponse :
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

3. **Vérifier le statut**
   ```bash
   curl http://localhost:3000/api/orders/{orderId}/package/status
   ```

4. **Télécharger le package**
   ```bash
   curl -O -J http://localhost:3000/api/orders/{orderId}/package/download
   ```
   
   Ou ouvrez dans un navigateur :
   ```
   http://localhost:3000/api/orders/{orderId}/package/download
   ```

### 4. Vérifier le contenu du ZIP

Une fois téléchargé, décompressez le ZIP et vérifiez :

```
reboul-{orderId}-{hash}.zip
├── LICENSE-{orderId}.pdf          ← Certificat de licence
├── .package_info.json             ← Métadonnées + hash
└── {nom-produit}-{fichier}.wav    ← Fichier(s) audio
```

**Ouvrez le PDF** pour voir :
- Informations de l'acheteur
- Type de licence
- Droits accordés
- Restrictions
- Hash de traçabilité (en gris très clair en bas)

**Ouvrez le .package_info.json** pour voir :
```json
{
  "packageHash": "...",
  "orderId": "...",
  "buyerEmail": "...",
  "generatedAt": "...",
  "items": [...]
}
```

### 5. Tester les limites

**Test d'expiration :** Le package expire après 48h par défaut.

**Test de limite de téléchargements :**
1. Téléchargez le package 3 fois
2. Essayez une 4ème fois → Vous devriez recevoir une erreur "Download limit reached"

**Vérifier le statut après téléchargement :**
```bash
curl http://localhost:3000/api/orders/{orderId}/package/status
```

Résultat attendu :
```json
{
  "downloadCount": 1,
  "maxDownloads": 3,
  "remainingDownloads": 2,
  "available": true
}
```

## 🔧 Configuration

### Variables d'environnement

Dans `apps/api/.env` (optionnel, valeurs par défaut) :

```bash
# Durée de validité en heures (défaut: 48)
DOWNLOAD_EXPIRATION_HOURS=48

# Nombre max de téléchargements (défaut: 3)
MAX_PACKAGE_DOWNLOADS=3
```

## 🐛 Dépannage

### Erreur : "Package not found"
- Vérifiez que l'`orderId` est correct
- Vérifiez que la commande est en statut "PAID"
- Essayez de regénérer le package

### Erreur : "File not found on server"
- Vérifiez que les produits ont un `fileUrl` défini
- Vérifiez que les fichiers existent dans `apps/web/public/downloads/`

### Le PDF est vide ou malformé
- Vérifiez que la dépendance `pdfkit` est bien installée
- Regardez les logs dans la console du serveur API

### Le ZIP ne contient pas les fichiers audio
- Vérifiez que les produits ont un `fileUrl` valide
- Vérifiez les chemins de fichiers dans la base de données
- Regardez les logs dans la console (warnings en jaune)

## 📊 Vérifier dans la base de données

```sql
-- Voir tous les packages générés
SELECT * FROM "DownloadPackage";

-- Voir les packages avec leurs commandes
SELECT 
  dp."id",
  dp."orderId",
  dp."zipHash",
  dp."downloadCount",
  dp."maxDownloads",
  dp."expiresAt",
  o."buyerEmail"
FROM "DownloadPackage" dp
JOIN "Order" o ON o."id" = dp."orderId";

-- Trouver les packages expirés
SELECT * FROM "DownloadPackage" 
WHERE "expiresAt" < NOW();

-- Trouver les packages épuisés
SELECT * FROM "DownloadPackage" 
WHERE "downloadCount" >= "maxDownloads";
```

## ✅ Checklist de test

- [ ] Migration de la base de données appliquée
- [ ] Dépendances installées (`pdfkit`, `archiver`)
- [ ] Serveur API démarré
- [ ] Serveur frontend démarré
- [ ] Commande test créée
- [ ] Package généré avec succès
- [ ] ZIP téléchargé
- [ ] PDF de licence présent et valide
- [ ] Fichier `.package_info.json` présent
- [ ] Fichiers audio présents dans le ZIP
- [ ] Limites de téléchargement fonctionnent
- [ ] Interface frontend affiche le package

## 🎉 Succès !

Si tous les tests passent, S20 est complètement fonctionnel ! 

Votre application REBOUL peut maintenant :
- ✅ Générer des certificats de licence PDF personnalisés
- ✅ Créer des packages ZIP traçables
- ✅ Formaliser juridiquement les achats
- ✅ Tracer les téléchargements avec un hash unique

## 📞 Support

En cas de problème, vérifiez :
1. Les logs du serveur API (`apps/api`)
2. La console du navigateur (F12)
3. Le fichier `S20_IMPLEMENTATION_SUMMARY.md` pour plus de détails

