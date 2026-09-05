import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const source = "app/static";
const output = "site-dist";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const indexPath = join(output, "index.html");
const index = await readFile(indexPath, "utf8");
await writeFile(
  indexPath,
  index.replace('<head>', '<head>\n    <meta name="api-base" content="https://wanderai-api.testpico.workers.dev">').replaceAll('/static/styles.css', '/styles.css').replaceAll('/static/', '/'),
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
