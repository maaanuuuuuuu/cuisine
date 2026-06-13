import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vaultDir = "Cuisine";
const errors = [];

function fail(message) {
  errors.push(message);
}

async function exists(relativePath) {
  try {
    await stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
  } catch (error) {
    fail(`${relativePath}: JSON invalide ou illisible (${error.message})`);
    return null;
  }
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

function frontmatterHasKey(frontmatter, key) {
  return new RegExp(`^${key}:`, "m").test(frontmatter);
}

function countMeals(week, type) {
  return (week.days || []).reduce((count, day) => count + (day.meals || []).filter((meal) => meal.type === type).length, 0);
}

function collectMealSlugs(week) {
  return (week.days || []).flatMap((day) => (day.meals || []).map((meal) => meal.recipe_slug).filter(Boolean));
}

function hasPlannedWeek(week) {
  return Boolean(week?.week) || (Array.isArray(week?.days) && week.days.length > 0);
}

function scanForbiddenPublicKeys(value, trail = "data/public") {
  const forbidden = new Set(["feedback", "feedbacks", "privateNotes", "private_notes", "preferences", "favorites"]);
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenPublicKeys(item, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (forbidden.has(key)) {
      fail(`${trail}.${key}: cle privee interdite dans les donnees publiques`);
    }
    scanForbiddenPublicKeys(nested, `${trail}.${key}`);
  }
}

async function validateRequiredFiles() {
  const required = [
    "Plan.md",
    "README.md",
    "package.json",
    `${vaultDir}/index.md`,
    `${vaultDir}/preferences.md`,
    `${vaultDir}/favorites.md`,
    `${vaultDir}/avoid.md`,
    `${vaultDir}/feedback.md`,
    `${vaultDir}/recipes/index.md`,
    `${vaultDir}/templates/week.md`,
    `${vaultDir}/templates/recipe.md`,
    `${vaultDir}/templates/shopping-list.md`,
    "data/public/current-week.json",
    "data/public/previous-week.json",
    "data/public/recipes.json",
    "data/public/shopping-list.json",
    "site/index.html",
    "site/recipes.html",
    "site/recipe.html",
    "site/shopping.html",
    "site/app.js",
    "site/styles.css"
  ];

  for (const file of required) {
    if (!(await exists(file))) {
      fail(`${file}: fichier manquant`);
    }
  }
}

async function validateRecipeNotes(recipes) {
  const recipeDir = path.join(root, vaultDir, "recipes");
  const files = (await readdir(recipeDir)).filter((file) => file.endsWith(".md") && file !== "index.md");
  const filesBySlug = new Set(files.map((file) => file.replace(/\.md$/, "")));

  for (const recipe of recipes) {
    if (!filesBySlug.has(recipe.slug)) {
      fail(`${vaultDir}/recipes/${recipe.slug}.md: note de recette manquante`);
      continue;
    }

    const content = await readFile(path.join(recipeDir, `${recipe.slug}.md`), "utf8");
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) {
      fail(`${vaultDir}/recipes/${recipe.slug}.md: frontmatter manquant`);
      continue;
    }
    if (frontmatterValue(frontmatter, "type") !== "recipe") {
      fail(`${vaultDir}/recipes/${recipe.slug}.md: type recipe attendu`);
    }
    if (frontmatterValue(frontmatter, "slug") !== recipe.slug) {
      fail(`${vaultDir}/recipes/${recipe.slug}.md: slug incoherent`);
    }
    if (!frontmatterValue(frontmatter, "title")) {
      fail(`${vaultDir}/recipes/${recipe.slug}.md: title manquant`);
    }
    for (const key of [
      "servings",
      "vegetarian",
      "meal_types",
      "prep_time_minutes",
      "cook_time_minutes",
      "total_time_minutes",
      "difficulty",
      "tags",
      "raw_alliums",
      "nutrition",
      "used_in_weeks",
      "status"
    ]) {
      if (!frontmatterHasKey(frontmatter, key)) {
        fail(`${vaultDir}/recipes/${recipe.slug}.md: champ frontmatter ${key} manquant`);
      }
    }
    for (const key of ["garlic", "onion", "shallot"]) {
      if (!new RegExp(`^\\s+${key}:\\s+(true|false)`, "m").test(frontmatter)) {
        fail(`${vaultDir}/recipes/${recipe.slug}.md: raw_alliums.${key} manquant ou invalide`);
      }
    }
    for (const key of ["calories_total", "calories_per_serving", "protein_g", "carbs_g", "fat_g"]) {
      if (!new RegExp(`^\\s+${key}:\\s+`, "m").test(frontmatter)) {
        fail(`${vaultDir}/recipes/${recipe.slug}.md: nutrition.${key} manquant`);
      }
    }
    for (const heading of ["## Résumé", "## Ingrédients et nutrition estimée", "## Étapes", "## Pourquoi c'est équilibré", "## Utilisation"]) {
      if (!content.includes(heading)) {
        fail(`${vaultDir}/recipes/${recipe.slug}.md: section ${heading} manquante`);
      }
    }
    if (/## Alertes\s*(?:\r?\n\s*)*(?:## |$)/.test(content)) {
      fail(`${vaultDir}/recipes/${recipe.slug}.md: section ## Alertes vide`);
    }
  }
}

