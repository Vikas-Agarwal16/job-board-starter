
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createApp } from "../server.js";
import { loadJobs } from "../lib/jobs.js";

test("saved jobs API", async (t) => {
  const savedFile = new URL("../saved.json", import.meta.url);
  let originalFile;

  try {
    originalFile = await readFile(savedFile);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  await writeFile(savedFile, "[]");

  const server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));

  const url = `http://localhost:${server.address().port}`;

  async function request(path, options = {}) {
    const res = await fetch(url + path, options);
    return { status: res.status, data: await res.json() };
  }

  const jobs = await loadJobs();
  const job = jobs[0];

  try {
    await t.test("saves a valid job", async () => {
      const result = await request("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });

      assert.equal(result.status, 200);
      assert.equal(result.data.id, job.id);
    });

    await t.test("does not save the same job twice", async () => {
      await request("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });

      const saved = await request("/api/saved");
      assert.equal(saved.data.length, 1);
    });

    await t.test("returns saved jobs", async () => {
      const result = await request("/api/saved");

      assert.equal(result.status, 200);
      assert.equal(result.data.length, 1);
      assert.equal(result.data[0].id, job.id);
    });

    await t.test("rejects an unknown job ID", async () => {
      const result = await request("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: "unknown-job" }),
      });

      assert.equal(result.status, 404);
    });

    await t.test("rejects a missing job ID", async () => {
      const result = await request("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      assert.equal(result.status, 400);
    });

    await t.test("keeps saved jobs in the JSON file", async () => {
      const data = JSON.parse(await readFile(savedFile, "utf8"));

      assert.deepEqual(data, [job.id]);
    });

    await t.test("removes a saved job", async () => {
      const result = await request(`/api/saved/${encodeURIComponent(job.id)}`, {
        method: "DELETE",
      });

      assert.equal(result.status, 200);

      const saved = await request("/api/saved");
      assert.equal(saved.data.length, 0);
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));

    if (originalFile) {
      await writeFile(savedFile, originalFile);
    } else {
      const { unlink } = await import("node:fs/promises");

      await unlink(savedFile).catch(() => {});
    }
  }
});
