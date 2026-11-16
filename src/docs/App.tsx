import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookOpen, Blocks, Menu, MonitorSmartphone, Moon, Palette, Sun } from 'lucide-react';
import { accent, colors, font, motion, radius } from '../sfera/tokens.stylex';
import { Drawer, IconButton, SferaProvider, SearchInput, SideNavItem, SideNavSection, useSfera, accentSwatches, type AccentName, Kbd } from '../sfera';
import { components, groups } from './registry';
import { screens } from '../screens';
import { Pages } from './pages';
import { ComponentPage, ComponentsIndex } from './ComponentPage';
import { ScreenView, ScreensIndex } from './ScreensPages';

// ───────── routing
export type Route = { section: 'docs' | 'components' | 'screens' | 'themes'; page: string };
const parse = (h: string): Route => {
  const raw = h.replace(/^#/, '');
  const i = raw.indexOf('-');
  const section = i < 0 ? raw : raw.slice(0, i);
  const page = i < 0 ? '' : raw.slice(i + 1);
  if (section === 'components' || section === 'screens' || section === 'themes') return { section, page };
  return { section: 'docs', page: page || 'overview' };
};
// Plain #name hashes (e.g. #components-button) so links survive inside an artifact.
export const href = (r: Route) => `#${r.section}${r.page ? '-' + r.page : ''}`;
export function useRoute() {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parse(location.hash));
      document.getElementById('docs-main')?.scrollTo?.({ top: 0 });
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
export const go = (r: Route) => {
  location.hash = href(r);
};

export const docPages: { id: string; label: string; group: string }[] = [
  { id: 'overview', label: 'Overview', group: 'Getting started' },
  { id: 'installation', label: 'Installation', group: 'Getting started' },
  { id: 'principles', label: 'UX rules applied', group: 'Getting started' },
  { id: 'coverage', label: 'Coverage', group: 'Getting started' },
  { id: 'color', label: 'Colour', group: 'Foundations' },
  { id: 'typography', label: 'Typography', group: 'Foundations' },
  { id: 'spacing', label: 'Spacing and radius', group: 'Foundations' },
  { id: 'elevation', label: 'Elevation', group: 'Foundations' },
  { id: 'motion', label: 'Motion', group: 'Foundations' },
  { id: 'iconography', label: 'Iconography', group: 'Foundations' },
];

// ───────── layout
const ly = stylex.create({
  root: { display: 'flex', minHeight: '100dvh' },
  side: {
    position: 'sticky',
    top: 0,
    height: '100dvh',
    width: 272,
    flexShrink: 0,
    display: { default: 'flex', '@media (max-width: 960px)': 'none' },
    flexDirection: 'column',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    backgroundColor: colors.page,
  },
  sideScroll: { flexGrow: 1, overflowY: 'auto', padding: '4px 12px 16px', display: 'flex', flexDirection: 'column', gap: 2 },
  main: { flexGrow: 1, minWidth: 0 },
  mobileBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: { default: 'none', '@media (max-width: 960px)': 'flex' },
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingInline: 12,
    backgroundColor: colors.page,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  content: { maxWidth: 1120, marginInline: 'auto', padding: { default: '40px 48px 96px', '@media (max-width: 960px)': '24px 16px 72px' } },
  brand: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '18px 16px 14px 18px' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: colors.text, borderRadius: 8, padding: { default: 0, '@media (pointer: coarse)': 4 }, margin: { default: 0, '@media (pointer: coarse)': -4 }, transitionProperty: 'transform', transitionDuration: motion.fast, transitionTimingFunction: motion.ease, transform: { default: null, ':hover': 'translateY(-1px)', ':active': 'translateY(1px) scale(0.96)' } },
  logoText: { fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' },
  ver: { fontFamily: font.mono, fontSize: 11, color: colors.textSubtle },
  sections: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 0 10px' },
  secBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingInline: 10,
    borderRadius: radius.control,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    color: colors.textMuted,
    fontSize: font.sm,
    fontWeight: 500,
    textDecoration: 'none',
    transitionProperty: 'background-color, color, transform',
    transitionDuration: motion.fast,
    transform: { default: null, ':active': 'scale(0.97)' },
  },
  secOn: { color: colors.text, backgroundColor: { default: colors.well, ':hover': colors.well }, borderColor: colors.wellEdge },
  search: { padding: '0 0 6px' },
  foot: { padding: '12px 16px 16px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  swatches: { display: 'flex', gap: 6 },
  swatch: {
    position: 'relative',
    width: 18,
    height: 18,
    borderRadius: '50%',
    '::before': { content: '""', position: 'absolute', inset: { default: -4, '@media (pointer: coarse)': -7 } },
    borderWidth: 0,
    padding: 0,
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: motion.fast,
    transform: { default: null, ':hover': 'scale(1.12)' },
  },
  swatchOn: { boxShadow: `0 0 0 2px ${colors.page}, 0 0 0 3.5px currentColor` },
  empty: { padding: '12px 10px', fontSize: font.sm, color: colors.textMuted },
});

/**
 * The Sfera UI mark, drawn as a raised key: rounded face, a darker flat base
 * underneath for depth and a soft shadow. Flat colours only (no gradients);
 * face and S swap with the theme.
 */
export function SferaLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.06} viewBox="0 0 800 850" aria-hidden style={{ flexShrink: 0, overflow: 'visible', filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.1}px rgba(0,0,0,0.22))` }}>
      <rect y="50" width="800" height="800" rx="200" style={{ fill: `color-mix(in oklab, ${colors.text} 72%, ${colors.page})` }} />
      <rect width="800" height="800" rx="200" style={{ fill: colors.text }} />
      <rect x="30" y="24" width="740" height="740" rx="176" fill="none" style={{ stroke: `color-mix(in oklab, ${colors.page} 18%, transparent)` }} strokeWidth="10" />
      <g transform="translate(110 110) scale(0.725)">
        <path d="M187.424 265.27C187.424 294.014 199.003 313.575 222.155 323.953C246.107 334.332 274.851 339.92 308.383 340.719H398.192C412.566 340.719 430.144 341.119 450.898 341.918C471.652 342.716 493.227 345.111 515.569 349.103C537.938 352.296 559.883 357.487 581.432 364.672C603.8 371.857 623.76 382.236 641.311 395.811C658.889 409.383 672.866 426.549 683.243 447.306C694.414 467.267 700 492.017 700 521.558C700 550.302 694.414 574.653 683.243 594.612C672.866 614.573 658.889 631.339 641.311 644.911C624.555 657.685 605.389 668.066 583.841 676.049C562.266 683.235 540.321 688.823 517.978 692.815C495.609 696.008 474.061 698.006 453.307 698.804C433.347 699.602 416.166 700 401.792 700V612.576C414.578 612.576 432.526 612.974 455.689 613.772C478.852 614.573 501.592 612.576 523.961 607.786C547.097 602.996 567.057 594.211 583.841 581.438C600.597 568.664 608.989 548.702 608.989 521.558C608.989 501.597 604.198 485.63 594.615 473.654C585.032 461.679 572.643 452.497 557.474 446.11C543.126 439.723 527.137 435.728 509.586 434.132C492.803 432.535 476.84 431.737 461.672 431.737H308.383C277.246 431.737 248.903 427.745 223.355 419.761C197.804 411.778 175.848 400.601 157.484 386.228C139.12 371.059 124.751 353.095 114.372 332.337C104.791 311.578 100 288.425 100 262.875C100 231.737 107.584 205.789 122.755 185.032C137.924 164.272 157.484 147.904 181.436 135.929C205.388 123.155 231.736 113.973 260.479 108.384C290.019 102.796 318.763 100 346.706 100H700V191.018L308.383 193.413C301.198 194.211 290.819 195.808 277.246 198.206C263.672 199.802 250.099 202.996 236.527 207.786C223.752 212.576 212.176 219.761 201.796 229.342C192.216 238.123 187.424 250.101 187.424 265.27Z" style={{ fill: colors.page }} />
      </g>
    </svg>
  );
}

const themeT = stylex.create({
  root: { display: 'inline-flex', padding: 2, gap: 2, borderRadius: 999, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  btn: {
    width: { default: 28, '@media (pointer: coarse)': 36 },
    height: { default: 24, '@media (pointer: coarse)': 32 },
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: { default: colors.textSubtle, ':hover': colors.text },
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
  },
  on: { backgroundColor: colors.thumb, color: colors.text, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
});
/** Sun / moon pill like a physical switch. */
export function ThemeToggle() {
  const { mode, setMode } = useSfera();
  return (
    <div role="radiogroup" aria-label="Colour mode" {...stylex.props(themeT.root)}>
      <button type="button" role="radio" aria-checked={mode === 'light'} aria-label="Light" onClick={() => setMode('light')} {...stylex.props(themeT.btn, mode === 'light' && themeT.on)}>
        <Sun size={14} />
      </button>
      <button type="button" role="radio" aria-checked={mode === 'dark'} aria-label="Dark" onClick={() => setMode('dark')} {...stylex.props(themeT.btn, mode === 'dark' && themeT.on)}>
        <Moon size={14} />
      </button>
    </div>
  );
}

export function AccentPicker({ size = 18 }: { size?: number }) {
  const { accent, setAccent } = useSfera();
  return (
    <div role="radiogroup" aria-label="Accent colour" {...stylex.props(ly.swatches)}>
      {(Object.keys(accentSwatches) as AccentName[]).map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={accent === a}
          aria-label={a}
          title={a}
          onClick={() => setAccent(a)}
          {...stylex.props(ly.swatch, accent === a && ly.swatchOn)}
          style={{ backgroundColor: accentSwatches[a], color: accentSwatches[a], width: size, height: size }}
        />
      ))}
    </div>
  );
}

const sectionDefs = [
  { id: 'docs', label: 'Docs', icon: BookOpen },
  { id: 'components', label: 'Components', icon: Blocks },
  { id: 'screens', label: 'Screens', icon: MonitorSmartphone },
  { id: 'themes', label: 'Themes', icon: Palette },
] as const;

function Sidebar({ route }: { route: Route }) {
  const [q, setQ] = useState('');
  const all = useMemo(
    () => [
      ...docPages.map((p) => ({ section: 'docs' as const, page: p.id, label: p.label, group: p.group })),
      { section: 'themes' as const, page: '', label: 'Themes', group: 'Themes' },
      { section: 'components' as const, page: '', label: 'All components', group: 'Library' },
      ...groups.flatMap((g) => components.filter((c) => c.group === g).map((c) => ({ section: 'components' as const, page: c.slug, label: c.name, group: g }))),
      { section: 'screens' as const, page: '', label: 'All screens', group: 'Screens' },
      ...screens.map((s) => ({ section: 'screens' as const, page: s.id, label: s.title, group: s.product })),
    ],
    [],
  );
  const list = q.trim() ? all.filter((p) => (p.label + ' ' + p.group).toLowerCase().includes(q.toLowerCase())) : all.filter((p) => p.section === route.section);
  const grouped = list.reduce<Record<string, typeof list>>((acc, p) => ((acc[p.group] ??= []).push(p), acc), {});
  const activeId = `${route.section}/${route.page}`;
  return (
    <>
      <div {...stylex.props(ly.brand)}>
        <a href="#docs-overview" {...stylex.props(ly.logo)} aria-label="Sfera UI home">
          <SferaLogo size={28} />
        </a>
        <ThemeToggle />
      </div>
      <div {...stylex.props(ly.sideScroll)}>
        <nav aria-label="Sections" {...stylex.props(ly.sections)}>
          {sectionDefs.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={route.section === s.id ? 'page' : undefined} {...stylex.props(ly.secBtn, route.section === s.id && ly.secOn)} onClick={() => setQ('')}>
              <s.icon size={15} />
              {s.label}
            </a>
          ))}
        </nav>
        <div {...stylex.props(ly.search)}>
          <SearchInput value={q} onValueChange={setQ} placeholder="Search docs" size="sm" end={<Kbd keys={['/']} />} aria-label="Search docs" />
        </div>
        {Object.entries(grouped).map(([g, items]) => (
          <SideNavSection key={g} title={g}>
            {items.map((p) => (
              <SideNavItem
                key={p.section + p.page}
                soft
                item={{ id: `${p.section}/${p.page}`, label: p.label }}
                active={activeId}
                onSelect={() => {
                  go({ section: p.section, page: p.page });
                  setQ('');
                }}
              />
            ))}
          </SideNavSection>
        ))}
        {!list.length && <p {...stylex.props(ly.empty)}>No pages match “{q}”.</p>}
      </div>
      <div {...stylex.props(ly.foot)}>
        <AccentPicker />
      </div>
    </>
  );
}

function Shell({ children, route }: { children: ReactNode; route: Route }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route.section, route.page]);
  // centre dialogs over the content column: offset them by the sidebar's width (0 when it is hidden)
  const sideRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sideRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--sfera-overlay-offset', `${el.offsetWidth}px`);
    const ro = new ResizeObserver(set);
    ro.observe(el);
    set();
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--sfera-overlay-offset');
    };
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target as HTMLElement).closest('input,textarea')) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('aside input[type=search]')?.focus();
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  return (
    <div {...stylex.props(ly.root)}>
      <aside ref={sideRef} {...stylex.props(ly.side)} aria-label="Documentation">
        <Sidebar route={route} />
      </aside>
      <div {...stylex.props(ly.main)}>
        <div {...stylex.props(ly.mobileBar)}>
          <IconButton label="Open navigation" icon={<Menu size={18} />} onClick={() => setOpen(true)} />
          <a href="#docs-overview" aria-label="Sfera UI home" {...stylex.props(ly.logo)}>
            <SferaLogo size={24} />
          </a>
          <span style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </span>
        </div>
        <div id="docs-main" {...stylex.props(ly.content)}>
          {children}
        </div>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} side="left">
        <div style={{ margin: '-16px -20px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <Sidebar route={route} />
        </div>
      </Drawer>
    </div>
  );
}

function Router() {
  const route = useRoute();
  const { mode } = useSfera();
  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#0E0E10' : '#FFFFFF';
  }, [mode]);
  useEffect(() => {
    const titles: Record<string, string> = { docs: 'Docs', components: 'Components', screens: 'Screens', themes: 'Themes' };
    document.title = `${route.page ? route.page.replace(/-/g, ' ') + ' · ' : ''}${titles[route.section]} · Sfera UI`;
  }, [route]);
  if (route.section === 'screens' && route.page) return <ScreenView id={route.page} />;
  let page: ReactNode;
  if (route.section === 'components') page = route.page ? <ComponentPage slug={route.page} /> : <ComponentsIndex />;
  else if (route.section === 'screens') page = <ScreensIndex />;
  else if (route.section === 'themes') page = <Pages id="themes" />;
  else page = <Pages id={route.page} />;
  return (
    <Shell route={route}>
      <div key={route.section + route.page}>{page}</div>
    </Shell>
  );
}

export function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('sfera-mode') as 'light' | 'dark' | null;
      if (saved) return saved;
    } catch {
      /* storage blocked */
    }
    const host = document.documentElement.getAttribute('data-theme');
    if (host === 'dark' || host === 'light') return host;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [accent, setAccent] = useState<AccentName>(() => {
    try {
      return (localStorage.getItem('sfera-accent') as AccentName) || 'blue';
    } catch {
      return 'blue';
    }
  });
  const save = (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  };
  return (
    <SferaProvider
      mode={mode}
      accent={accent}
      onModeChange={(m) => (setMode(m), save('sfera-mode', m))}
      onAccentChange={(a) => (setAccent(a), save('sfera-accent', a))}
    >
      <Router />
    </SferaProvider>
  );
}
