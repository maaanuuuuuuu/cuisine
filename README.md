# Cuisine

Ce repo sert de mémoire durable pour Codex afin de gérer les repas, recettes, listes de courses et archives cuisine.

Principe :

- Codex est le cerveau.
- Le repo est la mémoire durable.
- L'app web statique sert uniquement à consulter la semaine, la semaine précédente, les recettes et la liste de courses.

## Structure

- `Plan.md` : spécification du workflow.
- `Cuisine/` : notes lisibles dans Obsidian, source de mémoire principale.
- `data/public/` : données publiables par GitHub Pages.
- `site/` : HTML, CSS et JavaScript natifs.
- `scripts/` : validation, build et serveur local.
- `.github/workflows/pages.yml` : publication GitHub Pages.

## Commandes

```bash
npm run validate
npm run site:build
npm run site:dev
```

`site:dev` sert le contenu généré de `dist/` sur `http://localhost:4173`.

## Générer une semaine avec Codex

Demander à Codex :

```text
Relis Plan.md, Cuisine/preferences.md, Cuisine/feedback.md, Cuisine/favorites.md,
Cuisine/avoid.md, Cuisine/recipes/, Cuisine/weeks/ et Cuisine/shopping-lists/.
Génère la prochaine semaine de repas végétariens : 7 dîners + 3 déjeuners
mercredi/samedi/dimanche, en tenant compte de l'historique et des préférences.
Mets à jour les notes Obsidian, la liste de courses consolidée et les données
publiques du site. Lance npm run validate et npm run site:build. Si tout passe,
commit avec un message clair et push.
```

## Modifier une semaine déjà publiée

Demander à Codex une modification précise, par exemple :

```text
Remplace le dîner de mercredi de la semaine courante par une recette plus rapide,
puis mets à jour la liste de courses, les données publiques du site, validate/build,
commit et push.
```

Codex doit toujours écrire les changements dans les fichiers du repo. Le chat ne doit pas être la seule mémoire.

## Automation Codex active

Une automation locale Codex active a été créée :

- id : `cuisine-weekly-planning-orchestrator`
- fréquence : lundi 08:00, Europe/Paris
- dossier : `C:\Users\USER\Desktop\devs\Cuisine`
- comportement : générer la prochaine semaine, lancer un sous-agent `$recipe-writer` en `5.5 Très approfondi` par brief recette, générer la liste de courses ordonnée avec `$shopping-list-writer`, mettre à jour `Cuisine/`, `data/public/`, lancer `npm run validate` puis `npm run site:build`, commit/push si un remote GitHub est configuré.

Si aucun remote GitHub n'est configuré au moment de l'exécution, l'automation doit laisser les changements validés localement et signaler que l'URL du repo manque.

## Donner un feedback

Exemples :

- `Cette recette était super bonne, mets-la en favori.`
- `Les enfants ont adoré cette recette.`
- `Trop long pour un soir de semaine.`
- `Évite de reproposer cette recette.`

Codex doit mettre à jour `Cuisine/feedback.md`, la note de recette concernée, et si nécessaire `Cuisine/favorites.md`, `Cuisine/avoid.md` ou `Cuisine/preferences.md`.

## Publication

Le workflow GitHub Pages build `dist/` à partir de `site/` et `data/public/`.

Le site public ne doit pas contenir :

- feedbacks privés ;
- préférences fines ;
- notes internes ;
- favoris.

Il publie :

- le planning de la semaine courante ;
- le planning de la semaine précédente ;
- la liste de courses de la semaine courante, aussi disponible sur `shopping.html` ;
- toutes les recettes générées publiables, avec recherche par mots clés.

## État Git

Ce dossier peut être initialisé avec Git puis relié au repo GitHub final :

```bash
git init -b main
git add .
git commit -m "Initial cuisine workflow"
git remote add origin <URL_DU_REPO>
git push -u origin main
```
