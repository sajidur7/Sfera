// Inlines the built CSS + JS into one self-contained page for the review artifact.
// Output is head + body content only (the artifact host adds the document skeleton).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dir = 'dist';
const assets = readdirSync(`${dir}/assets`);
const css = assets.filter((a) => a.endsWith('.css')).map((f) => readFileSync(`${dir}/assets/${f}`, 'utf8')).join('\n');
const js = assets.filter((a) => a.endsWith('.js')).map((f) => readFileSync(`${dir}/assets/${f}`, 'utf8').replace(/<\/script/gi, '<\\/script')).join('\n');
const page = `<title>Sfera Design System</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap" rel="stylesheet" />
<style>${css}</style>
<style>body{background:#fff}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) body{background:#0E0E10}}:root[data-theme="dark"] body{background:#0E0E10}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync(`${dir}/sfera.html`, page);
console.log('wrote dist/sfera.html', (page.length / 1024).toFixed(0), 'kB');
