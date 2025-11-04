README — Guide Git (dev → prod) ￼


- dev: espace de travail et de test. On y fusionne les tâches.

- prod: version publique et stable. On n’y met que ce qui est prêt.

Démarrage ￼

- Créer et pousser les branches:

 ▫ git checkout -b dev

 ▫ git push -u origin dev

 ▫ git checkout -b prod

 ▫ git push -u origin prod

Travailler au quotidien ￼

- Partir de dev à chaque nouvelle tâche:

 ▫ git checkout dev

 ▫ git pull

 ▫ git checkout -b feature/nom-de-ta-tache

- Commits petits et clairs:

 ▫ git add .

 ▫ git commit -m “feat(web): grid catalogue basique”

 ▫ git push -u origin feature/nom-de-ta-tache

- Ouvrir une Pull Request vers dev, vérifier, puis merger.

Publier en production ￼

- Quand dev est prêt:

 ▫ git checkout prod

 ▫ git pull

 ▫ git merge –no-ff dev

 ▫ git push origin prod

Corriger un bug urgent (hotfix) ￼

- Depuis prod:

 ▫ git checkout -b hotfix/1.0.1 prod

 ▫ corrige, commit, push

 ▫ git checkout prod && git merge –no-ff hotfix/1.0.1 && git push

 ▫ git checkout dev && git merge –no-ff hotfix/1.0.1 && git push

Conventions utiles ￼

- Branches: feature/…, fix/…, hotfix/x.y.z

- Commits: feat:, fix:, chore:, docs:, refactor:

 ▫ Exemple: feat(api): ajouter GET /products avec pagination

Rester propre ￼

- Mettre à jour ta branche avant de pousser:

 ▫ git fetch origin

 ▫ git rebase origin/dev

 ▫ git push –force-with-lease

- Supprimer les branches après merge:

 ▫ git branch -d feature/nom

 ▫ git push origin –delete feature/nom

Protection de prod (sur GitHub) ￼

- PR obligatoires

- CI verte (lint/build/tests)

- Interdiction de push direct

- Historique linéaire (optionnel)

Rappels rapides ￼

- Voir l’histoire: git log –oneline

- Annuler un fichier en cours: git restore chemin/fichier

- Abandonner un rebase: git rebase –abort

Ce guide suffit pour travailler à deux vitesses: tu construis sur dev, tu publies sur prod, et tu restes maître de l’historique.
