import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const publicData = path.join(root, "data", "public");
const weeksDir = path.join(root, "Cuisine", "weeks");
const recipesDir = path.join(root, "Cuisine", "recipes");

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : "";
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

function parseFrontmatterValue(value) {
  const clean = String(value ?? "").trim();
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (clean === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(clean)) return Number(clean);
  if (clean.startsWith("[") && clean.endsWith("]")) {
    const body = clean.slice(1, -1).trim();
    if (!body) return [];
    return body.split(",").map((item) => item.trim().replace(/^["']|["']$/g, ""));
  }
  return clean.replace(/^["']|["']$/g, "");
}

function frontmatterParsedValue(frontmatter, key, fallback = null) {
  const raw = frontmatterValue(frontmatter, key);
  return raw == null ? fallback : parseFrontmatterValue(raw);
}

function frontmatterObject(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start === -1) return {};

  const value = {};
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+/.test(line)) break;
    const match = line.match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
    if (match) {
      value[match[1]] = parseFrontmatterValue(match[2]);
    }
  }
  return value;
}

function normalizeTitle(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionContent(content, heading) {
  const match = content.match(new RegExp(`(?:^|\\r?\\n)## ${escapeRegExp(heading)}[ \\t]*\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`));
  return match ? match[1].trim() : "";
}

function paragraphText(markdown) {
  return stripMarkdown(markdown.split(/\r?\n/).filter(Boolean).join(" "));
}

function parseTableRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) => line.slice(1, -1).split("|").map((cell) => stripMarkdown(cell.trim())))
    .filter((cells) => !cells.every((cell) => /^-+$/.test(cell.replaceAll(":", "").trim())));
}

function parseCalories(value) {
  const match = String(value || "").match(/\d[\d\s\u00a0]*/);
  return match ? Number(match[0].replace(/[\s\u00a0]/g, "")) : null;
}

function parseIngredients(markdown) {
  return parseTableRows(markdown)
    .filter((cells) => cells.length >= 3)
    .filter((cells) => normalizeTitle(cells[0]) !== "ingredient")
    .map((cells) => ({
      name: cells[0],
      quantity: cells[1],
      calories: parseCalories(cells[2]),
      section: "Ingrédients"
    }));
}

function parseSteps(markdown) {
  const steps = [];
  let currentStep = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^\d+\.\s+\*\*([^*]+)\*\*\s*(.*)$/);
    if (match) {
      currentStep = {
        title: stripMarkdown(match[1]).replace(/\.$/, ""),
        text: stripMarkdown(match[2])
      };
      steps.push(currentStep);
      continue;
    }

    if (currentStep && line) {
      currentStep.text = [currentStep.text, stripMarkdown(line)].filter(Boolean).join(" ");
    }
  }

  return steps.filter((step) => step.text);
}

function parseRecipeMarkdown(content, fileName) {
  const frontmatter = extractFrontmatter(content);
  const slug = frontmatterValue(frontmatter, "slug") || fileName.replace(/\.md$/, "");
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();

  return {
    slug,
    title: frontmatterValue(frontmatter, "title") || heading || slug,
    summary: paragraphText(sectionContent(content, "Résumé")),
    servings: frontmatterParsedValue(frontmatter, "servings", ""),
    vegetarian: frontmatterParsedValue(frontmatter, "vegetarian", true),
    meal_types: frontmatterParsedValue(frontmatter, "meal_types", []),
    prep_time_minutes: frontmatterParsedValue(frontmatter, "prep_time_minutes", null),
    cook_time_minutes: frontmatterParsedValue(frontmatter, "cook_time_minutes", null),
    total_time_minutes: frontmatterParsedValue(frontmatter, "total_time_minutes", null),
    difficulty: frontmatterParsedValue(frontmatter, "difficulty", ""),
    tags: frontmatterParsedValue(frontmatter, "tags", []),
    raw_alliums: frontmatterObject(frontmatter, "raw_alliums"),
    nutrition: frontmatterObject(frontmatter, "nutrition"),
    used_in_weeks: frontmatterParsedValue(frontmatter, "used_in_weeks", []),
    status: frontmatterParsedValue(frontmatter, "status", "active"),
    ingredients: parseIngredients(sectionContent(content, "Ingrédients et nutrition estimée")),
    steps: parseSteps(sectionContent(content, "Étapes"))
  };
}

