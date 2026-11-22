
const jobsList = document.getElementById("jobs");
const savedList = document.getElementById("saved-jobs");
const search = document.getElementById("search");

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function createJobItem(job, isSaved = false) {
  const li = document.createElement("li");
  const details = document.createElement("p");
  const button = document.createElement("button");

  details.textContent = `${job.title} at ${job.company}, ${job.location}. Rs ${job.stipend.toLocaleString("en-IN")} a month.`;

  button.textContent = isSaved ? "Remove" : "Save";
  button.disabled = !isSaved && savedIds.has(job.id);

  if (!isSaved && savedIds.has(job.id)) {
    button.textContent = "Saved";
  }

  button.addEventListener("click", async () => {
    try {
      if (isSaved) {
        await request(`/api/saved/${encodeURIComponent(job.id)}`, {
          method: "DELETE",
        });
      } else {
        await request("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id }),
        });
      }

      await loadSavedJobs();
      await showJobs(search.value);
    } catch (err) {
      alert(err.message);
    }
  });

  li.append(details, button);
  return li;
}

let savedIds = new Set();

async function loadSavedJobs() {
  const jobs = await request("/api/saved");
  savedIds = new Set(jobs.map((job) => job.id));

  savedList.innerHTML = "";

  if (jobs.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "You haven't saved any jobs yet.";
    savedList.append(li);
    return;
  }

  for (const job of jobs) {
    savedList.append(createJobItem(job, true));
  }
}

async function showJobs(query = "") {
  const jobs = await request(`/api/jobs?q=${encodeURIComponent(query)}`);
  jobsList.innerHTML = "";

  if (jobs.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No jobs found.";
    jobsList.append(li);
    return;
  }

  for (const job of jobs) {
    jobsList.append(createJobItem(job));
  }
}

search.addEventListener("input", () => showJobs(search.value).catch((err) => alert(err.message)));

async function start() {
  try {
    await loadSavedJobs();
    await showJobs();
  } catch (err) {
    alert(err.message);
  }
}

start();
