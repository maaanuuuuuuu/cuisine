# Shopping Output Contract

Use this contract when producing the final result from `$shopping-list-writer`.

Return one fenced JSON object first, followed by a readable Markdown shopping list.

## JSON Shape

```json
{
  "kind": "shopping_list_package",
  "version": 1,
  "week": "YYYY-WNN",
  "source_week_file": "Cuisine/weeks/YYYY-WNN.md",
  "source_recipe_files": [
    "Cuisine/recipes/example.md"
  ],
  "status": "planned",
  "store_order_used": [
    "Fruits et légumes",
    "Boulangerie",
    "Épicerie salée",
    "Surgelé",
    "Frais",
    "Basiques et épices",
    "À vérifier"
  ],
  "sections": [
    {
      "section": "Fruits et légumes",
      "items": [
        {
          "name": "Courgettes",
          "quantity": "800 g",
          "normalized_quantity": {
            "amount": 800,
            "unit": "g"
          },
          "source_recipes": [
            "veloute-courgette-petits-pois-tartines-feta"
          ],
          "notes": []
        }
      ]
    }
  ],
  "pantry_basics_included": true,
  "validation": {
    "target_week_found": true,
    "recipes_found": true,
    "ingredients_extracted": true,
    "quantities_consolidated": true,
    "store_order_applied": true,
    "markdown_matches_json": true
  },
  "manual_checks": [],
  "shopping_markdown": "---\\ntype: shopping_list\\nweek: YYYY-WNN\\nstatus: planned\\n---\\n\\n# Liste de courses YYYY-WNN\\n..."
}
```

## Field Rules

- `kind` must be `shopping_list_package`.
- `version` must be `1`.
- `week` must use ISO week format.
- `source_recipe_files` must include every recipe used for extraction.
- `sections[].section` must follow `references/store-order.md`.
- Empty sections may be omitted from JSON and Markdown, except `Basiques et épices` when pantry basics are included.
- `normalized_quantity` may be `null` when units are vague or incompatible.
- `manual_checks` must list any unclear classification, vague quantity, or suspected duplicate that was not consolidated.
- `shopping_markdown` must be complete repository-ready Markdown for `Cuisine/shopping-lists/YYYY-WNN.md`.

## Repository Markdown Shape

```markdown
---
type: shopping_list
week: YYYY-WNN
status: planned
---

# Liste de courses YYYY-WNN

## Fruits et légumes

- [ ] Courgettes — 800 g

## Boulangerie

- [ ] Pain de campagne — 8 tranches

## Épicerie salée

- [ ] Pâtes courtes — 320 g

## Surgelé

- [ ] Petits pois surgelés — 300 g

## Frais

- [ ] Mozzarella — 300 g

## Basiques et épices

- [ ] Sel
- [ ] Poivre

## À vérifier

- [ ] Ingredient unclear — préciser le rayon ou la quantité
```

## Markdown Rules

- Use checkbox bullets for easy mobile shopping.
- Use French names with proper accents.
- Keep item lines concise: `- [ ] Nom — quantité`.
- Add short parenthetical notes only when useful for shopping, not recipe execution.
- Do not include private preferences, feedback, favorites, or avoid notes.
