Je veux que tu m’aides à concevoir un workflow Codex pour gérer mes repas, recettes, listes de courses et archives cuisine.

Attention : je ne veux pas créer un “générateur de recettes” codé en dur. Toute la logique intelligente doit rester dans Codex.

Le code du repo ne doit servir qu’à :

* stocker proprement les données ;
* garder une mémoire durable lisible par Codex ;
* rendre les fichiers agréables dans Obsidian ;
* générer une petite app web statique responsive ;
* publier cette app sur GitHub Pages ;
* éventuellement valider/formater les fichiers.

# Principe central

Codex est l’agent qui réfléchit.

Chaque semaine, Codex doit lire les fichiers du repo, comprendre mon historique, mes préférences, les recettes passées, mes feedbacks, puis générer lui-même une nouvelle semaine de repas.

Le repo est la mémoire durable de Codex.

Codex ne doit pas compter sur une mémoire implicite ou sur l’historique d’une conversation. Il doit relire les fichiers du repo à chaque exécution et les mettre à jour.

# Flow principal souhaité

Chaque lundi, via une automatisation Codex :

1. Codex ouvre le repo.
2. Codex lit :

   * mes préférences cuisine ;
   * l’historique des semaines passées ;
   * les recettes déjà générées ;
   * les recettes favorites ;
   * les recettes à éviter ;
   * les feedbacks donnés ;
   * les listes de courses archivées si utile.
3. Codex propose une nouvelle semaine de repas végétariens, variée par rapport aux semaines précédentes.
4. Codex crée ou met à jour une note Obsidian pour chaque recette.
5. Codex crée la note de la semaine.
6. Codex crée la liste de courses consolidée de la semaine.
7. Codex met à jour l’index global des recettes.
8. Codex met à jour les données nécessaires à l’app web.
9. Codex lance les commandes de validation/build.
10. Codex commit les changements.
11. Codex push sur GitHub.
12. Le site GitHub Pages est mis à jour pour que je puisse consulter les recettes et la liste de courses facilement depuis mon téléphone.

# Ce que je veux pouvoir demander à Codex à tout moment

Je veux pouvoir revenir dans Codex et lui dire des choses comme :

* “Génère la semaine prochaine.”
* “Remplace la recette du mercredi, elle ne me tente pas.”
* “Cette recette était super bonne, mets-la en favori.”
* “Cette recette était bof, évite de me la reproposer.”
* “Les enfants ont adoré cette recette.”
* “Trop long pour un soir de semaine.”
* “Ajoute à mes préférences que je préfère les plats avec moins d’ail cru.”
* “Mets à jour mon format de liste de courses.”
* “Relis-moi la recette de ce soir en mode cuisine.”
* “Prépare une semaine avec plus de plats rapides.”
* “Prépare une semaine avec des ingrédients qui se recoupent pour limiter les courses.”
* “Cette semaine j’ai déjà des courgettes, des œufs et du chèvre, tiens-en compte.”

Codex doit alors modifier les fichiers de mémoire du repo, pas seulement me répondre dans le chat.

# Préférences cuisine initiales

Stocke ces préférences dans un fichier éditable, par exemple `obsidian/preferences.md` ou `data/preferences.yaml`.

Préférences initiales :

* Je suis végétarien.
* Les recettes doivent être en français.
* Les recettes sont plutôt pour 2 adultes + 2 jeunes enfants, sauf demande contraire.
* Les recettes doivent être pratiques pour une vie de famille.
* Les quantités doivent être répétées dans chaque étape de la recette.
* Chaque recette doit inclure une estimation calorique détaillée par ingrédient.
* Si possible, inclure aussi protéines, glucides et lipides.
* Il faut prévenir clairement si une recette contient ail cru, oignon cru ou échalote crue, car ma partenaire n’aime pas toujours ça.
* Pour les gratins ou plats avec pommes de terre, les pommes de terre doivent être précuites ou coupées très finement pour éviter qu’elles restent dures.
* La liste de courses doit être groupée par rayon.
* La liste de courses doit consolider les quantités entre recettes.
* Il faut éviter de reproposer trop souvent les mêmes plats.
* Il faut tenir compte des recettes que j’ai aimées ou non.

