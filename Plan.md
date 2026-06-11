# Plan Codex cuisine

## 1. Objectif

Concevoir un workflow Codex pour gérer durablement :

- les repas hebdomadaires ;
- les recettes ;
- les listes de courses ;
- les retours d'expérience ;
- une consultation mobile via un site statique publié sur GitHub Pages.

Principe central : Codex est le cerveau. Le repo est la mémoire durable. Le site web est seulement une interface de consultation.

Le repo ne doit pas contenir de logique culinaire intelligente codée en dur. Les scripts peuvent seulement servir à valider, formater, transformer des données, générer le site statique et aider au déploiement.

## 2. Flow Codex complet

À chaque demande liée à la cuisine, Codex doit commencer par relire les fichiers du repo au lieu de compter sur l'historique de conversation.

Flow général :

1. Lire les préférences, historiques, semaines passées, recettes, listes de courses, feedbacks et fichiers d'index.
2. Comprendre le contexte actuel : semaine visée, contraintes éventuelles, recettes récentes, favoris, recettes à éviter, ingrédients disponibles ou à utiliser.
3. Proposer ou modifier un plan de repas.
4. Mettre à jour les fichiers Markdown Obsidian et les données nécessaires au site.
5. Lancer les validations et le build du site.
6. Vérifier les fichiers modifiés.
7. Commit avec un message clair.
8. Push vers GitHub.
9. Laisser GitHub Pages publier la nouvelle version.

## 3. Ce que Codex fait chaque lundi

Automatisation hebdomadaire :

- fréquence : chaque lundi ;
- heure : 08:00 ;
- timezone : Europe/Paris.

Chaque lundi, Codex doit générer :

- 7 dîners ;
- 3 déjeuners : mercredi, samedi et dimanche ;
- éventuellement des restes quand cela aide à réduire la charge cuisine ou les courses.

Étapes du lundi :

1. Ouvrir le repo.
2. Lire toute la mémoire utile :
   - `obsidian/preferences.md` ;
   - `obsidian/feedback.md` ;
   - `obsidian/favorites.md` ;
   - `obsidian/avoid.md` ;
   - `obsidian/recipes/` ;
   - `obsidian/weeks/` ;
   - `obsidian/shopping-lists/` ;
   - `data/public/` si présent.
3. Identifier les recettes récentes pour éviter les répétitions.
4. Identifier les contraintes permanentes :
   - végétarien ;
   - recettes en français ;
   - 2 adultes + 2 jeunes enfants ;
   - recettes pratiques pour une vie de famille ;
   - quantités répétées dans chaque étape ;
   - calories détaillées par ingrédient ;
   - si possible protéines, glucides et lipides ;
   - alerte explicite en cas d'ail cru, oignon cru ou échalote crue ;
   - pommes de terre précuites ou très finement coupées dans les gratins/plats similaires.
5. Générer une semaine variée et réaliste.
6. Créer ou mettre à jour les notes de recettes.
7. Créer la note de semaine.
8. Créer la liste de courses consolidée, groupée par rayon.
9. Inclure aussi les basiques du placard dans la liste de courses. L'utilisateur décidera quoi acheter selon ses stocks.
10. Mettre à jour les index Obsidian.
11. Mettre à jour les fichiers publics utilisés par le site.
12. Lancer :
    - validation ;
    - formatage si nécessaire ;
    - build du site.
13. Commit, par exemple : `Add meal plan for 2026-W25`.
14. Push.

## 4. Si le plan généré ne convient pas

Après la génération du lundi, l'utilisateur peut revenir dans Codex chat et demander des changements, par exemple :

- remplacer un repas ;
- rendre la semaine plus rapide ;
- limiter les courses ;
- utiliser certains ingrédients ;
- supprimer une recette qui ne tente pas ;
- ajuster une liste de courses ;
- changer une recette précise.

Dans ce cas, Codex doit :

1. Relire les fichiers du repo.
2. Identifier la semaine en cours ou la semaine mentionnée.
3. Modifier les recettes, la note de semaine et la liste de courses concernées.
4. Mettre à jour les données publiques du site.
5. Lancer les validations et le build.
6. Commit avec un message clair, par exemple : `Update meal plan for 2026-W25`.
7. Push pour republier GitHub Pages.

