/**
 * Tests for the visual companion's Superpowers/Prime Radiant branding.
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const REPO_ROOT = path.join(__dirname, '../..');
const SERVER_PATH = path.join(REPO_ROOT, 'skills/brainstorming/scripts/server.cjs');
const PACKAGE_VERSION = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf-8')
).version;
const TOKEN = 'testtoken-branding-0123456789abcdef';

function cleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startServer({ port, dir, env = {}, serverPath = SERVER_PATH }) {
  cleanup(dir);
  return spawn('node', [serverPath], {
    env: {
      ...process.env,
      BRAINSTORM_PORT: String(port),
      BRAINSTORM_DIR: dir,
      BRAINSTORM_TOKEN: TOKEN,
      ...env
    }
  });
}

function waitForServer(server) {
  let stdout = '';
  let stderr = '';

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server did not start. stderr: ${stderr}`)), 5000);
    server.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.includes('server-started')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on('data', (data) => { stderr += data.toString(); });
    server.on('error', reject);
  });
}

function fetchHtml(port) {
  return new Promise((resolve, reject) => {
    const headers = { Cookie: `brainstorm-key-${port}=${TOKEN}` };
    http.get(`http://localhost:${port}/`, { headers }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function writeFragment(dir) {
  const contentDir = path.join(dir, 'content');
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, 'screen.html'), '<h2>Pick a layout</h2>');
}

function createPackagedServerFixture(version) {
  const root = fs.mkdtempSync(path.join('/tmp', 'superpowers-packaged-server-'));
  const scriptDir = path.join(root, 'skills/brainstorming/scripts');
  fs.cpSync(path.join(REPO_ROOT, 'skills/brainstorming/scripts'), scriptDir, { recursive: true });
  fs.mkdirSync(path.join(root, '.codex-plugin'), { recursive: true });
  fs.writeFileSync(
    path.join(root, '.codex-plugin/plugin.json'),
    JSON.stringify({ name: 'superpowers', version }, null, 2)
  );
  return {
    root,
    serverPath: path.join(scriptDir, 'server.cjs')
  };
}

async function withServer(options, fn) {
  const server = startServer(options);
  try {
    await waitForServer(server);
    await fn();
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill();
      await new Promise(resolve => server.once('exit', resolve));
    }
    await sleep(100);
    cleanup(options.dir);
  }
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

function assertBranding(html, version = PACKAGE_VERSION) {
  assert(
    html.includes(`Prime Radiant Superpowers v${version}`),
    'branding should include Prime Radiant/Superpowers version text'
  );
}

function assertFramedScreenUsesBrandHeader(html) {
  assert(!html.includes('<div class="indicator-bar">'), 'framed screens should not render footer chrome');
  assert(
    /<div class="header">[\s\S]*<div class="brand">[\s\S]*<div class="status">Connecting…<\/div>/.test(html),
    'header should contain branding and connection status'
  );
  assert(!html.includes('id="indicator-text"'), 'header should not render the selection indicator text');
  assert(!html.includes('Click an option above'), 'header should not render the selection instruction');
}

// Hosts the companion HTML may mention: the XML namespace and this fork's repo link.
const ALLOWED_URL_PREFIXES = [
  'http://www.w3.org/',
  'https://github.com/hubertusgbecker/superpowers'
];

function assertNoExternalReferences(html) {
  const urls = html.match(/(?:https?:)?\/\/[A-Za-z0-9.-]+[^\s"'<>)]*/g) || [];
  const offenders = urls.filter(u => !ALLOWED_URL_PREFIXES.some(p => u.startsWith(p)));
  assert.deepStrictEqual(offenders, [], 'companion HTML must not reference external hosts');
  assert(!/<img\b/i.test(html), 'companion HTML must not load images');
  assert(!/<script\b[^>]*\bsrc=/i.test(html), 'companion HTML must not load external scripts');
  assert(!/<link\b[^>]*\bhref=/i.test(html), 'companion HTML must not load external stylesheets');
}