# Structure Obsidian souhaitée

Propose une structure claire, par exemple :

* `obsidian/index.md`
* `obsidian/preferences.md`
* `obsidian/recipes/`
* `obsidian/weeks/`
* `obsidian/shopping-lists/`
* `obsidian/favorites.md`
* `obsidian/feedback.md`

Chaque recette doit avoir sa propre note Markdown.

Chaque semaine doit avoir sa propre note ou son propre dossier.

Les listes de courses doivent être archivées semaine par semaine.

Je veux pouvoir naviguer dans Obsidian facilement, avec des liens internes entre :

* semaines ;
* recettes ;
* listes de courses ;
* favoris ;
* feedbacks.

# Données structurées

Propose une stratégie simple.

Je veux que les notes Markdown soient agréables à lire dans Obsidian, mais je veux aussi que l’app web puisse les exploiter facilement.

Tu peux proposer :

* Markdown avec frontmatter YAML comme source de vérité ;
* ou Markdown + petits fichiers JSON générés ;
* ou une autre approche.

Mais évite une architecture trop lourde.

Le plus important : Codex doit pouvoir lire et maintenir ces fichiers facilement.

# App web bonus

L’app web n’est pas le cœur du système. Elle sert surtout à consulter facilement les recettes et la liste de courses depuis mon téléphone sans passer par Codex.

Elle doit afficher :

* la semaine en cours ;
* les recettes de la semaine ;
* la liste de courses de la semaine ;
* une page détail par recette ;
* un mode cuisine mobile avec texte lisible, étapes bien séparées, et quantités visibles dans chaque étape ;
* éventuellement les favoris et l’historique.

L’app doit être statique, responsive et publiée sur GitHub Pages.

Choisis une stack très simple et robuste. Je préfère que ce soit maintenable plutôt que sophistiqué.

Le site publié ne doit pas contenir d’informations trop personnelles. Les feedbacks privés et préférences fines peuvent rester seulement dans le repo/Obsidian si nécessaire.

# Automatisation

Je veux une automatisation Codex hebdomadaire le lundi.

Propose le meilleur mécanisme selon les capacités disponibles :

* automatisation Codex récurrente ;
* worktree dédié si pertinent ;
* commit/push automatique ;
* ou, si nécessaire, fallback local avec une commande Codex CLI.

L’idée est que Codex fasse vraiment le travail de génération, pas un script Node qui appelle un LLM.

Le code peut seulement fournir des commandes comme :

* validation des fichiers ;
* génération du site ;
* build ;
* déploiement ;
* formatage.

Exemples de commandes possibles :

* `npm run validate`
* `npm run site:build`
* `npm run site:dev`
* `npm run site:deploy` si nécessaire

Mais pas de commande `generate:week` qui contiendrait la logique culinaire. La génération de semaine doit être une tâche Codex.

# GitHub et versioning

Tout doit être versionné sur GitHub.

Je te donnerai l’URL du repo plus tard.

Chaque génération hebdomadaire doit finir par :

1. vérifier les fichiers modifiés ;
2. lancer les validations ;
3. builder l’app web ;
4. commit avec un message clair ;
5. push.

Exemple de message de commit :

`Add meal plan for 2026-W25`

# Ce que tu dois produire maintenant

Ne code rien tout de suite.

Commence par me proposer :

1. le flow Codex complet ;
2. ce que Codex fait chaque lundi ;
3. ce que Codex fait quand je donne un feedback ;
4. ce que Codex fait quand je lui demande de me lire une recette ;
5. la structure de repo recommandée ;
6. la structure Obsidian recommandée ;
7. la stratégie de mémoire durable ;
8. la partie minimale de code nécessaire pour le site web ;
9. le workflow GitHub Pages ;
10. les risques et limites ;
11. les questions à me poser avant implémentation ;
12. un plan d’implémentation progressif.

Rappelle-toi : Codex est le cerveau. Le repo est la mémoire. L’app web est seulement un bonus de consultation mobile.
