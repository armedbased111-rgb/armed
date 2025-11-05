**État actuel de la stack** 

- **Frontend:** React + TypeScript avec Vite en dev, écran minimal “ARMED — Front Ready”; config Vite propre et **tsconfig** corrigé.
- **Backend:** Express + TypeScript, **CORS** et **JSON parser** actifs; endpoint **GET /health** sur **port 3001**; démarrage sécurisé par **validateEnv**.
- **Packages partagés:**

- **@arm/types:** modèles communs — Product, Order, License, Currency — importés par le front et l’API.
- **@arm/config:** **validation Zod** des variables critiques (**NODE_ENV, PORT, DATABASE_URL, API_BASE**); l’API **refuse de démarrer** si invalide.

- **Monorepo:** npm **workspaces** configurés (apps/web, apps/api, packages/types, packages/config); scripts root **dev:web** et **dev:api**; build vers **dist** opérationnel.
- **Dev tooling:** **ts-node** + **dotenv** pour l’API en dev; **ESLint/Prettier** et **.gitignore** en place.
- **Git:** dépôt en **SSH** vers GitHub; branches **dev** (travail) et **prod** (publication) créées; flux “feature → dev → prod” prêt, protection de **prod** à activer.
