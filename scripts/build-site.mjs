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
  index.replaceAll('/static/styles.css', '/styles.css').replaceAll('/static/app.js', '/app.js'),
);

await mkdir(join(output, ".herenow"), { recursive: true });
await writeFile(
  join(output, ".herenow", "proxy.json"),
  JSON.stringify(
    {
      proxies: {
        "/health": { upstream: "https://wanderai-api.testpico.workers.dev/health" },
        "/api/*": { upstream: "https://wanderai-api.testpico.workers.dev", rateLimit: "100/hour/ip" },
      },
    },
    null,
    2,
  ),
);