const RUNTIME_SOURCE_ROOTS = [
  'skills/brainstorming/scripts',
  'hooks',
  '.opencode/plugins',
  '.pi/extensions',
  '.hermes-plugin',
  '.muse-plugin'
];

const FORBIDDEN_RUNTIME_PATTERNS = [
  [/\bfetch\s*\(/, 'fetch()'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/sendBeacon/, 'sendBeacon'],
  [/node:https|require\(\s*['"]https['"]\s*\)|from\s+['"]https['"]/, 'https module'],
  [/\bhttp\.(request|get)\s*\(/, 'http.request/get'],
  [/\b(curl|wget)\b/, 'curl/wget'],
  [/\burllib\b|\brequests\./, 'python http client'],
  [/telemetry/i, 'telemetry'],
  [/primeradiant\.com/i, 'primeradiant.com']
];

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

function assertHeaderAvoidsNarrowOverlap(html) {
  assert(
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto/i.test(html),
    'header should allocate shrinkable space to branding before the status column'
  );
  assert(
    /\.header \.status\s*\{[^}]*grid-column:\s*2/i.test(html),
    'status should live in the final fixed-width grid column'
  );
  assert(
    /\.header \.brand\s*\{[^}]*width:\s*100%/i.test(html),
    'header brand should fill its grid track so overflow clipping prevents overlap'
  );
}

async function main() {
  console.log('\n--- Visual Companion Branding ---');

  await test('framed screens render versioned Prime Radiant branding by default', async () => {
    const port = 3451;
    const dir = '/tmp/brainstorm-branding-default';
    await withServer({ port, dir }, async () => {
      writeFragment(dir);
      await sleep(300);
      const html = await fetchHtml(port);
      assertBranding(html);
      assertFramedScreenUsesBrandHeader(html);
      assertHeaderAvoidsNarrowOverlap(html);
    });
  });

  await test('waiting screen renders versioned Prime Radiant branding by default', async () => {
    const port = 3452;
    const dir = '/tmp/brainstorm-branding-waiting';
    await withServer({ port, dir }, async () => {
      const html = await fetchHtml(port);
      assert(html.includes('Waiting for the agent'), 'waiting page should still render');
      assertBranding(html);
    });
  });

  await test('packaged Codex plugin reads version from .codex-plugin manifest', async () => {
    const port = 3457;
    const dir = '/tmp/brainstorm-branding-packaged-codex';
    const packagedVersion = '7.8.9';
    const fixture = createPackagedServerFixture(packagedVersion);

    try {
      await withServer({ port, dir, serverPath: fixture.serverPath }, async () => {
        writeFragment(dir);
        await sleep(300);
        const html = await fetchHtml(port);
        assertBranding(html, packagedVersion);
        assert(!html.includes('Superpowers vunknown'), 'packaged plugin should not fall back to unknown version');
      });
    } finally {
      cleanup(fixture.root);
    }
  });

  await test('no telemetry: served companion pages reference no external hosts', async () => {
    const port = 3458;
    const dir = '/tmp/brainstorm-branding-no-external';
    await withServer({ port, dir }, async () => {
      assertNoExternalReferences(await fetchHtml(port));
      writeFragment(dir);
      await sleep(300);
      assertNoExternalReferences(await fetchHtml(port));
    });
  });

  await test('no telemetry: runtime sources contain no network or telemetry code', async () => {
    const hits = [];
    for (const root of RUNTIME_SOURCE_ROOTS) {
      for (const file of listFiles(path.join(REPO_ROOT, root))) {
        if (/\.(md|png|jpe?g|svg|ico)$/i.test(file)) continue;
        const text = fs.readFileSync(file, 'utf-8');
        for (const [pattern, label] of FORBIDDEN_RUNTIME_PATTERNS) {
          if (pattern.test(text)) hits.push(`${path.relative(REPO_ROOT, file)}: ${label}`);
        }
      }
    }
    assert.deepStrictEqual(hits, [], 'runtime sources must not contain network or telemetry code');
  });

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
