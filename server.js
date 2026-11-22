
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { loadJobs, searchJobs, findJob } from "./lib/jobs.js";

const PORT = Number(process.env.PORT ?? 3000);
const SAVED_FILE = new URL("./saved.json", import.meta.url);

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function getSavedIds() {
  try {
    return JSON.parse(await readFile(SAVED_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function saveIds(ids) {
  await writeFile(SAVED_FILE, JSON.stringify(ids, null, 2));
}

export function createApp() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");

      if (req.method === "GET" && url.pathname === "/api/jobs") {
        const jobs = await loadJobs();
        return sendJson(res, 200, searchJobs(jobs, url.searchParams.get("q")));
      }

      if (req.method === "GET" && url.pathname === "/api/saved") {
        const jobs = await loadJobs();
        const ids = await getSavedIds();
        return sendJson(res, 200, ids.map((id) => findJob(jobs, id)).filter(Boolean));
      }

      if (req.method === "POST" && url.pathname === "/api/saved") {
        let body = "";

        for await (const chunk of req) body += chunk;

        let data;
        try {
          data = JSON.parse(body);
        } catch {
          return sendJson(res, 400, { error: "Invalid JSON" });
        }

        if (typeof data.jobId !== "string" || !data.jobId.trim()) {
          return sendJson(res, 400, { error: "jobId is required" });
        }

        const jobs = await loadJobs();
        const job = findJob(jobs, data.jobId);

        if (!job) return sendJson(res, 404, { error: "Job not found" });

        const ids = await getSavedIds();

        if (!ids.includes(data.jobId)) {
          ids.push(data.jobId);
          await saveIds(ids);
        }

        return sendJson(res, 200, job);
      }

      if (req.method === "DELETE" && url.pathname.startsWith("/api/saved/")) {
        const id = decodeURIComponent(url.pathname.slice("/api/saved/".length));
        const ids = await getSavedIds();
        const updated = ids.filter((savedId) => savedId !== id);

        if (updated.length !== ids.length) await saveIds(updated);

        return sendJson(res, 200, { message: "Job removed" });
      }

      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/app.js")) {
        const file = url.pathname === "/" ? "index.html" : "app.js";
        const type = file.endsWith(".html") ? "text/html" : "text/javascript";
        const body = await readFile(new URL(`./public/${file}`, import.meta.url));
        res.writeHead(200, { "content-type": `${type}; charset=utf-8` });
        return res.end(body);
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: "Something went wrong" });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp().listen(PORT, () => console.log(`Job board on http://localhost:${PORT}`));
}