async function readMarkdownRecipes() {
  let files = [];
  try {
    files = (await readdir(recipesDir)).filter((file) => file.endsWith(".md") && file !== "index.md");
  } catch {
    return [];
  }

  const recipes = [];
  for (const file of files) {
    const content = await readFile(path.join(recipesDir, file), "utf8");
    recipes.push(parseRecipeMarkdown(content, file));
  }

  return recipes.sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

async function buildRecipesIndex() {
  const recipes = await readMarkdownRecipes();
  const recipesData = {
    updated_at: new Date().toISOString().slice(0, 10),
    recipes
  };

  await writeFile(path.join(dist, "data", "recipes.json"), `${JSON.stringify(recipesData, null, 2)}\n`, "utf8");
  return recipesData;
}

function addDays(dateString, offset) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function recipeSlugByTitle(recipesData) {
  return new Map(
    (recipesData.recipes || [])
      .filter((recipe) => recipe.title && recipe.slug)
      .map((recipe) => [normalizeTitle(recipe.title), recipe.slug])
  );
}

function mealFromTitle(title, type, typeLabel, slugsByTitle) {
  const cleanTitle = stripMarkdown(title);
  if (!cleanTitle) return null;
  return {
    type,
    type_label: typeLabel,
    recipe_slug: slugsByTitle.get(normalizeTitle(cleanTitle)) || null,
    recipe_title: cleanTitle
  };
}

function parseWeekTable(content, startDate, slugsByTitle) {
  const rows = parseTableRows(content)
    .filter((cells) => cells.length >= 3)
    .filter((cells) => normalizeTitle(cells[0]) !== "jour");

  return rows.map((cells, index) => {
    const meals = [
      mealFromTitle(cells[1], "lunch", "Déjeuner", slugsByTitle),
      mealFromTitle(cells[2], "dinner", "Dîner", slugsByTitle)
    ].filter(Boolean);

    return {
      label: stripMarkdown(cells[0]),
      date: addDays(startDate, index),
      meals
    };
  });
}

function parseWeekMarkdown(content, slugsByTitle) {
  const frontmatter = extractFrontmatter(content);
  const week = frontmatterValue(frontmatter, "week");
  if (!week) return null;

  const startDate = frontmatterValue(frontmatter, "start_date");
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();

  return {
    week,
    title: heading || `Semaine ${week}`,
    start_date: startDate,
    end_date: frontmatterValue(frontmatter, "end_date"),
    status: frontmatterValue(frontmatter, "status") || "planned",
    days: parseWeekTable(content, startDate, slugsByTitle)
  };
}

async function readMarkdownWeeks(slugsByTitle) {
  let files = [];
  try {
    files = (await readdir(weeksDir)).filter((file) => file.endsWith(".md"));
  } catch {
    return [];
  }

  const weeks = [];
  for (const file of files) {
    const content = await readFile(path.join(weeksDir, file), "utf8");
    const week = parseWeekMarkdown(content, slugsByTitle);
    if (week) weeks.push(week);
  }
  return weeks;
}

function hasPlannedWeek(week) {
  return Boolean(week?.week) && Array.isArray(week?.days) && week.days.length > 0;
}

async function buildWeeksIndex(recipesData) {
  const [currentWeek, previousWeek, fallbackRecipesData] = await Promise.all([
    readJson(path.join(publicData, "current-week.json"), null),
    readJson(path.join(publicData, "previous-week.json"), null),
    readJson(path.join(publicData, "recipes.json"), { recipes: [] })
  ]);

  const slugsByTitle = recipeSlugByTitle(recipesData || fallbackRecipesData);
  const weeksById = new Map();

  for (const week of await readMarkdownWeeks(slugsByTitle)) {
    weeksById.set(week.week, week);
  }

  for (const week of [previousWeek, currentWeek]) {
    if (hasPlannedWeek(week)) {
      weeksById.set(week.week, week);
    }
  }

  const weeks = [...weeksById.values()].sort((a, b) => {
    const left = a.start_date || a.week || "";
    const right = b.start_date || b.week || "";
    return left.localeCompare(right, "fr");
  });

  const weeksData = {
    updated_at: new Date().toISOString().slice(0, 10),
    weeks
  };

  await writeFile(
    path.join(dist, "data", "weeks.json"),
    `${JSON.stringify(weeksData, null, 2)}\n`,
    "utf8"
  );

  return weeksData;
}

function todayIsoDate() {
  return new Date().toLocaleDateString("sv-SE");
}

function isCurrentCalendarWeek(week, today = todayIsoDate()) {
  return Boolean(week?.start_date && week?.end_date && week.start_date <= today && week.end_date >= today);
}

function selectDefaultWeek(weeks) {
  const today = todayIsoDate();
  return (
    weeks.find((week) => isCurrentCalendarWeek(week, today)) ||
    weeks.find((week) => week.start_date && week.start_date > today) ||
    weeks[weeks.length - 1] ||
    null
  );
}

function formatQuantities(quantities) {
  const counts = new Map();
  for (const quantity of quantities.filter(Boolean)) {
    counts.set(quantity, (counts.get(quantity) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([quantity, count]) => (count > 1 ? `${count} x ${quantity}` : quantity))
    .join(" + ");
}

function deriveShoppingList(recipesData, weeksData) {
  const week = selectDefaultWeek(weeksData.weeks || []);
  if (!week) {
    return {
      week: null,
      title: "Aucune liste de courses",
      status: "empty",
      sections: []
    };
  }

  const recipesBySlug = new Map((recipesData.recipes || []).map((recipe) => [recipe.slug, recipe]));
  const itemsByName = new Map();

  for (const day of week.days || []) {
    for (const meal of day.meals || []) {
      const recipe = recipesBySlug.get(meal.recipe_slug);
      for (const ingredient of recipe?.ingredients || []) {
        const key = normalizeTitle(ingredient.name);
        if (!itemsByName.has(key)) {
          itemsByName.set(key, {
            name: ingredient.name,
            quantities: []
          });
        }
        itemsByName.get(key).quantities.push(ingredient.quantity);
      }
    }
  }

  const items = [...itemsByName.values()]
    .map((item) => ({
      name: item.name,
      quantity: formatQuantities(item.quantities)
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return {
    week: week.week,
    title: `Liste de courses ${week.week}`,
    status: "generated",
    sections: items.length ? [{ name: "Courses", items }] : []
  };
}

async function buildShoppingListIndex(recipesData, weeksData) {
  const publicShopping = await readJson(path.join(publicData, "shopping-list.json"), null);
  const shopping = publicShopping?.sections?.length ? publicShopping : deriveShoppingList(recipesData, weeksData);

  await writeFile(
    path.join(dist, "data", "shopping-list.json"),
    `${JSON.stringify(shopping, null, 2)}\n`,
    "utf8"
  );

  return shopping;
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, "assets"), { recursive: true });
  await mkdir(path.join(dist, "data"), { recursive: true });

  await cp(path.join(root, "site", "index.html"), path.join(dist, "index.html"));
  await cp(path.join(root, "site", "recipes.html"), path.join(dist, "recipes.html"));
  await cp(path.join(root, "site", "recipe.html"), path.join(dist, "recipe.html"));
  await cp(path.join(root, "site", "shopping.html"), path.join(dist, "shopping.html"));
  await cp(path.join(root, "site", "app.js"), path.join(dist, "assets", "app.js"));
  await cp(path.join(root, "site", "styles.css"), path.join(dist, "assets", "styles.css"));
  await cp(publicData, path.join(dist, "data"), { recursive: true });
  const recipesData = await buildRecipesIndex();
  const weeksData = await buildWeeksIndex(recipesData);
  await buildShoppingListIndex(recipesData, weeksData);

  console.log("Site built in dist/");
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
