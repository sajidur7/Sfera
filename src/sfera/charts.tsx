import * as stylex from '@stylexjs/stylex';
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { accent, colors, font, motion, radius } from './tokens.stylex';
import { fx } from './shared';

// #region DateStepper
const ds = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    height: { default: 30, '@media (pointer: coarse)': 36 },
    borderRadius: radius.control,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { default: 28, '@media (pointer: coarse)': 36 },
    height: '100%',
    borderWidth: 0,
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    color: colors.textMuted,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.35 },
    borderRadius: 9,
  },
  label: { paddingInline: 4, fontSize: font.sm, fontWeight: 500, color: colors.text, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', minWidth: 104, textAlign: 'center' },
});
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
/** ‹ 29 Jun – 5 Jul › — steps a date range by `days`. */
export function DateStepper({
  start: startProp,
  defaultStart = new Date(2026, 5, 29),
  days = 7,
  onChange,
  max,
}: {
  start?: Date;
  defaultStart?: Date;
  days?: number;
  onChange?: (start: Date, end: Date) => void;
  max?: Date;
}) {
  const [inner, setInner] = useState(defaultStart);
  const start = startProp ?? inner;
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  const step = (dir: 1 | -1) => {
    const s = new Date(start);
    s.setDate(s.getDate() + dir * days);
    const e = new Date(s);
    e.setDate(e.getDate() + days - 1);
    setInner(s);
    onChange?.(s, e);
  };
  const atMax = !!max && end >= max;
  return (
    <div role="group" aria-label="Date range" {...stylex.props(ds.root)}>
      <button type="button" aria-label="Previous range" onClick={() => step(-1)} {...stylex.props(ds.btn, fx.focus)}>
        <ChevronLeft size={15} />
      </button>
      <span aria-live="polite" {...stylex.props(ds.label)}>
        {fmt(start)} – {fmt(end)}
      </span>
      <button type="button" aria-label="Next range" disabled={atMax} onClick={() => step(1)} {...stylex.props(ds.btn, fx.focus)}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
// #endregion

// #region BarChart
const bcs = stylex.create({
  root: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, width: '100%', minWidth: 0, flexGrow: 1 },
  bars: { display: 'flex', alignItems: 'stretch', gap: { default: 8, '@media (max-width: 480px)': 5 }, width: '100%', flexGrow: 1, touchAction: 'pan-y' },
  col: { flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' },
  track: { position: 'relative', flexGrow: 1, borderRadius: 10, backgroundColor: colors.track, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: 10, transitionProperty: 'height, background-color', transitionDuration: motion.slow, transitionTimingFunction: motion.ease },
  accent: { backgroundColor: `color-mix(in oklab, ${accent.base} 72%, ${colors.surface})` },
  accentHi: { backgroundColor: accent.base },
  label: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  labelOn: { color: colors.text, fontWeight: 500 },
  hit: { position: 'absolute', inset: 0, borderWidth: 0, backgroundColor: 'transparent', cursor: 'pointer', padding: 0 },
  minH: (h: string) => ({ minHeight: h }),
  h: (h: string) => ({ height: h }),
});
export type BarDatum = { label: string; value: number };
/**
 * Soft bars inside grey tracks. Grows to fill its card. Hover, tap, slide a
 * finger or focus a bar to see a card with the value and how it compares.
 */
export function BarChart({ data, height = 180, max, highlight, format = (n: number) => n.toLocaleString('en-US'), label }: { data: BarDatum[]; height?: number; max?: number; highlight?: number; format?: (n: number) => string; label?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const m = max ?? Math.max(1, ...data.map((d) => d.value));
  const avg = data.reduce((a, d) => a + d.value, 0) / Math.max(1, data.length);
  const total = data.reduce((a, d) => a + d.value, 0);
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.max(0, Math.min(data.length - 1, Math.floor(((e.clientX - r.left) / r.width) * data.length))));
  };
  const cur = hover !== null ? data[hover] : null;
  const vsAvg = cur ? Math.round(((cur.value - avg) / (avg || 1)) * 100) : 0;
  return (
    <figure role="group" aria-label={label} {...stylex.props(bcs.root)} style={{ margin: 0 }} onPointerLeave={() => setHover(null)}>
      <div {...stylex.props(bcs.bars, bcs.minH(`${height}px`))} onPointerMove={pick} onPointerDown={pick}>
        {data.map((d, i) => (
          <div key={d.label + i} {...stylex.props(bcs.col)}>
            <div {...stylex.props(bcs.track)}>
              <div {...stylex.props(bcs.bar, i === highlight || i === hover ? bcs.accentHi : bcs.accent, bcs.h(`${(d.value / m) * 100}%`))} />
              <button
                type="button"
                data-chart-target
                aria-label={`${d.label}: ${format(d.value)}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                {...stylex.props(bcs.hit, fx.focus)}
              />
            </div>
            <span aria-hidden {...stylex.props(bcs.label, i === hover && bcs.labelOn)}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
      {cur && hover !== null && (
        <ChartCard x={(hover + 0.5) / data.length} title={cur.label}>
          <ChartRow color={accent.base} name="Value" value={format(cur.value)} />
          <span {...stylex.props(cc.note)}>
            <span {...stylex.props(vsAvg >= 0 ? cc.up : cc.down)}>
              {vsAvg >= 0 ? '+' : '−'}
              {Math.abs(vsAvg)}%
            </span>{' '}
            vs average · {Math.round((cur.value / (total || 1)) * 100)}% of total
          </span>
        </ChartCard>
      )}
    </figure>
  );
}
// #endregion

// #region ChartCard
const cc = stylex.create({
  card: {
    position: 'absolute',
    top: 4,
    zIndex: 4,
    minWidth: 160,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '10px 12px',
    borderRadius: 14,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.25)',
    pointerEvents: 'none',
    fontSize: font.sm,
  },
  head: { color: colors.textMuted, fontSize: font.xs, whiteSpace: 'nowrap' },
  row: { display: 'flex', alignItems: 'center', gap: 8, color: colors.text, whiteSpace: 'nowrap' },
  sw: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  num: { marginLeft: 'auto', paddingLeft: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  note: { paddingTop: 6, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border, fontSize: font.xs, color: colors.textMuted },
  up: { color: `color-mix(in oklab, ${colors.success} 78%, ${colors.text})`, fontWeight: 500 },
  down: { color: `color-mix(in oklab, ${colors.danger} 80%, ${colors.text})`, fontWeight: 500 },
});
/** Floating info card used by every chart. `x` (0–1) is the point's position; the card stays inside its chart. */
export function ChartCard({ x, y = 4, title, children }: { x: number; y?: number; title: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent) return;
    const w = parent.offsetWidth;
    const tw = el.offsetWidth;
    const px = x * w;
    const want = px + 14 + tw <= w ? px + 14 : px - 14 - tw;
    el.style.left = `${Math.max(0, Math.min(w - tw, want))}px`;
  });
  return (
    <div ref={ref} role="status" aria-live="polite" {...stylex.props(cc.card)} style={{ top: y }}>
      <span {...stylex.props(cc.head)}>{title}</span>
      {children}
    </div>
  );
}
export function ChartRow({ color, name, value }: { color: string; name: ReactNode; value: ReactNode }) {
  return (
    <span {...stylex.props(cc.row)}>
      <span {...stylex.props(cc.sw)} style={{ backgroundColor: color }} />
      {name}
      <span {...stylex.props(cc.num)}>{value}</span>
    </span>
  );
}
// #endregion

// #region RingScore
const rs = stylex.create({
  root: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  svg: { transform: 'rotate(-90deg)' },
  seg: { transitionProperty: 'stroke-dasharray', transitionDuration: motion.slow, transitionTimingFunction: motion.ease },
  center: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 },
  value: { fontWeight: 500, letterSpacing: '-0.04em', color: colors.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  caption: { fontSize: font.xs, color: colors.textMuted },
});
export type RingSegment = { value: number; color?: string; label?: string };
/**
 * Ring / donut score with a big number in the middle.
 * Pass one value (0–max) for a progress ring, or several segments: they split the whole ring
 * by their share, with a 2px gap between each.
 */
export function RingScore({
  value,
  max = 100,
  segments,
  size = 132,
  thickness = 12,
  caption,
  center,
}: {
  value: number;
  max?: number;
  segments?: RingSegment[];
  size?: number;
  thickness?: number;
  caption?: ReactNode;
  center?: ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  // Several segments share the whole ring with flat ends and a 2px gap between each,
  // so every gap is the same small slit. A single value is a progress ring with round ends.
  const multi = !!segments && segments.length > 1;
  const GAP = multi ? 2 : 0;
  const segs = segments ?? [{ value }];
  const total = multi ? segs.reduce((a, s) => a + s.value, 0) || 1 : max;
  let off = 0;
  return (
    <div role="img" aria-label={`Score ${value} of ${max}`} {...stylex.props(rs.root)} style={{ width: size, height: size }}>
      <svg width={size} height={size} {...stylex.props(rs.svg)}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: colors.track }} strokeWidth={thickness} />
        {segs.map((s, i) => {
          const len = Math.max(0.01, (s.value / total) * c - GAP);
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              style={{ stroke: s.color ?? accent.base }}
              strokeWidth={thickness}
              strokeLinecap={multi ? 'butt' : 'round'}
              strokeDasharray={`${len} ${c}`}
              strokeDashoffset={-(off + GAP / 2)}
              {...stylex.props(rs.seg)}
            />
          );
          off += (s.value / total) * c;
          return el;
        })}
      </svg>
      <div {...stylex.props(rs.center)}>
        <span {...stylex.props(rs.value)} style={{ fontSize: size * 0.26 }}>
          {center ?? value}
        </span>
        {caption && <span {...stylex.props(rs.caption)}>{caption}</span>}
      </div>
    </div>
  );
}
// #endregion

// #region Heatmap
const hm = stylex.create({
  root: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, width: '100%', minWidth: 0 },
  frame: { display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', columnGap: 6, rowGap: 4, borderRadius: 8, outlineStyle: { default: 'none', ':focus-visible': 'solid' }, outlineWidth: 2, outlineOffset: 4, outlineColor: accent.base, touchAction: 'pan-y' },
  months: { display: 'grid', fontSize: font.xs, color: colors.textSubtle, minHeight: 16 },
  month: { whiteSpace: 'nowrap', overflow: 'visible' },
  days: { display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 3, fontSize: font.xs, color: colors.textSubtle, alignItems: 'center' },
  grid: { display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, 1fr)', gap: 3, width: '100%' },
  cell: { aspectRatio: '1', borderRadius: { default: 4, '@media (max-width: 480px)': 3 }, minWidth: 0, cursor: 'pointer', transitionProperty: 'transform, box-shadow', transitionDuration: motion.fast, transitionTimingFunction: motion.ease },
  on: { transform: 'scale(1.18)', boxShadow: `0 0 0 2px ${colors.surface}, 0 0 0 3.5px ${colors.text}` },
  l0: { backgroundColor: colors.track },
  l1: { backgroundColor: `color-mix(in oklab, ${accent.base} 22%, ${colors.track})` },
  l2: { backgroundColor: `color-mix(in oklab, ${accent.base} 45%, ${colors.track})` },
  l3: { backgroundColor: `color-mix(in oklab, ${accent.base} 70%, ${colors.track})` },
  l4: { backgroundColor: accent.base },
  legend: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: font.xs, color: colors.textMuted },
  scale: { display: 'flex', alignItems: 'center', gap: 4 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  cols: (n: string) => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }),
});
const levels = ['l0', 'l1', 'l2', 'l3', 'l4'] as const;
const levelName = ['No activity', 'Light', 'Moderate', 'Busy', 'Peak'];
const levelColor = [colors.track, `color-mix(in oklab, ${accent.base} 22%, ${colors.track})`, `color-mix(in oklab, ${accent.base} 45%, ${colors.track})`, `color-mix(in oklab, ${accent.base} 70%, ${colors.track})`, accent.base];
/**
 * Activity calendar: columns are weeks, rows are Monday–Sunday, levels 0–4.
 * Month and day labels give it context; hover, tap or use the arrow keys to
 * see the date, the value and how the day ranks. Shows fewer weeks on narrow screens.
 */
export function Heatmap({
  values,
  label = 'Activity',
  unit = 'events',
  end = new Date(2026, 10, 15),
  amountOf = (level: number, i: number) => [0, 2, 5, 9, 14][level] + (level ? (i * 7) % 3 : 0),
  format,
}: {
  values: number[];
  label?: string;
  unit?: string;
  /** Date of the last cell (a Sunday). */
  end?: Date;
  /** Real value behind a level, for the hover card. */
  amountOf?: (level: number, index: number) => number;
  format?: (n: number) => string;
}) {
  // Units like "M tokens" or "k visitors" attach to the number (3M tokens); words get a space (3 events).
  const fmt = format ?? ((n: number) => (/^[kKMB%]/.test(unit) ? `${n.toLocaleString('en-US')}${unit}` : `${n.toLocaleString('en-US')} ${unit}`));
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(600);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const allWeeks = Math.ceil(values.length / 7);
  // Keep cells at least ~11px: drop the oldest weeks on narrow screens.
  const weeks = Math.max(4, Math.min(allWeeks, Math.floor((width - 36) / 14)));
  const shown = values.slice((allWeeks - weeks) * 7);
  const offset = (allWeeks - weeks) * 7;
  const firstDay = new Date(end);
  firstDay.setDate(end.getDate() - (allWeeks * 7 - 1) + offset);
  const dateOf = (i: number) => {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    return d;
  };
  const months: { col: number; name: string }[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = dateOf(w * 7);
    const prev = w ? dateOf((w - 1) * 7) : null;
    const last = months[months.length - 1];
    if ((!prev || prev.getMonth() !== d.getMonth()) && (!last || w - last.col >= 3)) months.push({ col: w, name: d.toLocaleDateString('en-GB', { month: 'short' }) });
  }
  const amounts = shown.map((l, i) => amountOf(Math.max(0, Math.min(4, l)), i + offset));
  const sorted = [...amounts].sort((a, b) => a - b);
  const rank = (v: number) => Math.round((sorted.filter((x) => x < v).length / Math.max(1, sorted.length - 1)) * 100);
  const col = hover !== null ? Math.floor(hover / 7) : 0;
  const id = useId();
  return (
    <figure aria-labelledby={id} {...stylex.props(hm.root)} style={{ margin: 0 }} ref={ref} onPointerLeave={() => setHover(null)}>
      <span id={id} hidden>
        {label}
      </span>
      <div
        tabIndex={0}
        aria-label={`${label}, last ${weeks} weeks. Use the arrow keys to read each day.`}
        {...stylex.props(hm.frame)}
        onFocus={() => setHover((h) => h ?? shown.length - 1)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          const step: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
          if (step[e.key]) (e.preventDefault(), setHover((h) => Math.max(0, Math.min(shown.length - 1, (h ?? shown.length - 1) + step[e.key]))));
          if (e.key === 'Escape') setHover(null);
        }}
      >
        <span />
        <div {...stylex.props(hm.months, hm.cols(String(weeks)))} aria-hidden>
          {months.map((m) => (
            <span key={m.col} {...stylex.props(hm.month)} style={{ gridColumn: `${m.col + 1} / span 3`, gridRow: 1 }}>
              {m.name}
            </span>
          ))}
        </div>
        <div {...stylex.props(hm.days)} aria-hidden>
          {['Mon', '', 'Wed', '', 'Fri', '', ''].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div {...stylex.props(hm.grid, hm.cols(String(weeks)))}>
          {shown.map((v, i) => (
            <span
              key={i}
              aria-hidden
              data-chart-target
              onPointerEnter={() => setHover(i)}
              onPointerDown={() => setHover(i)}
              {...stylex.props(hm.cell, hm[levels[Math.max(0, Math.min(4, v))]], hover === i && hm.on)}
            />
          ))}
        </div>
      </div>
      <div {...stylex.props(hm.legend)} aria-hidden>
        <span>Last {weeks} weeks</span>
        <span {...stylex.props(hm.scale)}>
          Less
          {levels.map((l) => (
            <span key={l} {...stylex.props(hm.swatch, hm[l])} />
          ))}
          More
        </span>
      </div>
      {hover !== null && (
        <ChartCard x={(36 + ((col + 0.5) / weeks) * (width - 36)) / width} y={22 + ((hover % 7) + 1) * ((width - 36) / weeks)} title={dateOf(hover).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}>
          <ChartRow color={levelColor[Math.max(0, Math.min(4, shown[hover]))]} name={levelName[Math.max(0, Math.min(4, shown[hover]))]} value={fmt(amounts[hover])} />
          <span {...stylex.props(cc.note)}>{amounts[hover] === 0 ? 'Nothing recorded this day' : `Busier than ${rank(amounts[hover])}% of days shown`}</span>
        </ChartCard>
      )}
    </figure>
  );
}
// #endregion

// #region LineChart
const tipIn = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(2px)' }, to: { opacity: 1, transform: 'none' } });
const lc = stylex.create({
  root: { width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 },
  plot: { position: 'relative', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 8, outlineStyle: { default: 'none', ':focus-visible': 'solid' }, outlineWidth: 2, outlineOffset: 4, outlineColor: accent.base, touchAction: 'pan-y' },
  svg: { width: '100%', overflow: 'visible', display: 'block', flexGrow: 1 },
  axis: { display: 'flex', justifyContent: 'space-between', fontSize: font.xs, color: colors.textSubtle, fontVariantNumeric: 'tabular-nums' },
  legend: { display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: font.xs, color: colors.textMuted },
  key: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 3, borderRadius: 2 },
  dot: { position: 'absolute', width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: 999, borderWidth: 2, borderStyle: 'solid', backgroundColor: colors.surface, pointerEvents: 'none', transitionProperty: 'left, top', transitionDuration: '120ms', transitionTimingFunction: motion.ease },
  tip: {
    position: 'absolute',
    top: 4,
    zIndex: 3,
    minWidth: 170,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '10px 12px',
    borderRadius: 14,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.25)',
    pointerEvents: 'none',
    fontSize: font.sm,
    animationName: tipIn,
    animationDuration: '160ms',
    animationTimingFunction: motion.ease,
  },
  tipHead: { color: colors.textMuted, fontSize: font.xs },
  tipRow: { display: 'flex', alignItems: 'center', gap: 8, color: colors.text },
  tipNum: { marginLeft: 'auto', paddingLeft: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  tipDiff: { paddingTop: 6, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border, fontSize: font.xs, color: colors.textMuted },
  up: { color: `color-mix(in oklab, ${colors.success} 78%, ${colors.text})` },
  down: { color: `color-mix(in oklab, ${colors.danger} 80%, ${colors.text})` },
  tipSwatch: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
});
export type Series = { name: string; values: number[]; color?: string; dashed?: boolean };
/**
 * Thin line chart with hairline gridlines. Hover, tap or use the arrow keys to
 * show a card with the point's values; with two series it also shows the change.
 */
export function LineChart({ series, labels, height = 160, label, format = (n: number) => n.toLocaleString('en-US') }: { series: Series[]; labels?: string[]; height?: number; label?: string; format?: (n: number) => string }) {
  const W = 600;
  const H = height;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(1, ...all) * 1.1;
  const n = Math.max(...series.map((s) => s.values.length));
  const x = (i: number) => (i / Math.max(1, n - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const pct = (i: number) => (i / Math.max(1, n - 1)) * 100;
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
  };
  const name = (i: number) => labels?.[i] ?? `Point ${i + 1}`;
  // Keep the card inside the plot: right of the point when there is room, else left, clamped to the edges.
  useLayoutEffect(() => {
    const plot = plotRef.current;
    const tip = tipRef.current;
    if (!plot || !tip || hover === null) return;
    const w = plot.offsetWidth;
    const tw = tip.offsetWidth;
    const px = (pct(hover) / 100) * w;
    const want = px + 14 + tw <= w ? px + 14 : px - 14 - tw;
    tip.style.left = `${Math.max(0, Math.min(w - tw, want))}px`;
  });
  const [a, b] = series;
  const diff = hover !== null && a && b ? (a.values[hover] ?? 0) - (b.values[hover] ?? 0) : null;
  const diffPct = diff !== null && b && b.values[hover!] ? Math.round((diff / b.values[hover!]) * 1000) / 10 : null;
  return (
    <figure role="group" aria-label={label} {...stylex.props(lc.root)} style={{ margin: 0 }}>
      {series.length > 1 && (
        <div {...stylex.props(lc.legend)}>
          {series.map((s) => (
            <span key={s.name} {...stylex.props(lc.key)}>
              <span {...stylex.props(lc.swatch)} style={{ backgroundColor: s.color ?? accent.base }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div
        ref={plotRef}
        tabIndex={0}
        style={{ minHeight: H }}
        aria-label={`${label ?? 'Chart'}. Use the arrow keys to read values.`}
        {...stylex.props(lc.plot)}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover((h) => h ?? n - 1)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') (e.preventDefault(), setHover((h) => Math.min(n - 1, (h ?? -1) + 1)));
          if (e.key === 'ArrowLeft') (e.preventDefault(), setHover((h) => Math.max(0, (h ?? n) - 1)));
          if (e.key === 'Escape') setHover(null);
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" {...stylex.props(lc.svg)} style={{ minHeight: H }} aria-hidden>
          {[0.25, 0.5, 0.75, 1].map((g) => (
            <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} style={{ stroke: colors.border }} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={g === 1 ? undefined : '3 4'} />
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} style={{ stroke: colors.borderStrong }} strokeWidth={1} vectorEffect="non-scaling-stroke" />}
          {series.map((s) => (
            <polyline
              key={s.name}
              fill="none"
              style={{ stroke: s.color ?? accent.base }}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? '4 5' : undefined}
              vectorEffect="non-scaling-stroke"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            />
          ))}
        </svg>
        {hover !== null &&
          series.map((s) =>
            s.values[hover] === undefined ? null : (
              <span key={s.name} aria-hidden {...stylex.props(lc.dot)} style={{ left: `${pct(hover)}%`, top: `${(y(s.values[hover]) / H) * 100}%`, borderColor: s.color ?? accent.base }} />
            ),
          )}
        {hover !== null && (
          <div ref={tipRef} role="status" aria-live="polite" {...stylex.props(lc.tip)}>
            <span {...stylex.props(lc.tipHead)}>{name(hover)}</span>
            {series.map((s) => (
              <span key={s.name} {...stylex.props(lc.tipRow)}>
                <span {...stylex.props(lc.tipSwatch)} style={{ backgroundColor: s.color ?? accent.base }} />
                {s.name}
                <span {...stylex.props(lc.tipNum)}>{s.values[hover] === undefined ? '—' : format(s.values[hover])}</span>
              </span>
            ))}
            {diff !== null && (
              <span {...stylex.props(lc.tipDiff)}>
                <span {...stylex.props(diff >= 0 ? lc.up : lc.down)}>
                  {diff >= 0 ? '+' : '−'}
                  {format(Math.abs(diff))}
                  {diffPct !== null ? ` (${diff >= 0 ? '+' : '−'}${Math.abs(diffPct)}%)` : ''}
                </span>{' '}
                vs {b.name.toLowerCase()}
              </span>
            )}
          </div>
        )}
      </div>
      {labels && (
        <div {...stylex.props(lc.axis)} aria-hidden>
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </figure>
  );
}
// #endregion

// #region Meter
const mt = stylex.create({
  root: { display: 'flex', gap: 3, alignItems: 'flex-end', height: 14 },
  bar: { width: 4, borderRadius: 2, backgroundColor: colors.track },
  on: { backgroundColor: accent.base },
  h: (h: string) => ({ height: h }),
});
/** Tiny signal meter (e.g. confidence). */
export function Meter({ level, of = 4, label }: { level: number; of?: number; label?: string }) {
  return (
    <span role="meter" aria-valuenow={level} aria-valuemin={0} aria-valuemax={of} aria-label={label} {...stylex.props(mt.root)}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} {...stylex.props(mt.bar, i < level && mt.on, mt.h(`${6 + (i * 8) / Math.max(1, of - 1)}px`))} />
      ))}
    </span>
  );
}
// #endregion

// #region GanttChart
export type GanttTask = { id: string; label: string; start: number; end: number; tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger'; owner?: string; progress?: number };
const gt = stylex.create({
  root: { display: 'grid', gridTemplateColumns: { default: '200px minmax(0, 1fr)', '@media (max-width: 640px)': '120px minmax(0, 1fr)' }, minWidth: 0, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.surface },
  labels: { borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: colors.border },
  head: { height: 36, display: 'flex', alignItems: 'center', paddingInline: 12, fontSize: font.xs, color: colors.textMuted, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, backgroundColor: colors.well },
  label: { height: 40, display: 'flex', alignItems: 'center', paddingInline: 12, fontSize: font.sm, color: colors.text, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  scroll: { overflowX: 'auto', minWidth: 0 },
  grid: { position: 'relative' },
  cols: { display: 'grid', height: 36, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, backgroundColor: colors.well },
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: font.mono, color: colors.textMuted, borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: colors.border },
  row: { position: 'relative', height: 40, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  bar: { position: 'absolute', top: 9, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', paddingInline: 8, fontSize: 11, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', color: colors.text },
  accent: { backgroundColor: `color-mix(in oklab, ${accent.base} 22%, ${colors.surface})`, boxShadow: `inset 3px 0 0 ${accent.base}` },
  neutral: { backgroundColor: colors.track, boxShadow: `inset 3px 0 0 ${colors.neutral}` },
  success: { backgroundColor: `color-mix(in oklab, ${colors.success} 22%, ${colors.surface})`, boxShadow: `inset 3px 0 0 ${colors.success}` },
  warning: { backgroundColor: `color-mix(in oklab, ${colors.warning} 26%, ${colors.surface})`, boxShadow: `inset 3px 0 0 ${colors.warning}` },
  danger: { backgroundColor: `color-mix(in oklab, ${colors.danger} 20%, ${colors.surface})`, boxShadow: `inset 3px 0 0 ${colors.danger}` },
  today: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: accent.base, zIndex: 1 },
});
/** Timeline of tasks across columns (days or weeks). Scrolls sideways inside itself. */
export function GanttChart({ tasks, columns, today, colWidth = 56 }: { tasks: GanttTask[]; columns: string[]; today?: number; colWidth?: number }) {
  const W = columns.length * colWidth;
  return (
    <div {...stylex.props(gt.root)}>
      <div {...stylex.props(gt.labels)}>
        <div {...stylex.props(gt.head)}>Task</div>
        {tasks.map((t) => (
          <div key={t.id} {...stylex.props(gt.label)} title={t.label}>
            {t.label}
          </div>
        ))}
      </div>
      <div {...stylex.props(gt.scroll)} tabIndex={0} role="region" aria-label="Timeline">
        <div {...stylex.props(gt.grid)} style={{ width: W }}>
          <div {...stylex.props(gt.cols)} style={{ gridTemplateColumns: `repeat(${columns.length}, ${colWidth}px)` }}>
            {columns.map((c) => (
              <span key={c} {...stylex.props(gt.colHead)}>
                {c}
              </span>
            ))}
          </div>
          {tasks.map((t) => (
            <div key={t.id} {...stylex.props(gt.row)}>
              <div {...stylex.props(gt.bar, gt[t.tone ?? 'accent'])} style={{ left: t.start * colWidth + 4, width: Math.max(colWidth - 8, (t.end - t.start) * colWidth - 8) }} title={`${t.label}${t.owner ? ' · ' + t.owner : ''}`}>
                {t.owner ?? ''}
                {t.progress !== undefined ? ` · ${t.progress}%` : ''}
              </div>
            </div>
          ))}
          {today !== undefined && <span aria-label="Today" {...stylex.props(gt.today)} style={{ left: today * colWidth }} />}
        </div>
      </div>
    </div>
  );
}
// #endregion
