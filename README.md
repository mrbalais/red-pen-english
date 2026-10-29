# Red Pen English

Coach d'anglais personnel : conversation corrigée, dictée, exercices, articles, cours et carnet d'erreurs.

Application web installable (PWA) : ouvre le site dans Chrome sur Android, puis menu ⋮ → « Installer l'application ».

## Fichiers

- `index.html` : toute l'application (interface, exercices, logique).
- `manifest.webmanifest` : nom, icônes et couleurs de l'appli installée.
- `sw.js` : fonctionnement hors ligne et mises à jour. **Augmenter `VERSION` à chaque mise en ligne.**
- `icons/` : icônes, générées par `tools/make-icons.ps1`.
- `tools/serve.ps1` : serveur local pour tester sur http://localhost:8080.

## Progression

Enregistrée dans le navigateur de l'appareil (localStorage).

## IA (désactivée pour l'instant)

- `relay/` : relais Cloudflare Worker qui garde la clé API Anthropic hors de l'appli. Déjà déployé sur https://red-pen-relay.red-pen-relay.workers.dev.
- Pour activer l'IA : ajouter du crédit sur platform.claude.com, puis dans `relay/` lancer `npx.cmd wrangler secret put ANTHROPIC_API_KEY` et `npx.cmd wrangler secret put ACCESS_CODE`, et enfin renseigner `RELAY_URL` dans `index.html`.
- Modèles : Claude Haiku 5.5 pour la conversation, Claude Opus 5.5 pour la génération et les corrections (réglables dans `relay/src/index.js`).
