const DATA_BASE = "data";

async function getJson(path) {
  const response = await fetch(`${DATA_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`Impossible de charger ${path}`);
  }
  return response.json();
}

function bySlug(recipes) {
  return new Map(recipes.map((recipe) => [recipe.slug, recipe]));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function recipeHref(slug) {
  return `recipe.html?slug=${encodeURIComponent(slug)}`;
}

function renderWeek(container, week, recipeMap) {
  if (!week || !Array.isArray(week.days) || week.days.length === 0) {
    container.innerHTML = `<div class="notice">Aucun planning disponible.</div>`;
    return;
  }

  container.innerHTML = week.days
    .map((day) => {
      const meals = day.meals
        .map((meal) => {
          const recipe = recipeMap.get(meal.recipe_slug);
          const title = meal.recipe_title || recipe?.title || "Recette à préciser";
          const note = meal.note ? `<p class="small">${escapeHtml(meal.note)}</p>` : "";
          const link = meal.recipe_slug
            ? `<a class="recipe-link" href="${recipeHref(meal.recipe_slug)}">Voir la recette</a>`
            : "";
          return `
            <article class="meal">
              <span class="meal-label">${escapeHtml(meal.type_label)}</span>
              <span class="meal-title">${escapeHtml(title)}</span>
              ${note}
              ${link}
            </article>
          `;
        })
        .join("");

      return `
        <article class="day">
          <h2>${escapeHtml(day.label)}</h2>
          <p class="meta">${escapeHtml(day.date)}</p>
          ${meals}
        </article>
      `;
    })
    .join("");
}

function renderShopping(container, shopping) {
  if (!shopping?.sections?.length) {
    container.innerHTML = `<div class="notice">Aucune liste de courses disponible.</div>`;
    return;
  }

  container.innerHTML = shopping.sections
    .map((section) => {
      const items = section.items
        .map((item) => `<li><span>${escapeHtml(item.name)}</span><span>${escapeHtml(item.quantity)}</span></li>`)
        .join("");
      return `
        <article class="shopping-section">
          <h3>${escapeHtml(section.name)}</h3>
          <ul>${items}</ul>
        </article>
      `;
    })
    .join("");
}

async function initHome() {
  const [currentWeek, previousWeek, recipesData, shopping] = await Promise.all([
    getJson("current-week.json"),
    getJson("previous-week.json"),
    getJson("recipes.json"),
    getJson("shopping-list.json")
  ]);

  const recipeMap = bySlug(recipesData.recipes);
  const weekView = document.querySelector("#week-view");
  const tabs = document.querySelectorAll("[data-week-tab]");

  renderWeek(weekView, currentWeek, recipeMap);
  renderShopping(document.querySelector("#shopping-list"), shopping);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((button) => button.classList.remove("is-active"));
      tab.classList.add("is-active");
      const selected = tab.dataset.weekTab === "previous" ? previousWeek : currentWeek;
      renderWeek(weekView, selected, recipeMap);
    });
  });
}

function recipeSearchText(recipe) {
  return [
    recipe.title,
    recipe.summary,
    ...(recipe.tags || []),
    ...(recipe.ingredients || []).map((ingredient) => ingredient.name)
  ]
    .join(" ")
    .toLocaleLowerCase("fr-FR");
}

function renderRecipeCards(container, recipes, query = "") {
  const normalized = query.trim().toLocaleLowerCase("fr-FR");
  const filtered = normalized
    ? recipes.filter((recipe) => recipeSearchText(recipe).includes(normalized))
    : recipes;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="notice">Aucune recette ne correspond à cette recherche.</div>`;
    return;
  }

  container.innerHTML = filtered
    .map((recipe) => {
      const tags = (recipe.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
      return `
        <article class="recipe-card">
          <h2>${escapeHtml(recipe.title)}</h2>
          <p>${escapeHtml(recipe.summary)}</p>
          <p class="meta">${escapeHtml(recipe.total_time_minutes)} min · ${escapeHtml(recipe.difficulty)} · ${escapeHtml(recipe.servings)}</p>
          <div class="tag-row">${tags}</div>
          <a class="recipe-link" href="${recipeHref(recipe.slug)}">Ouvrir</a>
        </article>
      `;
    })
    .join("");
}

async function initRecipes() {
  const recipesData = await getJson("recipes.json");
  const recipes = [...recipesData.recipes].sort((a, b) => a.title.localeCompare(b.title, "fr"));
  const input = document.querySelector("#recipe-search");
  const results = document.querySelector("#recipe-results");

  renderRecipeCards(results, recipes);
  input.addEventListener("input", () => renderRecipeCards(results, recipes, input.value));
}

function formatAlliumWarnings(recipe) {
  const raw = recipe.raw_alliums || {};
  const warnings = [];
  if (raw.garlic) warnings.push("ail cru");
  if (raw.onion) warnings.push("oignon cru");
  if (raw.shallot) warnings.push("échalote crue");
  return warnings;
}

function renderRecipeDetail(container, recipe) {
  const warnings = formatAlliumWarnings(recipe);
  const warningHtml = warnings.length
    ? `<div class="notice warn">Attention : cette recette contient ${escapeHtml(warnings.join(", "))}.</div>`
    : `<div class="notice">Pas d'ail cru, d'oignon cru ou d'échalote crue signalés.</div>`;

  const ingredientHtml = recipe.ingredients
    .map((ingredient) => {
      const kcal = ingredient.calories != null ? ` · ${ingredient.calories} kcal` : "";
      return `
        <li class="ingredient">
          <span>${escapeHtml(ingredient.name)}<br><span class="small">${escapeHtml(ingredient.quantity)}${kcal}</span></span>
          <span>${escapeHtml(ingredient.section || "")}</span>
        </li>
      `;
    })
    .join("");

  const stepsHtml = recipe.steps
    .map((step, index) => `
      <article class="step">
        <h3>${index + 1}. ${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.text)}</p>
      </article>
    `)
    .join("");

  const tags = (recipe.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  container.innerHTML = `
    <section class="section-header">
      <p class="eyebrow">Recette</p>
      <h1>${escapeHtml(recipe.title)}</h1>
    </section>
    <p>${escapeHtml(recipe.summary)}</p>
    <div class="tag-row">${tags}</div>
    <div class="stats">
      <div class="stat"><span>Portions</span><strong>${escapeHtml(recipe.servings)}</strong></div>
      <div class="stat"><span>Temps</span><strong>${escapeHtml(recipe.total_time_minutes)} min</strong></div>
      <div class="stat"><span>Calories</span><strong>${escapeHtml(recipe.nutrition?.calories_total)} kcal</strong></div>
      <div class="stat"><span>Macros</span><strong>${escapeHtml(recipe.nutrition?.protein_g)} P · ${escapeHtml(recipe.nutrition?.carbs_g)} G · ${escapeHtml(recipe.nutrition?.fat_g)} L</strong></div>
    </div>
    ${warningHtml}
    <section class="detail-panel">
      <h2>Ingrédients</h2>
      <ul class="ingredient-grid">${ingredientHtml}</ul>
    </section>
    <section class="detail-panel">
      <h2>Mode cuisine</h2>
      <div class="step-list">${stepsHtml}</div>
    </section>
  `;
}

async function initRecipeDetail() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const recipesData = await getJson("recipes.json");
  const recipe = recipesData.recipes.find((item) => item.slug === slug);
  const container = document.querySelector("#recipe-detail");

  if (!recipe) {
    container.innerHTML = `<div class="notice">Recette introuvable.</div>`;
    return;
  }

  renderRecipeDetail(container, recipe);
}

async function main() {
  const page = document.body.dataset.page;
  try {
    if (page === "home") await initHome();
    if (page === "recipes") await initRecipes();
    if (page === "recipe") await initRecipeDetail();
  } catch (error) {
    document.querySelector("main").innerHTML = `<div class="notice warn">${escapeHtml(error.message)}</div>`;
  }
}

main();

