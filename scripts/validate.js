import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

function countMeals(week, type) {
  return week.days.reduce((count, day) => count + day.meals.filter((meal) => meal.type === type).length, 0);
}

function collectMealSlugs(week) {
  return week.days.flatMap((day) => day.meals.map((meal) => meal.recipe_slug).filter(Boolean));
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
      fail(`${trail}.${key}: clé privée interdite dans les données publiques`);
    }
    scanForbiddenPublicKeys(nested, `${trail}.${key}`);
  }
}

async function validateRequiredFiles() {
  const required = [
    "Plan.md",
    "README.md",
    "package.json",
    "obsidian/index.md",
    "obsidian/preferences.md",
    "obsidian/favorites.md",
    "obsidian/avoid.md",
    "obsidian/feedback.md",
    "obsidian/recipes/index.md",
    "data/public/current-week.json",
    "data/public/previous-week.json",
    "data/public/recipes.json",
    "data/public/shopping-list.json",
    "site/index.html",
    "site/recipes.html",
    "site/recipe.html",
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
  const recipeDir = path.join(root, "obsidian", "recipes");
  const files = (await readdir(recipeDir)).filter((file) => file.endsWith(".md") && file !== "index.md");
  const filesBySlug = new Set(files.map((file) => file.replace(/\.md$/, "")));

  for (const recipe of recipes) {
    if (!filesBySlug.has(recipe.slug)) {
      fail(`obsidian/recipes/${recipe.slug}.md: note de recette manquante`);
      continue;
    }

    const content = await readFile(path.join(recipeDir, `${recipe.slug}.md`), "utf8");
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) {
      fail(`obsidian/recipes/${recipe.slug}.md: frontmatter manquant`);
      continue;
    }
    if (frontmatterValue(frontmatter, "type") !== "recipe") {
      fail(`obsidian/recipes/${recipe.slug}.md: type recipe attendu`);
    }
    if (frontmatterValue(frontmatter, "slug") !== recipe.slug) {
      fail(`obsidian/recipes/${recipe.slug}.md: slug incohérent`);
    }
    if (!frontmatterValue(frontmatter, "title")) {
      fail(`obsidian/recipes/${recipe.slug}.md: title manquant`);
    }
  }
}

async function validateWeekNote(week) {
  const relativePath = `obsidian/weeks/${week.week}.md`;
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
    fail(`${relativePath}: identifiant de semaine incohérent`);
  }
}

async function validateShoppingNote(shopping) {
  const relativePath = `obsidian/shopping-lists/${shopping.week}.md`;
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
  const slugs = new Set(recipes.map((recipe) => recipe.slug));
  if (recipes.length === 0) fail("data/public/recipes.json: au moins une recette est attendue");

  for (const recipe of recipes) {
    for (const key of ["slug", "title", "summary", "servings", "ingredients", "steps", "nutrition"]) {
      if (recipe[key] == null) fail(`data/public/recipes.json:${recipe.slug}: champ ${key} manquant`);
    }
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      fail(`data/public/recipes.json:${recipe.slug}: ingrédients manquants`);
    }
    if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      fail(`data/public/recipes.json:${recipe.slug}: étapes manquantes`);
    }
  }

  if (countMeals(currentWeek, "dinner") !== 7) {
    fail("data/public/current-week.json: 7 dîners attendus");
  }
  if (countMeals(currentWeek, "lunch") !== 3) {
    fail("data/public/current-week.json: 3 déjeuners attendus");
  }

  for (const week of [currentWeek, previousWeek]) {
    await validateWeekNote(week);
    for (const slug of collectMealSlugs(week)) {
      if (!slugs.has(slug)) fail(`${week.week}: recette référencée absente de recipes.json (${slug})`);
    }
  }

  if (shopping.week !== currentWeek.week) {
    fail("data/public/shopping-list.json: doit correspondre à la semaine courante");
  }
  if (!Array.isArray(shopping.sections) || shopping.sections.length === 0) {
    fail("data/public/shopping-list.json: sections manquantes");
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