async function validateWeekNote(week) {
  if (!week?.week) return;
  const relativePath = `${vaultDir}/weeks/${week.week}.md`;
  if (!(await exists(relativePath))) {
    fail(`${relativePath}: note de semaine manquante`);
    return;
  }
  const frontmatter = extractFrontmatter(await readFile(path.join(root, relativePath), "utf8"));
  if (!frontmatter) {
    fail(`${relativePath}: frontmatter manquant`);
    return;
  }
  if (frontmatterValue(frontmatter, "type") !== "week") {
    fail(`${relativePath}: type week attendu`);
  }
  if (frontmatterValue(frontmatter, "week") !== week.week) {
    fail(`${relativePath}: identifiant de semaine incoherent`);
  }
}

async function validateShoppingNote(shopping) {
  if (!shopping?.week) return;
  const relativePath = `${vaultDir}/shopping-lists/${shopping.week}.md`;
  if (!(await exists(relativePath))) {
    fail(`${relativePath}: liste de courses Obsidian manquante`);
    return;
  }
  const frontmatter = extractFrontmatter(await readFile(path.join(root, relativePath), "utf8"));
  if (!frontmatter) {
    fail(`${relativePath}: frontmatter manquant`);
    return;
  }
  if (frontmatterValue(frontmatter, "type") !== "shopping_list") {
    fail(`${relativePath}: type shopping_list attendu`);
  }
}

async function validatePublicData() {
  const currentWeek = await readJson("data/public/current-week.json");
  const previousWeek = await readJson("data/public/previous-week.json");
  const recipesData = await readJson("data/public/recipes.json");
  const shopping = await readJson("data/public/shopping-list.json");
  if (!currentWeek || !previousWeek || !recipesData || !shopping) return;

  const recipes = recipesData.recipes || [];
  if (!Array.isArray(recipesData.recipes)) {
    fail("data/public/recipes.json: recipes doit etre un tableau");
  }

  for (const recipe of recipes) {
    for (const key of ["slug", "title", "summary", "servings", "ingredients", "steps", "nutrition"]) {
      if (recipe[key] == null) fail(`data/public/recipes.json:${recipe.slug}: champ ${key} manquant`);
    }
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      fail(`data/public/recipes.json:${recipe.slug}: ingredients manquants`);
    }
    if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      fail(`data/public/recipes.json:${recipe.slug}: etapes manquantes`);
    }
  }

  if (!Array.isArray(currentWeek.days)) {
    fail("data/public/current-week.json: days doit etre un tableau");
  }
  if (!Array.isArray(previousWeek.days)) {
    fail("data/public/previous-week.json: days doit etre un tableau");
  }

  if (hasPlannedWeek(currentWeek)) {
    if (countMeals(currentWeek, "dinner") !== 7) {
      fail("data/public/current-week.json: 7 diners attendus");
    }
    if (countMeals(currentWeek, "lunch") !== 3) {
      fail("data/public/current-week.json: 3 dejeuners attendus");
    }
  }

  const slugs = new Set(recipes.map((recipe) => recipe.slug));
  for (const week of [currentWeek, previousWeek]) {
    await validateWeekNote(week);
    for (const slug of collectMealSlugs(week)) {
      if (!slugs.has(slug)) fail(`${week.week}: recette referencee absente de recipes.json (${slug})`);
    }
  }

  if (!Array.isArray(shopping.sections)) {
    fail("data/public/shopping-list.json: sections doit etre un tableau");
  }
  if (shopping.week && currentWeek.week && shopping.week !== currentWeek.week) {
    fail("data/public/shopping-list.json: doit correspondre a la semaine courante");
  }
  await validateShoppingNote(shopping);
  await validateRecipeNotes(recipes);

  scanForbiddenPublicKeys(currentWeek);
  scanForbiddenPublicKeys(previousWeek);
  scanForbiddenPublicKeys(recipesData);
  scanForbiddenPublicKeys(shopping);
}

await validateRequiredFiles();
await validatePublicData();

if (errors.length > 0) {
  console.error("Validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Validation passed.");
