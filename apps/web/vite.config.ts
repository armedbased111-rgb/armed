import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

// Configuration HTTPS pour le développement
// Permet d'utiliser Apple Pay et Google Pay en local
function getHttpsConfig() {
  // Le répertoire où se trouve ce fichier de configuration (apps/web)
  const configDir = path.resolve(__dirname);
  
  // Essayer de charger des certificats SSL locaux (mkcert)
  // mkcert peut créer des fichiers avec différents noms selon les versions
  const possibleCertPaths = [
    path.join(configDir, "localhost+2.pem"), // Format moderne mkcert
    path.join(configDir, "localhost.pem"),   // Format classique
  ];
  const possibleKeyPaths = [
    path.join(configDir, "localhost+2-key.pem"), // Format moderne mkcert
    path.join(configDir, "localhost-key.pem"),   // Format classique
  ];

  // Chercher les certificats dans l'ordre de priorité
  for (let i = 0; i < possibleCertPaths.length; i++) {
    const certPath = possibleCertPaths[i];
    const keyPath = possibleKeyPaths[i];
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      try {
        const key = fs.readFileSync(keyPath);
        const cert = fs.readFileSync(certPath);
        console.log("✅ Certificats SSL locaux détectés (mkcert):", path.basename(certPath));
        return { key, cert };
      } catch (error) {
        console.error("⚠️  Erreur lors de la lecture des certificats:", error);
      }
    }
  }

  // Pas de certificats mkcert trouvés
  console.log("ℹ️  HTTPS désactivé. Pour activer Apple Pay / Google Pay:");
  console.log("   1. Installez mkcert: brew install mkcert");
  console.log("   2. Installez l'AC: mkcert -install");
  console.log("   3. Générez les certificats: cd apps/web && mkcert localhost");
  console.log("   4. Redémarrez le serveur");
  
  // Retourner undefined pour désactiver HTTPS temporairement
  return undefined;
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Activer HTTPS seulement si des certificats mkcert sont disponibles
    // Sinon, HTTP est utilisé (Apple Pay ne fonctionnera pas, mais le reste oui)
    https: getHttpsConfig(),
    // Proxy pour éviter les problèmes de mixed content (HTTPS -> HTTP)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
});
