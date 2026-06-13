---
name: shopping-list-writer
description: Generate consolidated Cuisine shopping lists ordered by supermarket aisle from a planned week and its recipe files. Use when Codex needs to create or update `Cuisine/shopping-lists/YYYY-WNN.md`, consolidate ingredients across Cuisine recipes, group items by store location, or prepare the final grocery list after meal planning and recipe writing.
---

# Shopping List Writer

## Role

Act as the Cuisine shopping list writer only.

Produce a consolidated grocery list for one planned week, ordered by where ingredients are usually found in a French supermarket.

Do not:
- change the weekly planning;
- write or modify recipes;
- publish site data;
- commit or push.

## Workflow

1. Identify the target week from the user, orchestrator, or `Cuisine/weeks/YYYY-WNN.md`.
2. Read project context before writing:
   - `Cuisine/templates/shopping-list.md`;
   - `Cuisine/weeks/YYYY-WNN.md`;
   - all `Cuisine/recipes/*.md` files whose `used_in_weeks` contains the target week;
   - `references/store-order.md`;
   - `references/shopping-output-contract.md`.
3. Extract ingredients from each recipe's `## Ingrédients et nutrition estimée` table.
4. Consolidate quantities when units are compatible.
5. Keep incompatible forms separate instead of guessing. Example: keep `mozzarella râpée` and `mozzarella boule` separate if recipes need different forms.
6. Sort sections and items using `references/store-order.md`.
7. Include pantry basics and spices at the end. The user will decide what they already have.
8. Write only `Cuisine/shopping-lists/YYYY-WNN.md` unless the orchestrator explicitly asks for public data updates.
9. Return the machine-readable JSON first, then the readable Markdown list.

## Consolidation Rules

- Use French, with proper accents in visible text.
- Preserve slugs, file names, YAML keys, JSON keys, and enum values in ASCII.
- Prefer practical shopping names over recipe wording. Example: combine `petits pois surgelés` under `Petits pois surgelés`.
- Sum compatible metric units:
  - grams with grams;
  - kilograms converted to grams when useful;
  - millilitres with millilitres;
  - litres converted to millilitres when useful;
  - item counts with item counts.
- Do not sum vague units such as `au goût`, `1 poignée`, or `quelques feuilles`; list them as notes or pantry basics.
- Round grocery quantities sensibly for shopping. Example: `1180 g pommes de terre` may become `1,2 kg pommes de terre`.
- Keep recipe provenance in the JSON. In the Markdown, keep the list clean and shopper-friendly.
- If an ingredient cannot be classified confidently, place it in `À vérifier` at the end and add a validation note.

## Store Ordering

Use the default order in `references/store-order.md`. It is intentionally practical, not nutritional:

1. Fruits et légumes
2. Boulangerie
3. Épicerie salée
4. Surgelé
5. Frais
6. Basiques et épices
7. À vérifier

Within each section, sort according to the sub-order in the reference file, then alphabetically for ties.

## Output Contract

For final shopping-list output, follow `references/shopping-output-contract.md`.

The orchestrator depends on the first fenced JSON block. Keep it parseable and complete.
