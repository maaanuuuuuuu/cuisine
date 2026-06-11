# Prompt d'automatisation hebdomadaire

Planification cible : chaque lundi à 08:00, timezone Europe/Paris.

```text
Ouvre le repo Cuisine. Relis Plan.md, obsidian/preferences.md, obsidian/feedback.md,
obsidian/favorites.md, obsidian/avoid.md, obsidian/recipes/, obsidian/weeks/ et
obsidian/shopping-lists/. Génère la prochaine semaine de repas végétariens :
7 dîners + 3 déjeuners mercredi/samedi/dimanche, en tenant compte de l'historique
et des préférences. Mets à jour les notes Obsidian, la liste de courses consolidée,
les données publiques du site, puis lance npm run validate et npm run site:build.
Si tout passe, commit avec un message clair et push.

Si aucun remote GitHub n'est configuré, laisse les changements validés localement
et signale qu'il manque l'URL du repo pour pousser et publier GitHub Pages.
```

