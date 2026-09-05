import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

const source = "app/static";
const output = "site-dist";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const indexPath = join(output, "index.html");
const index = await readFile(indexPath, "utf8");
// New content gets a new URL, even when a browser retains older hosted assets.
const assetNames = {};
for (const name of ["styles.css", "ui.js"]) {
  const content = await readFile(join(output, name));
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const versioned = name.replace(/\.(css|js)$/, `-${hash}.$1`);
  await writeFile(join(output, versioned), content);
  assetNames[name] = versioned;
}
await writeFile(
  indexPath,
  index.replace('<head>', '<head>\n    <meta name="api-base" content="https://wanderai-api.testpico.workers.dev">')
    .replace(/\/static\/styles\.css(?:\?[^"\s]*)?/, `/${assetNames["styles.css"]}`)
    .replace('/static/ui.js', `/${assetNames["ui.js"]}`)
    .replaceAll('/static/', '/'),
);

await mkdir(join(output, ".herenow"), { recursive: true });
await writeFile(
  join(output, ".herenow", "proxy.json"),
  JSON.stringify(
    {
      proxies: {
        "/health": { upstream: "https://wanderai-api.testpico.workers.dev/health" },
        "/docs": { upstream: "https://wanderai-api.testpico.workers.dev/docs" },
        "/api/*": { upstream: "https://wanderai-api.testpico.workers.dev/api", rateLimit: "100/hour/ip" },
      },
    },
    null,
    2,
  ),
);
