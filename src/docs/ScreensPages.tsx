import * as stylex from '@stylexjs/stylex';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { colors, font, motion, accent } from '../sfera/tokens.stylex';
import * as O from '../sfera';
import { screens } from '../screens';
import { ScreenNav } from '../screens/kit';
import { doc } from './ComponentPage';

const si = stylex.create({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 10 },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 6,
    textDecoration: 'none',
    color: colors.text,
    backgroundColor: colors.well,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.wellEdge, ':hover': colors.borderStrong },
    transitionProperty: 'border-color, transform',
    transitionDuration: motion.base,
    transform: { default: null, ':active': 'scale(0.985)' },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineOffset: 2,
    outlineColor: accent.base,
  },
  thumb: { position: 'relative', height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.page, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  scaled: { position: 'absolute', top: 0, left: 0, width: 1280, height: 800, transformOrigin: 'top left', pointerEvents: 'none' },
  meta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 10px 8px' },
  prod: { fontFamily: font.mono, fontSize: 11, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.05em' },
  name: { fontSize: font.md, fontWeight: 500 },
  desc: { fontSize: font.xs, color: colors.textMuted, lineHeight: 1.45 },
});

/** Scales a live render of the screen into the tile so it is a real preview. */
function Thumb({ id }: { id: string }) {
  const [w, setW] = useState(300);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    // Render the live preview only once the tile is near the viewport.
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setSeen(true), { rootMargin: '400px' });
    io.observe(el);
    return () => (ro.disconnect(), io.disconnect());
  }, [el]);
  const sc = screens.find((s) => s.id === id)!;
  return (
    <div ref={setEl} {...stylex.props(si.thumb)} aria-hidden>
      <div {...stylex.props(si.scaled)} style={{ transform: `scale(${w / 1280})` }} inert>
        {seen && <ScreenNav.Provider value={{ open: () => {}, params: {}, exit: () => {} }}>{sc.render()}</ScreenNav.Provider>}
      </div>
    </div>
  );
}

export function ScreensIndex() {
  const products = [...new Set(screens.map((s) => s.product))];
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Screens</p>
        <h1 {...stylex.props(doc.h1)}>App screens</h1>
        <p {...stylex.props(doc.lead)}>
          {screens.length} screens across {products.length} fictional products, built only from Sfera components. Inside a screen, sidebar items open their screen if it exists; otherwise you get a “coming soon” toast and stay put.
        </p>
      </header>
      {products.map((p) => (
        <section key={p} style={{ marginTop: 32 }}>
          <O.HStack gap={2}>
            <O.Heading level={2} size="h3">{p}</O.Heading>
            <O.Badge>{screens.filter((s) => s.product === p).length}</O.Badge>
          </O.HStack>
          <div {...stylex.props(si.grid)} style={{ marginTop: 12 }}>
            {screens.filter((s) => s.product === p).map((s) => (
              <a key={s.id} href={`#screens-${s.id}`} {...stylex.props(si.tile)}>
                <Thumb id={s.id} />
                <div {...stylex.props(si.meta)}>
                  <O.VStack gap={1}>
                    <span {...stylex.props(si.name)}>{s.title}</span>
                    <span {...stylex.props(si.desc)}>{s.description}</span>
                  </O.VStack>
                  <ArrowRight size={16} />
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ScreenView({ id }: { id: string }) {
  const [params, setParams] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('sfera-screen-params') || '{}');
    } catch {
      return {};
    }
  });
  const sc = screens.find((s) => s.id === id);
  if (!sc)
    return (
      <div style={{ padding: 24 }}>
        <O.EmptyState title="Screen not found" actions={<O.Button onClick={() => (location.hash = '#screens')}>All screens</O.Button>} />
      </div>
    );
  return (
    <ScreenNav.Provider
      value={{
        params,
        open: (next, p = {}) => {
          setParams(p);
          try {
            sessionStorage.setItem('sfera-screen-params', JSON.stringify(p));
          } catch {
            /* ignore */
          }
          location.hash = `#screens-${next}`;
        },
        exit: () => (location.hash = '#screens'),
      }}
    >
      <div key={id}>{sc.render()}</div>
    </ScreenNav.Provider>
  );
}
