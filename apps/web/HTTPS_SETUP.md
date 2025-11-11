# Configuration HTTPS pour le développement local

Pour utiliser Apple Pay et Google Pay en développement, vous devez activer HTTPS sur votre serveur de développement.

## Option 1 : Certificats auto-signés (Simple - Déjà configuré)

Vite génère automatiquement des certificats HTTPS auto-signés. Il suffit de redémarrer le serveur :

```bash
npm run dev
```

⚠️ **Note importante** : 
- Votre navigateur affichera un avertissement de sécurité
- Vous devrez accepter le certificat (cliquez sur "Avancé" puis "Continuer vers localhost")
- **Apple Pay peut ne pas fonctionner avec des certificats auto-signés sur Safari**

## Option 2 : mkcert (Recommandé pour Apple Pay)

mkcert crée des certificats SSL locaux valides, reconnus par votre système et les navigateurs.

### Installation sur macOS

```bash
# Installer mkcert via Homebrew
brew install mkcert

# Installer l'autorité de certification locale
mkcert -install

# Générer les certificats pour localhost
cd apps/web
mkcert localhost 127.0.0.1 ::1
```

Cela créera deux fichiers (les noms peuvent varier selon la version de mkcert) :
- `localhost+2-key.pem` ou `localhost-key.pem` (clé privée)
- `localhost+2.pem` ou `localhost.pem` (certificat)

La configuration Vite détecte automatiquement ces fichiers, quel que soit le nom.

### Utilisation

Une fois les certificats générés, Vite les détectera automatiquement au prochain démarrage :

```bash
npm run dev
```

✅ **Avantages** :
- Pas d'avertissement de sécurité dans le navigateur
- Apple Pay fonctionne correctement sur Safari
- Google Pay fonctionne correctement sur Chrome

## Vérification

1. Démarrez le serveur : `npm run dev`
2. Ouvrez votre navigateur sur `https://localhost:5173`
3. Vérifiez que l'URL commence par `https://`
4. Consultez la console du navigateur pour vérifier que PaymentRequest est disponible

## Dépannage

### Apple Pay ne s'affiche pas

1. Vérifiez que vous êtes bien sur `https://` (pas `http://`)
2. Vérifiez que vous avez Apple Pay configuré sur votre appareil
3. Vérifiez la console du navigateur pour les logs de débogage
4. Utilisez mkcert plutôt que des certificats auto-signés

### Erreur de certificat

Si vous voyez une erreur de certificat :
- Avec mkcert : Vérifiez que `mkcert -install` a été exécuté
- Avec auto-signé : Acceptez le certificat dans votre navigateur

### Mixed Content

Si vous voyez des erreurs de "mixed content" :
- Vérifiez que le proxy Vite est configuré (déjà fait dans `vite.config.ts`)
- Utilisez `/api/` au lieu de `http://localhost:4000` dans les appels API

## Production

En production, vous devez utiliser un certificat SSL valide (Let's Encrypt, etc.) fourni par votre hébergeur.