Le chat ne doit pas être la seule mémoire du changement. Les fichiers du repo doivent être mis à jour.

## 5. Ce que Codex fait quand l'utilisateur donne un feedback

Exemples :

- "Cette recette était super bonne, mets-la en favori."
- "Cette recette était bof, évite de me la reproposer."
- "Les enfants ont adoré cette recette."
- "Trop long pour un soir de semaine."
- "Ajoute à mes préférences que je préfère les plats avec moins d'ail cru."

Codex doit :

1. Relire les fichiers pertinents.
2. Identifier la recette ou la semaine concernée.
3. Mettre à jour la mémoire durable :
   - `obsidian/feedback.md` pour le retour brut ou synthétisé ;
   - la note de recette pour les retours liés à cette recette ;
   - `obsidian/favorites.md` si la recette devient favorite ;
   - `obsidian/avoid.md` si elle est à éviter ;
   - `obsidian/preferences.md` si le retour devient une préférence durable.
4. Mettre à jour les index si nécessaire.
5. Ne publier sur le site que les informations publiques utiles. Les feedbacks privés et préférences fines restent dans Obsidian/repo privé.
6. Commit/push si le changement doit être versionné immédiatement.

## 6. Ce que Codex fait quand l'utilisateur demande une lecture de recette

Exemple : "Relis-moi la recette de ce soir en mode cuisine."

Codex doit :

1. Lire la note de semaine courante.
2. Identifier le repas du jour et le moment concerné.
3. Lire la note de recette.
4. Répondre dans le chat avec une version cuisine :
   - ingrédients utiles ;
   - étapes claires ;
   - quantités répétées dans les étapes ;
   - alertes ail cru/oignon cru/échalote crue ;
   - conseils pratiques si nécessaires.

Cette action ne nécessite pas forcément de commit, sauf si l'utilisateur demande une correction ou si Codex repère une erreur dans la recette.

## 7. Structure de repo recommandée

```text
Cuisine/
  Plan.md
  README.md
  package.json
  .gitignore
  obsidian/
    index.md
    preferences.md
    favorites.md
    avoid.md
    feedback.md
    recipes/
      index.md
      recette-exemple.md
    weeks/
      2026-W25.md
    shopping-lists/
      2026-W25.md
  data/
    public/
      current-week.json
      previous-week.json
      recipes.json
      shopping-list.json
    private/
      README.md
  site/
    index.html
    recipe.html
    app.js
    styles.css
  scripts/
    validate.js
    build-site.js
  dist/
```

Notes :

- `obsidian/` est la source lisible principale.
- `data/public/` contient uniquement ce qui peut être publié sur GitHub Pages, dont la semaine courante, le planning de la semaine précédente et toutes les recettes générées publiables.
- `site/` contient le site statique natif HTML/CSS/JS.
- `dist/` contient la version générée publiée par GitHub Pages ou servie par l'action de build.

## 8. Structure Obsidian recommandée

```text
obsidian/
  index.md
  preferences.md
  favorites.md
  avoid.md
  feedback.md
  recipes/
    index.md
    gratin-courgettes-chevre.md
  weeks/
    2026-W25.md
  shopping-lists/
    2026-W25.md
```

### `obsidian/index.md`

Rôle :

- point d'entrée Obsidian ;
- liens vers la semaine courante ;
- liens vers recettes, listes, favoris, feedbacks, préférences.

### `obsidian/preferences.md`

Rôle :

- préférences culinaires durables ;
- contraintes alimentaires ;
- format attendu des recettes ;
- format attendu des listes de courses.

### `obsidian/recipes/`

Une note par recette.

Chaque note doit inclure :

- frontmatter YAML ;
- titre ;
- résumé ;
- portions ;
- temps ;
- ingrédients ;
- estimation calorique par ingrédient ;
- macros si disponibles ;
- alertes ;
- étapes avec quantités répétées ;
- notes Codex ;
- liens vers les semaines où la recette a été utilisée.

### `obsidian/weeks/`

Une note par semaine.

Chaque note doit inclure :

