import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded === "/" ? "/index.html" : decoded);
  const target = path.join(dist, normalized);
  if (!target.startsWith(dist)) {
    return null;
  }
  return target;
}

const server = createServer(async (request, response) => {
  const target = safePath(request.url || "/");
  if (!target) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(target);
    const filePath = info.isDirectory() ? path.join(target, "index.html") : target;
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes.get(path.extname(filePath)) || "application/octet-stream"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Cuisine site: http://localhost:${port}`);
});

