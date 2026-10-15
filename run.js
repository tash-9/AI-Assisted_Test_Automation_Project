// Usage:
//   node run.js ui [spec files...]   -> Playwright tests + Playwright HTML report
//   node run.js api                  -> Postman collection via Newman + HTML/JSON report
//   node run.js all                  -> UI (q1 -> q2 -> q3) then API
// Reports are generated after every execution, even when tests fail.
const { spawnSync } = require('child_process');
const fs = require('fs');

// Minimal .env loader (no extra dependency)
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const sh = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true });

function runUi(files) {
  const r = sh('npx', ['playwright', 'test', ...files]);
  console.log('\nUI report: playwright-report/index.html (npm run report:playwright)');
  return r.status ?? 1;
}

function runApi() {
  const key = process.env.REQRES_API_KEY;
  if (!key || key.startsWith('PASTE_')) {
    console.error('\nREQRES_API_KEY is missing. Create a .env file (see .env.example) with:\nREQRES_API_KEY=your_key_from_reqres.in\n');
    return 1;
  }
  fs.mkdirSync('newman', { recursive: true });
  const r = sh('npx', [
    'newman', 'run', 'postman/reqres-api-automation.postman_collection.json',
    '-e', 'postman/reqres.postman_environment.json',
    '--env-var', `apiKey=${key}`,
    '-r', 'cli,htmlextra,json',
    '--reporter-htmlextra-export', 'newman/api-report.html',
    '--reporter-json-export', 'newman/api-report.json',
  ]);
  console.log('\nAPI report: newman/api-report.html');
  return r.status ?? 1;
}

const [mode = 'ui', ...rest] = process.argv.slice(2);
let code = 0;
if (mode === 'ui') code = runUi(rest);
else if (mode === 'api') code = runApi();
else if (mode === 'all') { const ui = runUi([]); const api = runApi(); code = ui || api; }
else { console.error('Unknown mode. Use: ui | api | all'); code = 1; }
process.exit(code);
