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

Enregistrée dans le navigateur de l'appareil (localStorage). Les fonctions d'IA ne sont pas encore branchées dans cette version.
