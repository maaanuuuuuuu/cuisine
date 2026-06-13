# Planning Output Contract

Use this contract when producing the final result from `$meal-planner`.

Return one fenced JSON object first. When invoked manually by a user, follow it with a Markdown planning table for readability. The first fenced JSON block is the machine-readable payload that the orchestrator passes to other agents.

## JSON Shape

```json
{
  "kind": "meal_plan_package",
  "version": 2,
  "week": "YYYY-WNN",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "status": "planned",
  "revision_of": null,
  "source_context": {
    "preferences_read": true,
    "feedback_read": true,
    "favorites_read": true,
    "avoid_read": true,
    "weekly_archetypes_read": true,
    "recent_weeks_checked": ["YYYY-WNN"],
    "existing_recipes_checked": ["recipe-slug"]
  },
  "planning_summary": {
    "meals_total": 10,
    "dinners": 7,
    "lunches": 3,
    "new_recipe_count": 0,
    "adapted_recipe_count": 0,
    "reused_recipe_count": 0,
    "weekly_balance_strategy": "Short explanation",
    "archetype_fit": "Short explanation"
  },
  "meals": [
    {
      "day_label": "Lundi",
      "date": "YYYY-MM-DD",
      "meal_type": "dinner",
      "meal_type_label": "Diner",
      "day_archetype": "creamy pasta plus green vegetable",
      "title": "Nom du plat en francais",
      "slug": "nom-du-plat-en-francais",
      "recipe_status": "new",
      "recipe_needed": true,
      "brief_id": "YYYY-WNN-lundi-dinner",
      "revision_status": "unchanged",
      "notes": []
    }
  ],
  "recipe_briefs": [
    {
      "brief_id": "YYYY-WNN-lundi-dinner",
      "week": "YYYY-WNN",
      "day_label": "Lundi",
      "date": "YYYY-MM-DD",
      "meal_type": "dinner",
      "day_archetype": "creamy pasta plus green vegetable",
      "proposed_title": "Nom du plat en francais",
      "proposed_slug": "nom-du-plat-en-francais",
      "recipe_status": "new",
      "portions": "2 adultes + 2 jeunes enfants",
      "style": "familial, vegetarien, simple",
      "target_total_time_minutes": 35,
      "difficulty": "facile",
      "constraints": [
        "vegetarien",
        "adapted to family meals",
        "respect Cuisine/preferences.md, Cuisine/feedback.md, and Cuisine/avoid.md"
      ],
      "ingredients_to_use": [],
      "ingredients_to_avoid": [],
      "shopping_sections_likely": [
        "Fruits et legumes",
        "Epicerie salee",
        "Frais"
      ],
      "recipe_writer_instructions": [
        "Use $recipe-writer to write the full recipe in French.",
        "Repeat quantities in each cooking step.",
        "Include estimated calories by ingredient and macros when possible.",
        "Follow the project recipe template."
      ],
      "qa_notes": []
    }
  ],
  "shopping_strategy": {
    "consolidation_notes": [],
    "pantry_basics_to_include": true,
    "not_a_final_shopping_list": true
  },
  "validation": {
    "vegetarian": true,
    "expected_meal_count_ok": true,
    "lunch_days_ok": true,
    "weekly_archetypes_checked": true,
    "weekly_balance_checked": true,
    "recent_repetition_checked": true,
    "avoid_list_checked": true,
    "no_full_recipes_written": true
  },
  "assumptions": [],
  "blocking_questions": []
}
```

## Field Rules

- `meal_type` must be `lunch` or `dinner`.
- `recipe_status` must be `new`, `adapted`, or `reused`.
- `recipe_needed` must usually be `true`. Set it to `false` only when the orchestrator or user explicitly asks to reuse an exact existing recipe that already has a usable recipe file.
- Every meal with `recipe_needed: true` must have exactly one matching object in `recipe_briefs`.
- Every object in `recipe_briefs` must match a meal by `brief_id`.
- Do not include `recipe_briefs` for unchanged exact reused recipes.
- `revision_status` must be `unchanged`, `added`, `changed`, or `removed`.
- Keep `shopping_strategy` preliminary. A downstream recipe or QA agent owns the final consolidated shopping list.
- Keep title values in French. Field names stay ASCII.
- Use ISO dates and ISO week labels.
- If information is missing, add it to `assumptions` or `blocking_questions`.

## Manual Planning Table

When the planner is called manually, add this section after the JSON:

```markdown
## Planning

| Jour | Dejeuner | Diner | Notes |
| --- | --- | --- | --- |
| Lundi YYYY-MM-DD |  | Plat du soir |  |
| Mardi YYYY-MM-DD |  | Plat du soir |  |
| Mercredi YYYY-MM-DD | Plat du midi | Plat du soir simple |  |
| Jeudi YYYY-MM-DD |  | Plat du soir |  |
| Vendredi YYYY-MM-DD |  | Plat du soir |  |
| Samedi YYYY-MM-DD | Plat du midi | Plat du soir |  |
| Dimanche YYYY-MM-DD | Plat du midi | Plat du soir |  |
```

Rules:

- Keep the JSON first and complete.
- Do not put recipe instructions in the table.
- Use the same titles as the `meals` array.
- Leave lunch cells empty for days without planned lunch.
- Use notes only for important planning context, replacements, or explicit user constraints.

## Markdown Week Draft

If the orchestrator asks for a Markdown draft, add a separate field:

```json
"week_markdown_draft": "..."
```

The draft should match `Cuisine/templates/week.md`, but it must still avoid full recipe content.
