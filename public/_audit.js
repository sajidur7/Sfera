// Responsive audit for the Sfera UI docs (dev aid, not part of the library).
// Load in the page with: await import('/_audit.js'); then await window.__auditRun(opts)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function collectRoutes() {
  location.hash = '#components';
  await sleep(700);
  const comps = [...new Set([...document.querySelectorAll('a[href^="#components-"]')].map((a) => a.getAttribute('href')))];
  location.hash = '#screens';
  await sleep(700);
  const scr = [...new Set([...document.querySelectorAll('a[href^="#screens-"]')].map((a) => a.getAttribute('href')))];
  const docs = ['overview', 'installation', 'principles', 'coverage', 'color', 'typography', 'spacing', 'elevation', 'motion', 'iconography'].map((p) => '#docs-' + p);
  return [...docs, '#themes', '#components', '#screens', ...comps, ...scr];
}

const visible = (el) => {
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && !el.closest('[inert]') && !el.closest('[aria-hidden="true"]');
};
const sig = (el) => {
  const name = el.getAttribute('aria-label') || el.textContent.trim().replace(/\s+/g, ' ').slice(0, 24) || el.tagName;
  return `${el.tagName.toLowerCase()}:${name}`;
};
const leafBottom = (root) => {
  let max = -Infinity;
  root.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName;
    const leaf = el.children.length === 0 || ['IMG', 'INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'CANVAS'].includes(tag) || tag === 'svg';
    if (!leaf || (el.closest('svg') && tag !== 'svg')) return;
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed' || cs.display === 'none') return;
    const b = el.getBoundingClientRect();
    if (b.width || b.height) max = Math.max(max, b.bottom);
  });
  return max;
};

function checkPage() {
  const vw = document.documentElement.clientWidth;
  const coarse = vw <= 900;
  const issues = { overflow: [], target: [], input: [], tiny: [], gap: [], clip: [] };
  if (document.documentElement.scrollWidth > vw + 1) {
    const culprits = [];
    document.querySelectorAll('#root *').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.right <= vw + 1 || !b.width) return;
      let p = el.parentElement;
      while (p && p !== document.body) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= vw + 1) return;
        p = p.parentElement;
      }
      culprits.push(sig(el));
    });
    issues.overflow.push(`${document.documentElement.scrollWidth}px: ${culprits.slice(0, 2).join(', ')}`);
  }
  // touch targets: interactive controls under 32px (40px rule enforced for coarse pointers)
  if (coarse) {
    document.querySelectorAll('#root button, #root a[href], #root input:not([type=hidden]), #root [role=tab], #root [role=radio], #root [role=option], #root [role=switch], #root select, #root textarea').forEach((el) => {
      if (!visible(el)) return;
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') return; // links inside sentences
      if (el.type === 'checkbox' || el.type === 'radio' || el.type === 'range' || el.type === 'file') return; // native inputs are wrapped by a larger label/thumb
      if (el.closest('[data-chart-target]') || el.hasAttribute('data-chart-target')) return; // charts take a finger sliding across the plot
      const b = el.getBoundingClientRect();
      // an invisible ::before hit area counts
      const pb = getComputedStyle(el, '::before');
      const grow = pb.content !== 'none' && pb.position === 'absolute' ? Math.max(0, -parseFloat(pb.top) || 0) * 2 : 0;
      // the hit area counts if a parent <label> or input frame wraps it
      const lab = el.closest('label') || (el.tagName === 'INPUT' ? el.parentElement : null);
      const h = (lab ? Math.max(b.height, lab.getBoundingClientRect().height) : b.height) + grow;
      const w = (lab ? Math.max(b.width, lab.getBoundingClientRect().width) : b.width) + grow;
      if (h < 32 || w < 32) issues.target.push(`${sig(el)} ${Math.round(w)}x${Math.round(h)}`);
    });
  }
  if (vw <= 640) {
    document.querySelectorAll('#root input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), #root textarea, #root [contenteditable=true]').forEach((el) => {
      if (!visible(el)) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) issues.input.push(`${sig(el)} ${fs}px`);
    });
  }
  // tiny text (avatar initials are decorative: the avatar has an accessible name)
  document.querySelectorAll('#root *').forEach((el) => {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    if (!visible(el) || el.closest('[role=img]')) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 11) issues.tiny.push(`${sig(el)} ${fs}px`);
  });
  // text clipped without an ellipsis (content wider than box while overflow hidden)
  document.querySelectorAll('#root *').forEach((el) => {
    if (!visible(el)) return;
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'hidden' || cs.textOverflow === 'ellipsis' || el.scrollWidth <= el.clientWidth + 2) return;
    if (el.getBoundingClientRect().width <= 1) return; // visually hidden on purpose
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    issues.clip.push(sig(el));
  });
  if (vw > 700) {
    document.querySelectorAll('[data-sfera="card"]').forEach((el) => {
      if (el.closest('[inert]')) return;
      const r = el.getBoundingClientRect();
      if (r.height < 60) return;
      const cs = getComputedStyle(el);
      const gap = Math.round(r.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth) - leafBottom(el));
      if (gap > 30) issues.gap.push(`card(${gap}) ${sig(el)}`);
    });
    document.querySelectorAll('[data-sfera="well"]').forEach((el) => {
      if (el.closest('[inert]')) return;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      let max = -Infinity;
      [...el.children].forEach((c) => getComputedStyle(c).position !== 'absolute' && (max = Math.max(max, c.getBoundingClientRect().bottom)));
      const gap = Math.round(r.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth) - max);
      if (gap > 12) issues.gap.push(`well(${gap}) ${sig(el)}`);
    });
  }
  return issues;
}

window.__auditErrs = window.__auditErrs || [];
if (!window.__auditHooked) {
  window.__auditHooked = true;
  window.addEventListener('error', (e) => window.__auditErrs.push(location.hash + ' :: ' + e.message));
  const oe = console.error;
  console.error = (...a) => {
    window.__auditErrs.push(location.hash + ' :: ' + String(a[0]).slice(0, 160));
    oe(...a);
  };
}

window.__auditRun = async ({ mode = 'Light', delay = 240 } = {}) => {
  const routes = window.__auditRoutes || (window.__auditRoutes = await collectRoutes());
  location.hash = '#docs-overview';
  await sleep(500);
  document.querySelector(`[role=radio][aria-label=${mode}]`)?.click();
  const byKind = { overflow: {}, target: {}, input: {}, tiny: {}, gap: {}, clip: {} };
  for (const r of routes) {
    location.hash = r;
    await sleep(delay);
    const res = checkPage();
    for (const k of Object.keys(res)) for (const v of res[k]) (byKind[k][v] ??= []).push(r.slice(1));
  }
  // compact: unique issue → count of pages + first page
  const summary = {};
  for (const k of Object.keys(byKind)) summary[k] = Object.entries(byKind[k]).map(([v, pages]) => `${v} ×${pages.length} (${pages[0]})`);
  return { vw: document.documentElement.clientWidth, vh: innerHeight, mode, pages: routes.length, coarse: matchMedia('(pointer: coarse)').matches, summary, errs: [...new Set(window.__auditErrs)].slice(0, 10) };
};