- semaine ISO ;
- dates ;
- tableau des repas ;
- liens vers les recettes ;
- indication des restes ;
- lien vers la liste de courses ;
- notes de planification.

### `obsidian/shopping-lists/`

Une liste par semaine, groupée par rayon.

Tous les ingrédients nécessaires doivent y apparaître, y compris les basiques du placard. L'utilisateur décidera quoi acheter selon ses stocks.

### `obsidian/favorites.md`

Liste des recettes appréciées, avec contexte :

- qui a aimé ;
- pourquoi ;
- date du retour ;
- lien vers la recette.

### `obsidian/avoid.md`

Liste des recettes à éviter ou à espacer fortement, avec raison.

### `obsidian/feedback.md`

Journal des retours utilisateur, daté et relié aux recettes ou semaines concernées.

## 9. Stratégie de mémoire durable

Source de vérité recommandée :

- Markdown Obsidian avec frontmatter YAML pour les recettes, semaines et listes.

Pourquoi :

- lisible par l'utilisateur ;
- facile à modifier par Codex ;
- agréable dans Obsidian ;
- exploitable par des scripts simples ;
- versionnable proprement dans Git.

Les fichiers JSON dans `data/public/` doivent être générés ou maintenus à partir de la mémoire Obsidian, avec un contenu limité au site public.

Règle importante :

- les préférences fines, feedbacks privés et notes internes ne doivent pas être publiés sur le site ;
- seules les données nécessaires à la consultation mobile doivent aller dans `data/public/`.

## 10. Frontmatter recommandé

### Recette

```yaml
---
type: recipe
slug: gratin-courgettes-chevre
title: Gratin de courgettes au chèvre
servings: "2 adultes + 2 jeunes enfants"
vegetarian: true
meal_types: ["diner"]
prep_time_minutes: 20
cook_time_minutes: 35
total_time_minutes: 55
difficulty: facile
tags: ["famille", "vegetarien"]
raw_alliums:
  garlic: false
  onion: false
  shallot: false
nutrition:
  calories_total: 0
  calories_per_serving: 0
  protein_g: null
  carbs_g: null
  fat_g: null
used_in_weeks: ["2026-W25"]
status: active
---
```

### Semaine

```yaml
---
type: week
week: 2026-W25
start_date: 2026-06-15
end_date: 2026-06-21
status: current
shopping_list: "../shopping-lists/2026-W25.md"
---
```

### Liste de courses

```yaml
---
type: shopping_list
week: 2026-W25
status: current
---
```

## 11. Partie minimale de code nécessaire

Stack recommandée :

- HTML natif ;
- CSS natif ;
- JavaScript natif ;
- Node.js uniquement pour scripts de validation/build.

Aucune logique culinaire dans le code.

Le code doit seulement :

- valider que les fichiers attendus existent ;
- vérifier que le frontmatter requis est présent ;
- copier ou transformer les données publiques ;
- générer `dist/` ;
- servir le site localement si besoin ;
- éventuellement formater les fichiers.

Commandes recommandées :

```json
{
  "scripts": {
    "validate": "node scripts/validate.js",
    "site:build": "node scripts/build-site.js",
    "site:dev": "npx serve dist"
  }
}
```

Le site peut fonctionner avec :

- `dist/index.html` pour la semaine courante et l'accès au planning de la semaine précédente ;
- `dist/recipes.html` pour rechercher dans toutes les recettes générées ;
- `dist/recipe.html?slug=...` pour le détail d'une recette ;
- `dist/assets/app.js` ;
- `dist/assets/styles.css` ;
- `dist/data/*.json`.

## 12. Site web

Le site GitHub Pages doit publier :

- la semaine courante ;
- le planning de la semaine précédente ;
- toutes les recettes générées publiables, avec une recherche par mots clés ;
- la liste de courses consolidée.

Il ne doit pas publier :

- favoris ;
- feedbacks privés ;
- préférences fines ;
- notes internes Codex.

Pages minimales :

1. Accueil / semaine courante
   - repas par jour ;
   - distinction déjeuner/dîner ;
   - liens vers recettes ;
   - lien ou onglet vers le planning de la semaine précédente ;
   - lien vers liste de courses.

