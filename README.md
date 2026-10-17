# Automation Testing Project (Playwright + Postman)

UI and API automation for the Automation Testing Assessment.

- **UI** – [SauceDemo](https://www.saucedemo.com/) with **Playwright + JavaScript** → Playwright HTML report
- **API** – [Reqres](https://reqres.in/api) with a **Postman collection** run from the command line with **Newman** → HTML + JSON report

## Project structure

```text
.
├── helpers/application-helper.js     # login, reset App State, logout, checkout form
├── tests/
│   ├── q1-locked-out-user-login.spec.js
│   ├── q2-standard-user-purchase.spec.js
│   └── q3-performance-glitch-user-purchase.spec.js
├── postman/
│   ├── reqres-api-automation.postman_collection.json
│   └── reqres.postman_environment.json
├── playwright.config.js
├── run.js                            # runs tests and always builds the reports
└── package.json
```

## Prerequisites

- Node.js 18+
- A free Reqres API key from https://reqres.in

## Setup

```bash
git clone https://github.com/tash-9/AI-Assisted_Test_Automation_Project/
cd AI-Assisted_Test_Automation_Project
npm install
npx playwright install chromium
```

Open the `.env` file in the project root and paste your Reqres API key (copy `.env.example` if `.env` is missing):

```text
REQRES_API_KEY=your_key_from_reqres.in
```

`.env` is git-ignored, so your key is never uploaded. Without a valid key every API request returns `403 invalid_api_key`.

## UI tests (Playwright)

| Scenario | Command |
|---|---|
| Q1 – locked_out_user error message | `npm run test:q1` |
| Q2 – standard_user, 3 items, checkout, order, reset, logout | `npm run test:q2` |
| Q3 – performance_glitch_user, sort Z→A, first item, checkout | `npm run test:q3` |
| All three sequentially (q1 → q2 → q3, 1 worker) | `npm run test:ui` |

Reports are generated after **every** run, even when a test fails:

- Playwright HTML report: `npm run report:playwright`

## API tests (Postman + Newman)

```bash
npm run test:api
```

Report: `newman/api-report.html` (JSON copy in `newman/api-report.json`).

The collection runs in order and every request asserts its status code:

| Request | Method / endpoint | Checks |
|---|---|---|
| Q3 | POST `/login` | 200, token returned, stored as `authToken` |
| Q4 | GET `/users/2` | 200, id, name and email match, stored as `userId`, `userName`, `userEmail` |
| Q5 | PUT `/users/{{userId}}` | 200, name/job updated, valid and recent `updatedAt` |
| Q6 | PATCH `/users/{{userId}}` | 200, only `job` (+ `updatedAt`) in response |
| Q8A | GET `/users/{{invalidUserId}}` (stored userId + 21) | 404, 4xx |
| Q8B | POST `/login` with stored email, no password | 400, "Missing password" |
| Q8C | POST `/login` with unregistered email built from stored email | 400, "user not found" |
| Q8D | GET `/users/{{userId}}` with an invalid API key | 4xx, not 200 |

You can also import both files from `postman/` into the Postman app and use **Run collection**.

> Reqres simulates PUT/PATCH: responses are validated, but data is not permanently changed.

## Everything together

```bash
npm run test:all     # UI (sequential) then API, with all reports generated
```

## Notes

- Never commit a real API key. Keep it in `.env` only (git-ignored).
- SauceDemo test data: users `locked_out_user`, `standard_user`, `performance_glitch_user`; password `secret_sauce`.

## Author
Tasfia Islam Raisha
