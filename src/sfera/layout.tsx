import * as stylex from '@stylexjs/stylex';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { accent, colors, font, motion, radius, shadows, space } from './tokens.stylex';
import { useControllable } from './hooks';

// #region Well
const wl = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 8,
    minWidth: 0,
    backgroundColor: colors.well,
    borderRadius: radius.well,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space.s2, minHeight: 36, padding: '4px 8px 2px 10px', flexWrap: 'wrap' },
  titles: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  title: { margin: 0, fontSize: font.md, fontWeight: 500, color: colors.text, letterSpacing: '-0.01em' },
  sub: { margin: 0, fontSize: font.xs, color: colors.textMuted },
  actions: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  fill: { height: '100%' },
});
/**
 * The signature container: a soft grey well (24px radius, 8px padding) that
 * holds white inner cards. Use it to group related things, not everywhere.
 */
export function Well({ title, subtitle, actions, children, fill }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; fill?: boolean }) {
  return (
    <section data-sfera="well" {...stylex.props(wl.root, fill && wl.fill)}>
      {(title || actions) && (
        <header {...stylex.props(wl.head)}>
          <div {...stylex.props(wl.titles)}>
            {title && <h3 {...stylex.props(wl.title)}>{title}</h3>}
            {subtitle && <p {...stylex.props(wl.sub)}>{subtitle}</p>}
          </div>
          {actions && <div {...stylex.props(wl.actions)}>{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
// #endregion

// #region Card
const cr = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  inWell: { borderColor: colors.wellEdge },
  pad: { padding: 16 },
  padSm: { padding: 12 },
  padNone: { padding: 0, overflow: 'hidden' },
  grow: { flexGrow: 1 },
  interactive: {
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
    transitionProperty: 'border-color, transform, box-shadow',
    transitionDuration: '200ms',
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    transform: { default: null, ':active': 'scale(0.99)' },
  },
});
export function Card({
  children,
  padding = 'md',
  grow,
  as: Tag = 'div',
  onClick,
}: {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md';
  grow?: boolean;
  as?: 'div' | 'article' | 'li';
  onClick?: () => void;
}) {
  const pad = padding === 'none' ? cr.padNone : padding === 'sm' ? cr.padSm : cr.pad;
  if (onClick)
    return (
      <button type="button" data-sfera="card" onClick={onClick} {...stylex.props(cr.root, pad, grow && cr.grow, cr.interactive)}>
        {children}
      </button>
    );
  return (
    <Tag data-sfera="card" {...stylex.props(cr.root, pad, grow && cr.grow)}>
      {children}
    </Tag>
  );
}
// #endregion

// #region CardHeader
const ch = stylex.create({
  root: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.s3, flexWrap: 'wrap', marginBottom: 12 },
  titles: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  eyebrow: { fontSize: font.sm, color: colors.textMuted },
  title: { margin: 0, fontSize: font.md, fontWeight: 500, color: colors.text },
  big: { margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: '-0.03em', color: colors.text, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' },
  unit: { fontSize: font.sm, color: colors.textMuted, letterSpacing: 0, marginLeft: 4, fontWeight: 400 },
  sub: { margin: 0, fontSize: font.sm, color: colors.textMuted },
  actions: { display: 'flex', alignItems: 'center', gap: 6 },
});
/** Card header: eyebrow label, a big value or title, and actions on the right. */
export function CardHeader({ eyebrow, title, value, unit, subtitle, actions }: { eyebrow?: ReactNode; title?: ReactNode; value?: ReactNode; unit?: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div {...stylex.props(ch.root)}>
      <div {...stylex.props(ch.titles)}>
        {eyebrow && <span {...stylex.props(ch.eyebrow)}>{eyebrow}</span>}
        {title && <h3 {...stylex.props(ch.title)}>{title}</h3>}
        {value !== undefined && (
          <p {...stylex.props(ch.big)}>
            {value}
            {unit && <span {...stylex.props(ch.unit)}>{unit}</span>}
          </p>
        )}
        {subtitle && <p {...stylex.props(ch.sub)}>{subtitle}</p>}
      </div>
      {actions && <div {...stylex.props(ch.actions)}>{actions}</div>}
    </div>
  );
}
// #endregion

// #region Stack
const st = stylex.create({
  root: { display: 'flex', minWidth: 0 },
  row: { flexDirection: 'row' },
  col: { flexDirection: 'column' },
  wrap: { flexWrap: 'wrap' },
  grow: { flexGrow: 1 },
  gap: (g: string) => ({ gap: g }),
  align: (a: string) => ({ alignItems: a }),
  justify: (j: string) => ({ justifyContent: j }),
});
type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
const gapPx = (g: Gap) => `${g * 4}px`;
export type StackProps = {
  children: ReactNode;
  gap?: Gap;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  grow?: boolean;
};
const al = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' };
const js = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' };
export function HStack({ children, gap = 2, align = 'center', justify = 'start', wrap, grow }: StackProps) {
  return <div {...stylex.props(st.root, st.row, st.gap(gapPx(gap)), st.align(al[align]), st.justify(js[justify]), wrap && st.wrap, grow && st.grow)}>{children}</div>;
}
export function VStack({ children, gap = 2, align = 'stretch', justify = 'start', grow }: StackProps) {
  return <div {...stylex.props(st.root, st.col, st.gap(gapPx(gap)), st.align(al[align]), st.justify(js[justify]), grow && st.grow)}>{children}</div>;
}
// #endregion

// #region Grid
const gr = stylex.create({
  root: { display: 'grid', minWidth: 0, alignItems: 'stretch' },
  cols: (min: string) => ({ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}, 100%), 1fr))` }),
  fixed: (n: string) => ({ gridTemplateColumns: { default: `repeat(${n}, minmax(0, 1fr))`, '@media (max-width: 900px)': 'repeat(2, minmax(0, 1fr))', '@media (max-width: 560px)': 'minmax(0, 1fr)' } }),
  gap: (g: string) => ({ gap: g }),
});
/** Responsive grid. `min` = auto-fit tracks; `columns` = fixed count that steps down on small screens. Rows stretch so cards share a height. */
export function Grid({ children, min, columns, gap = 2 }: { children: ReactNode; min?: number; columns?: number; gap?: Gap }) {
  return <div {...stylex.props(gr.root, columns ? gr.fixed(String(columns)) : gr.cols(`${min ?? 240}px`), gr.gap(gapPx(gap)))}>{children}</div>;
}
const gi = stylex.create({
  span: (n: string) => ({ gridColumn: { default: `span ${n}`, '@media (max-width: 560px)': 'span 1' } }),
  full: { gridColumn: '1 / -1' },
});
/** A Grid child that spans several columns (falls back to one column on phones). */
export function GridItem({ span = 1, full, children }: { span?: number; full?: boolean; children: ReactNode }) {
  return <div {...stylex.props(full ? gi.full : gi.span(String(span)))} style={{ minWidth: 0 }}>{children}</div>;
}
// #endregion

// #region PageHeader
const ph = stylex.create({
  root: { display: 'flex', alignItems: { default: 'flex-end', '@media (max-width: 640px)': 'flex-start' }, justifyContent: 'space-between', gap: space.s4, flexWrap: 'wrap' },
  titles: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  title: { margin: 0, fontSize: { default: 30, '@media (max-width: 640px)': 24 }, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.15, color: colors.text },
  sub: { margin: 0, fontSize: font.md, color: colors.textMuted, lineHeight: 1.5 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
});
export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <header {...stylex.props(ph.root)}>
      <div {...stylex.props(ph.titles)}>
        {eyebrow}
        <h1 {...stylex.props(ph.title)}>{title}</h1>
        {subtitle && <p {...stylex.props(ph.sub)}>{subtitle}</p>}
      </div>
      {actions && <div {...stylex.props(ph.actions)}>{actions}</div>}
    </header>
  );
}
// #endregion

// #region Center
const cn = stylex.create({ root: { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }, h: (h: string) => ({ minHeight: h }) });
export function Center({ children, minHeight = 0 }: { children: ReactNode; minHeight?: number | string }) {
  return <div {...stylex.props(cn.root, cn.h(typeof minHeight === 'number' ? `${minHeight}px` : minHeight))}>{children}</div>;
}
// #endregion

// #region Section
const sc = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 },
  head: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  title: { margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: colors.text },
  sub: { margin: '2px 0 0', fontSize: font.sm, color: colors.textMuted },
});
/** A titled block of a page. Lighter than a Well: no fill, just a header row. */
export function Section({ title, subtitle, actions, children, id }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-t` : undefined} {...stylex.props(sc.root)}>
      <div {...stylex.props(sc.head)}>
        <div>
          <h2 id={id ? `${id}-t` : undefined} {...stylex.props(sc.title)}>{title}</h2>
          {subtitle && <p {...stylex.props(sc.sub)}>{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
// #endregion

// #region FormLayout
const fl = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 0 },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(180px, 280px) minmax(0, 1fr)', '@media (max-width: 720px)': 'minmax(0, 1fr)' },
    gap: { default: 32, '@media (max-width: 720px)': 12 },
    paddingBlock: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  last: { borderBottomWidth: 0 },
  title: { margin: 0, fontSize: font.md, fontWeight: 500, color: colors.text },
  desc: { margin: '4px 0 0', fontSize: font.sm, lineHeight: 1.5, color: colors.textMuted },
  body: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
});
/** Settings-style form: a label column on the left, fields on the right. Stacks on phones. */
export function FormLayout({ sections }: { sections: { title: ReactNode; description?: ReactNode; content: ReactNode }[] }) {
  return (
    <div {...stylex.props(fl.root)}>
      {sections.map((s, i) => (
        <div key={i} {...stylex.props(fl.row, i === sections.length - 1 && fl.last)}>
          <div>
            <h3 {...stylex.props(fl.title)}>{s.title}</h3>
            {s.description && <p {...stylex.props(fl.desc)}>{s.description}</p>}
          </div>
          <div {...stylex.props(fl.body)}>{s.content}</div>
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region Collapsible
const co = stylex.create({
  root: { borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    minHeight: 48,
    padding: '10px 4px',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colors.text,
    fontSize: font.md,
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 8,
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: accent.base,
  },
  label: { flexGrow: 1, minWidth: 0 },
  chev: { color: colors.textMuted, transitionProperty: 'transform', transitionDuration: motion.base, transitionTimingFunction: motion.ease, flexShrink: 0 },
  chevOpen: { transform: 'rotate(180deg)' },
  panel: { display: 'grid', gridTemplateRows: '0fr', transitionProperty: 'grid-template-rows', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  panelOpen: { gridTemplateRows: '1fr' },
  inner: { overflow: 'hidden', minHeight: 0 },
  content: { padding: '0 4px 16px', fontSize: font.md, lineHeight: 1.6, color: colors.textMuted },
});
/** Show/hide a block. The height animates with the system curve. */
export function Collapsible({ title, children, open: openProp, defaultOpen = false, onOpenChange }: { title: ReactNode; children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void }) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const id = useId();
  return (
    <div {...stylex.props(co.root)}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} {...stylex.props(co.trigger)}>
        <span {...stylex.props(co.label)}>{title}</span>
        <ChevronDown size={16} {...stylex.props(co.chev, open && co.chevOpen)} />
      </button>
      <div id={id} role="region" {...stylex.props(co.panel, open && co.panelOpen)}>
        <div {...stylex.props(co.inner)} inert={!open}>
          <div {...stylex.props(co.content)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
/** Accordion: a set of Collapsibles. `single` keeps only one open. */
export function CollapsibleGroup({ items, single = true, defaultOpen }: { items: { id: string; title: ReactNode; content: ReactNode }[]; single?: boolean; defaultOpen?: string[] }) {
  const [open, setOpen] = useState<string[]>(defaultOpen ?? []);
  return (
    <div>
      {items.map((it) => (
        <Collapsible
          key={it.id}
          title={it.title}
          open={open.includes(it.id)}
          onOpenChange={(o) => setOpen(o ? (single ? [it.id] : [...open, it.id]) : open.filter((x) => x !== it.id))}
        >
          {it.content}
        </Collapsible>
      ))}
    </div>
  );
}
// #endregion

// #region ScrollableArea
const sa = stylex.create({
  root: {
    overflow: 'auto',
    minWidth: 0,
    scrollbarWidth: 'thin',
    scrollbarColor: `${colors.borderStrong} transparent`,
    borderRadius: radius.card,
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: accent.base,
  },
  h: (h: string) => ({ maxHeight: h }),
});
/** Scroll container with thin scrollbars; focusable so keyboard users can scroll it. */
export function ScrollableArea({ maxHeight = 240, children, label }: { maxHeight?: number | string; children: ReactNode; label: string }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} {...stylex.props(sa.root, sa.h(typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight))}>
      {children}
    </div>
  );
}
// #endregion

// #region Resizable
const rz = stylex.create({
  root: { display: 'flex', width: '100%', minWidth: 0, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.surface },
  pane: { minWidth: 0, overflow: 'auto' },
  handle: {
    position: 'relative',
    flexShrink: 0,
    width: { default: 9, '@media (pointer: coarse)': 32 },
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    touchAction: 'none',
    '::before': { content: '""', position: 'absolute', top: 0, bottom: 0, left: 4, width: 1, backgroundColor: colors.border },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: accent.base,
  },
  grip: { position: 'absolute', top: '50%', left: 1, width: 7, height: 28, marginTop: -14, borderRadius: 4, backgroundColor: { default: colors.borderStrong, ':hover': accent.base } },
  w: (w: string) => ({ flexBasis: w, flexShrink: 0 }),
});
/** Two panes with a draggable divider. Arrow keys resize by 5%. */
export function Resizable({ start, end, defaultSize = 40, min = 20, max = 80, label = 'Resize panels' }: { start: ReactNode; end: ReactNode; defaultSize?: number; min?: number; max?: number; label?: string }) {
  const [size, setSize] = useState(defaultSize);
  const root = useRef<HTMLDivElement>(null);
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div ref={root} {...stylex.props(rz.root)}>
      <div {...stylex.props(rz.pane, rz.w(`${size}%`))}>{start}</div>
      <button
        type="button"
        role="separator"
        aria-orientation="vertical"
        aria-label={label}
        aria-valuenow={Math.round(size)}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={(e) => (e.target as HTMLElement).setPointerCapture(e.pointerId)}
        onPointerMove={(e) => {
          if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
          const r = root.current!.getBoundingClientRect();
          setSize(clamp(((e.clientX - r.left) / r.width) * 100));
        }}
        onKeyDown={(e) => (e.key === 'ArrowLeft' ? setSize((s) => clamp(s - 5)) : e.key === 'ArrowRight' ? setSize((s) => clamp(s + 5)) : null)}
        {...stylex.props(rz.handle)}
      >
        <span {...stylex.props(rz.grip)} />
      </button>
      <div {...stylex.props(rz.pane)} style={{ flex: 1 }}>
        {end}
      </div>
    </div>
  );
}
// #endregion

// #region SelectableCard
const sel = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
    padding: 14,
    textAlign: 'left',
    font: 'inherit',
    color: colors.text,
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    cursor: 'pointer',
    transitionProperty: 'border-color, box-shadow, transform, background-color',
    transitionDuration: motion.fast,
    transform: { default: null, ':active': 'scale(0.99)' },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineOffset: 2,
    outlineColor: accent.base,
  },
  on: { borderColor: accent.base, boxShadow: `0 0 0 1px ${accent.base}`, backgroundColor: { default: `color-mix(in oklab, ${accent.base} 5%, ${colors.surface})`, ':hover': `color-mix(in oklab, ${accent.base} 8%, ${colors.surface})` } },
  mark: { width: 18, height: 18, flexShrink: 0, marginTop: 1, borderRadius: '50%', borderWidth: 1, borderStyle: 'solid', borderColor: colors.borderStrong, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: accent.onAccent, transitionProperty: 'background-color', transitionDuration: motion.fast },
  markOn: { backgroundColor: accent.base, borderColor: accent.base },
  text: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flexGrow: 1 },
  title: { fontWeight: 500, fontSize: font.md },
  desc: { fontSize: font.sm, color: colors.textMuted, lineHeight: 1.45 },
  aside: { flexShrink: 0, fontSize: font.sm, fontWeight: 500 },
});
/** A card that acts as a radio or checkbox option (plans, templates). */
export function SelectableCard({ selected, onSelect, title, description, aside, icon, multiple }: { selected: boolean; onSelect: () => void; title: ReactNode; description?: ReactNode; aside?: ReactNode; icon?: ReactNode; multiple?: boolean }) {
  return (
    <button type="button" role={multiple ? 'checkbox' : 'radio'} aria-checked={selected} onClick={onSelect} {...stylex.props(sel.root, selected && sel.on)}>
      {icon}
      <span {...stylex.props(sel.text)}>
        <span {...stylex.props(sel.title)}>{title}</span>
        {description && <span {...stylex.props(sel.desc)}>{description}</span>}
      </span>
      {aside && <span {...stylex.props(sel.aside)}>{aside}</span>}
      <span aria-hidden {...stylex.props(sel.mark, selected && sel.markOn)}>
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
    </button>
  );
}
// #endregion
