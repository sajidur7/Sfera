// Builds dist-installer/sfera-install.mjs: one self-contained Node script that
// carries the Sfera UI library (src/sfera) and the starter template (starter/).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const pack = (dir, prefix = '') => Object.fromEntries(walk(dir).map((f) => [prefix + relative(dir, f), readFileSync(f, 'utf8')]));

const library = pack('src/sfera');
const starter = pack('starter');
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;

const runtime = `#!/usr/bin/env node
// Sfera UI installer v${version} — one file, no dependencies besides Node 18+.
//
//   node sfera-install.mjs init my-app          # new Vite + React + StyleX app with Sfera UI
//   node sfera-install.mjs add                  # copy the library into ./src/sfera of an existing app
//   node sfera-install.mjs add --dir src/ui     # choose the folder
//   add --install                               # also run npm install for the dependencies
//
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const LIBRARY = ${JSON.stringify(library)};
const STARTER = ${JSON.stringify(starter)};
const DEPS = ['@stylexjs/stylex@0.19.2', 'lucide-react@1.73.0'];
const DEV_DEPS = ['@stylexjs/unplugin@0.19.2'];

const write = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const say = (s) => process.stdout.write(s + '\\n');
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => rest.includes(name);
const opt = (name, def) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : def);

if (cmd === 'init') {
  const name = rest.find((a) => !a.startsWith('--')) ?? 'sfera-app';
  const root = resolve(name);
  if (existsSync(root) && !flag('--force')) {
    say(\`✗ \${name} already exists. Pick another name or pass --force.\`);
    process.exit(1);
  }
  write(root, STARTER);
  write(join(root, 'src/sfera'), LIBRARY);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  pkg.name = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  writeFileSync(join(root, 'package.json'), JSON.stringify(pkg, null, 2) + '\\n');
  say(\`✓ Created \${name} with \${Object.keys(LIBRARY).length} Sfera UI files\`);
  if (flag('--install')) execSync('npm install', { cwd: root, stdio: 'inherit' });
  say('\\nNext:\\n  cd ' + name + (flag('--install') ? '' : '\\n  npm install') + '\\n  npm run dev');
} else if (cmd === 'add') {
  const dir = opt('--dir', 'src/sfera');
  const root = resolve('.');
  if (!existsSync(join(root, 'package.json'))) {
    say('✗ No package.json here. Run this inside your app, or use: node sfera-install.mjs init my-app');
    process.exit(1);
  }
  write(join(root, dir), LIBRARY);
  say(\`✓ Copied \${Object.keys(LIBRARY).length} files into \${dir}\`);
  if (flag('--install')) {
    execSync('npm install --save-exact ' + DEPS.join(' '), { cwd: root, stdio: 'inherit' });
    execSync('npm install --save-exact -D ' + DEV_DEPS.join(' '), { cwd: root, stdio: 'inherit' });
  } else {
    say('\\nInstall the dependencies:\\n  npm i -E ' + DEPS.join(' ') + '\\n  npm i -E -D ' + DEV_DEPS.join(' '));
  }
  if (!existsSync(join(root, '.browserslistrc'))) {
    writeFileSync(join(root, '.browserslistrc'), 'last 2 Chrome versions\\nlast 2 Firefox versions\\nlast 2 Safari versions\\n');
    say('✓ Added .browserslistrc (modern targets, so colour mixing is kept as-is)');
  }
  const cfg = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'].map((f) => join(root, f)).find(existsSync);
  const hasStylex = cfg && readFileSync(cfg, 'utf8').includes('@stylexjs/unplugin');
  if (!hasStylex) {
    say(\`\\nAdd StyleX to \${cfg ? cfg.split('/').pop() : 'vite.config.ts'}:\\n  import stylex from '@stylexjs/unplugin';\\n  plugins: [stylex.vite({ useCSSLayers: true, unstable_moduleResolution: { type: 'commonJS' } }), react()]\`);
  }
  say('\\nLoad the fonts in index.html:\\n  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap" rel="stylesheet" />');
  say(\`\\nThen wrap your app:\\n  import { SferaProvider } from './\${dir.replace(/^src\\//, '')}';\\n  <SferaProvider><App /></SferaProvider>\`);
} else {
  say('Sfera UI installer v${version}\\n\\n  node sfera-install.mjs init <name> [--install]\\n  node sfera-install.mjs add [--dir src/sfera] [--install]');
  process.exit(cmd ? 1 : 0);
}
`;
mkdirSync('dist-installer', { recursive: true });
writeFileSync('dist-installer/sfera-install.mjs', runtime);
console.log(`wrote dist-installer/sfera-install.mjs · ${Object.keys(library).length} library files · ${Object.keys(starter).length} starter files · ${(runtime.length / 1024).toFixed(0)} kB`);