2. Planning de la semaine précédente
   - repas par jour ;
   - distinction déjeuner/dîner ;
   - liens vers recettes ;
   - pas besoin de republier les feedbacks ou notes privées associés.

3. Catalogue de recettes
   - toutes les recettes générées publiables ;
   - recherche par mots clés côté navigateur ;
   - recherche sur titre, ingrédients, tags et résumé ;
   - liens vers les pages détail.

4. Recette
   - titre ;
   - temps ;
   - portions ;
   - ingrédients ;
   - calories par ingrédient ;
   - macros si disponibles ;
   - alertes ;
   - étapes en mode cuisine.

5. Liste de courses
   - groupée par rayon ;
   - quantités consolidées ;
   - basiques inclus.

Design :

- responsive mobile-first ;
- texte lisible en cuisine ;
- étapes séparées ;
- boutons ou ancres simples ;
- pas d'interface complexe.

## 13. Workflow GitHub Pages

Option recommandée :

- GitHub Actions build `dist/` depuis le repo ;
- publication de `dist/` sur GitHub Pages.

Workflow :

1. Push sur la branche principale.
2. GitHub Actions installe Node.
3. Lance `npm ci` si `package-lock.json` existe, sinon `npm install`.
4. Lance `npm run validate`.
5. Lance `npm run site:build`.
6. Publie `dist/` sur GitHub Pages.

Quand Codex modifie la semaine ou les recettes, il doit toujours pousser les changements après validation/build réussis.

## 14. Automatisation Codex

Mécanisme cible :

- automatisation Codex récurrente chaque lundi 08:00 Europe/Paris ;
- le prompt d'automatisation doit demander à Codex de relire le repo et de générer la semaine suivante.

Prompt d'automatisation recommandé :

```text
Ouvre le repo Cuisine. Relis Plan.md, obsidian/preferences.md, obsidian/feedback.md,
obsidian/favorites.md, obsidian/avoid.md, obsidian/recipes/, obsidian/weeks/ et
obsidian/shopping-lists/. Génère la prochaine semaine de repas végétariens :
7 dîners + 3 déjeuners mercredi/samedi/dimanche, en tenant compte de l'historique
et des préférences. Mets à jour les notes Obsidian, la liste de courses consolidée,
les données publiques du site, puis lance validate et site:build. Si tout passe,
commit avec un message clair et push.
```

Fallback si l'automatisation Codex récurrente n'est pas disponible :

- lancer manuellement Codex CLI le lundi avec le même prompt ;
- ou créer un rappel externe qui demande à l'utilisateur de lancer Codex.

À éviter :

- un script `generate:week` qui contiendrait la logique de génération culinaire ;
- un script Node qui appelle un LLM pour choisir les recettes.

## 15. Git et versioning

Chaque changement significatif doit être versionné.

Messages de commit recommandés :

- `Add meal plan for 2026-W25`
- `Update meal plan for 2026-W25`
- `Add feedback for gratin courgettes chevre`
- `Update cooking preferences`
- `Add static recipe site`

Avant chaque commit :

1. Vérifier `git status`.
2. Relire les changements importants.
3. Lancer `npm run validate`.
4. Lancer `npm run site:build`.
5. Commit seulement si les validations passent.

État actuel : le dossier local est initialisé comme repo Git sur la branche `main`. Il reste à connecter le remote GitHub quand l'URL du repo sera connue, puis à pousser la branche.

## 16. Risques et limites

### Qualité nutritionnelle

Les calories et macros produites par Codex seront des estimations. Elles doivent être présentées comme telles.

### Cohérence des quantités

Codex doit vérifier que les quantités des ingrédients sont cohérentes entre :

- recette ;
- étapes ;
- liste de courses.

La validation automatique peut détecter des champs manquants, mais pas garantir toute la cohérence culinaire.

### Données privées

GitHub Pages est public si le repo ou le site est public. Les feedbacks privés et préférences fines ne doivent pas être copiés dans `data/public/` ni `dist/`.

### Automatisation

Le succès du commit/push automatique dépendra des permissions GitHub disponibles dans l'environnement Codex.

### Pas de mémoire implicite

Tout retour durable doit être écrit dans les fichiers. Sinon Codex risque de ne pas le prendre en compte lors d'une future exécution.

