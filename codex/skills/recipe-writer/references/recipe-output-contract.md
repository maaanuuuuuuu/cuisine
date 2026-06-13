# Recipe Output Contract

Use this contract when producing the final result from `$recipe-writer`.

Return one fenced JSON object first, followed by a readable Markdown recipe in the user's preferred style.

## JSON Shape

```json
{
  "kind": "recipe_package",
  "version": 1,
  "brief_id": "YYYY-WNN-jeudi-dinner",
  "source_brief": {
    "week": "YYYY-WNN",
    "day_label": "Jeudi",
    "date": "YYYY-MM-DD",
    "meal_type": "dinner",
    "day_archetype": "family gratin or oven dish"
  },
  "metadata": {
    "slug": "lasagnes-express-ricotta-legumes-rapes-sauce-tomate",
    "title": "Lasagnes express ricotta, légumes râpés et sauce tomate",
    "servings": "2 adultes + 2 jeunes enfants",
    "vegetarian": true,
    "meal_types": ["dinner"],
    "prep_time_minutes": 20,
    "cook_time_minutes": 35,
    "total_time_minutes": 55,
    "difficulty": "facile",
    "tags": ["famille", "vegetarien"],
    "raw_alliums": {
      "garlic": false,
      "onion": false,
      "shallot": false
    },
    "nutrition": {
      "calories_total": 3410,
      "calories_per_adult_portion_estimate": "650-750",
      "calories_per_child_portion_estimate": "350-500",
      "protein_g": 130,
      "carbs_g": 360,
      "fat_g": 150
    },
    "status": "active"
  },
  "summary": "Short French summary.",
  "allium_alerts": [],
  "ingredients": [
    {
      "name": "Feuilles de lasagnes",
      "quantity": "250 g",
      "section": "Epicerie salee",
      "calories": 875
    }
  ],
  "steps": [
    {
      "title": "Préchauffe le four",
      "text": "Préchauffe le four à 180 C."
    }
  ],
  "balance_explanation": "French explanation of starches, proteins, fiber, vegetables, and useful serving note.",
  "calorie_explanation": {
    "total_text": "Total plat entier : environ 3 410 kcal.",
    "portion_text": "Family portion interpretation."
  },
  "repo_markdown": "---\\ntype: recipe\\n...\\n---\\n\\n# Title\\n..."
}
```

## Field Rules

- `kind` must be `recipe_package`.
- `version` must be `1`.
- `brief_id` must match the input brief when present.
- `metadata.slug` must be stable, lowercase, ASCII-compatible, and hyphen-separated.
- `metadata.title` must be French and match the readable recipe title.
- User-facing French strings must use proper accents. Keep only technical identifiers ASCII: slugs, file names, frontmatter keys, JSON keys, enum values, and stable shopping section identifiers.
- `metadata.vegetarian` must be `true`.
- `metadata.meal_types` must use `dinner` or `lunch`, not French labels.
- `metadata.raw_alliums` must reflect raw garlic, raw onion, and raw shallot only.
- `ingredients[].section` should use site shopping sections such as `Fruits et legumes`, `Epicerie salee`, `Frais`, `Surgele`, `Boulangerie`, or `Basiques et epices`.
- `steps[].text` must repeat relevant ingredient quantities.
- `repo_markdown` must be a complete Markdown recipe note matching `Cuisine/templates/recipe.md` and the generated recipe.
- `allium_alerts` may be empty. When it is empty, omit the visible `## Alertes` section from the rendered Markdown and repository note.
- Keep public JSON free of private preferences, favorites, and feedback text.

## Readable Markdown Shape

After the JSON, render the recipe like this:

```markdown
Le plat de jeudi, c'était : **Titre du plat**.

## Titre du plat

Pour **2 adultes + 2 jeunes enfants**
Temps : **20 min préparation + 35 min cuisson**

### Ingrédients

* **Ingrédient** : quantité

## Préparation

1. **Action courte.**
   Instruction concrète avec quantités répétées.

## Pourquoi c'est équilibré

Explanation.

## Estimation calories

Pour tout le plat :

| Ingrédient | Quantité | Calories approx. |
| --- | ---: | ---: |
| Ingrédient | 250 g | ~875 kcal |

**Total plat entier : environ X kcal.**

Portion interpretation.
```

If `allium_alerts` is not empty, add a short visible `## Alertes` section between the ingredients and preparation sections.

## Repository Markdown Requirements

The `repo_markdown` value must include:

- YAML frontmatter with the same fields as `Cuisine/templates/recipe.md`;
- `## Résumé`;
- `## Ingrédients et nutrition estimée`;
- `## Étapes`;
- `## Pourquoi c'est équilibré`;
- `## Utilisation`.

Include `## Alertes` only when there is an actual warning to show.

The visible Markdown can be more conversational than the repo note, but both must agree on quantities, steps, calories, and warnings when present.
