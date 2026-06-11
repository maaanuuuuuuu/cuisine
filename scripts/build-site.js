import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, "assets"), { recursive: true });
  await mkdir(path.join(dist, "data"), { recursive: true });

  await cp(path.join(root, "site", "index.html"), path.join(dist, "index.html"));
  await cp(path.join(root, "site", "recipes.html"), path.join(dist, "recipes.html"));
  await cp(path.join(root, "site", "recipe.html"), path.join(dist, "recipe.html"));
  await cp(path.join(root, "site", "app.js"), path.join(dist, "assets", "app.js"));
  await cp(path.join(root, "site", "styles.css"), path.join(dist, "assets", "styles.css"));
  await cp(path.join(root, "data", "public"), path.join(dist, "data"), { recursive: true });

  console.log("Site built in dist/");
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});