### Simplicité du site

Le site ne doit pas devenir le centre du système. Il doit rester une vue statique des données publiques.

## 17. Questions levées

Décisions prises :

- repas hebdomadaires : 7 dîners + 3 déjeuners mercredi, samedi et dimanche ;
- restes autorisés ;
- publication GitHub Pages : semaine courante, planning de la semaine précédente, liste de courses, et toutes les recettes générées publiables avec recherche par mots clés ;
- pas de publication des favoris ;
- pas de publication des préférences fines ni feedbacks privés ;
- les basiques du placard sont inclus dans la liste de courses ;
- stack web : HTML, CSS et JavaScript natifs ;
- automatisation : lundi 08:00 Europe/Paris ;
- commit/push automatique après validation/build réussis ;
- pas d'autres contraintes alimentaires pour l'instant ;
- après génération, l'utilisateur peut demander des changements via Codex chat et Codex doit republier sur GitHub Pages.

Questions restantes avant implémentation complète :

1. Quelle sera l'URL du repo GitHub ?
2. Le repo GitHub sera-t-il public ou privé ?
3. GitHub Pages publiera-t-il depuis GitHub Actions ou depuis une branche dédiée ?
4. Faut-il conserver le repo local actuel comme source initiale ou le raccorder à un repo GitHub déjà existant ?

Ces questions ne bloquent pas l'implémentation locale, mais elles seront nécessaires pour finaliser le push et vérifier la publication GitHub Pages réelle.

## 18. Plan d'implémentation progressif

### Phase 1 - Socle mémoire

Créer :

- `obsidian/index.md` ;
- `obsidian/preferences.md` ;
- `obsidian/favorites.md` ;
- `obsidian/avoid.md` ;
- `obsidian/feedback.md` ;
- `obsidian/recipes/index.md` ;
- `obsidian/weeks/` ;
- `obsidian/shopping-lists/`.

Remplir `preferences.md` avec les préférences initiales.

### Phase 2 - Modèles Markdown

Créer des modèles ou exemples pour :

- recette ;
- semaine ;
- liste de courses ;
- feedback.

Objectif : rendre les futures générations Codex homogènes.

### Phase 3 - Première semaine manuelle avec Codex

Demander à Codex de générer une première semaine complète :

- 7 dîners ;
- 3 déjeuners ;
- recettes ;
- liste de courses ;
- index.

Valider manuellement le format avant d'ajouter plus d'automatisation.

### Phase 4 - Données publiques

Définir et produire :

- `data/public/current-week.json` ;
- `data/public/previous-week.json` ;
- `data/public/recipes.json`, contenant toutes les recettes générées publiables et les champs nécessaires à la recherche ;
- `data/public/shopping-list.json`.

Vérifier qu'aucune donnée privée n'est publiée.

### Phase 5 - Site statique natif

Créer :

- `site/index.html` ;
- `site/recipe.html` ;
- `site/app.js` ;
- `site/styles.css` ;
- `scripts/build-site.js`.

Le site doit lire les JSON publics et générer/servir une consultation mobile simple.

### Phase 6 - Validation

Créer `scripts/validate.js` pour vérifier :

- présence des fichiers clés ;
- frontmatter requis ;
- liens principaux ;
- existence des recettes référencées par la semaine courante ;
- existence de la liste de courses de la semaine courante ;
- absence de fichiers privés dans les données publiques.

### Phase 7 - GitHub Pages

Ajouter le workflow GitHub Actions de publication.

Tester :

- `npm run validate` ;
- `npm run site:build` ;
- publication GitHub Pages.

### Phase 8 - Workflow Codex hebdomadaire

Créer l'automatisation Codex du lundi.

Documenter dans `README.md` :

- comment lancer une génération hebdomadaire ;
- comment demander une modification ;
- comment ajouter un feedback ;
- quelles commandes vérifier avant commit.

### Phase 9 - Ajustements après usage réel

Après quelques semaines :

- améliorer le format des listes de courses ;
- ajuster les rayons ;
- ajouter des tags utiles ;
- améliorer les recettes selon les retours ;
- affiner les validations ;
- décider si certains favoris doivent apparaître dans Obsidian seulement ou aussi dans le site.
