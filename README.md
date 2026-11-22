# Job board starter

A small job board for an insiderOne work sample. It is made up: the jobs and
companies are not real.

## Run it

You need Node 20 or newer. There are no packages to install.

```
npm start      # then open http://localhost:3000
npm test       # runs the tests in test/
```

## What is here

- `server.js`: the web server. `GET /api/jobs?q=` lists jobs, `GET /` serves the page.
- `lib/jobs.js`: reading and searching the jobs. Pure functions.
- `jobs.json`: the jobs.
- `public/`: the page and its script.
- `test/`: tests, using Node's built-in test runner.

## Your task

See the work sample brief on insiderOne: add saved jobs (save, list, remove),
with tests, and add a short section to this README about what you built.

## What I built

I added a saved jobs feature to the job board. Users can save jobs they are interested in, view them in a separate section and remove them whenever they want.

- Added a Save button to each job.
- Added a Saved Jobs section to display saved jobs.
- Added a Remove button for saved jobs.
- Added API endpoints for saving, listing and removing jobs.
- Prevented the same job from being saved multiple times.
- Handled invalid and unknown job IDs.
- Stored saved job IDs in a JSON file so they remain saved after refreshing the page.

## Implementation

I kept the existing Node.js setup and didn't add any external packages. Saved jobs are stored in `saved.json`, and the job details are retrieved from the existing jobs file using their IDs.

## API endpoints

- `POST /api/saved` – saves a job.
- `GET /api/saved` – returns the saved jobs.
- `DELETE /api/saved/:jobId` – removes a saved job.

## Tests

I added tests using Node's built-in test runner to check saving jobs, preventing duplicates, retrieving saved jobs, handling invalid IDs, persistence and removing jobs.

Run the tests using:

```
npm test
```

All 11 tests passed, including the original tests and the new saved jobs tests.

## Decisions and next steps

I used a JSON file instead of introducing a database because the starter project is small and doesn't require one. This keeps the implementation simple and avoids adding dependencies.

If I extend this further, I'd improve error handling for edge cases and test the UI on different screen sizes.

## AI assistance

I used AI tools to help with implementation, code review and testing. I reviewed the changes and ran the test suite during development.