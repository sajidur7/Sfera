import * as stylex from '@stylexjs/stylex';
import { cloneElement, isValidElement, useId, useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, GripVertical, Plus, X } from 'lucide-react';
import { accent, colors, font, motion } from './tokens.stylex';
import { fx } from './shared';
import { Button, IconButton, SegmentedControl } from './action';
import { InfoTip } from './overlay';
import { Select } from './forms';

/** Categorical colours for multi-series stats. Mid-tone so they read on light and dark. */
export const seriesColors = { teal: '#3FA7C2', blue: '#4C7DF0', violet: '#8B5CF6', pink: '#E0457B', green: '#3DBE78', amber: '#E8A33D', slate: '#8A94A6' } as const;

// #region DeltaPill
const dp = stylex.create({
  root: { display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, paddingInline: '4px 8px', borderRadius: 999, fontSize: font.sm, fontWeight: 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  plain: { paddingInline: 8 },
  up: { backgroundColor: `color-mix(in oklab, ${colors.success} 16%, transparent)`, color: `color-mix(in oklab, ${colors.success} 72%, ${colors.text})` },
  down: { backgroundColor: `color-mix(in oklab, ${colors.danger} 14%, transparent)`, color: `color-mix(in oklab, ${colors.danger} 78%, ${colors.text})` },
  dot: { width: 16, height: 16, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colors.surface },
  dotUp: { backgroundColor: `color-mix(in oklab, ${colors.success} 72%, ${colors.text})` },
  dotDown: { backgroundColor: `color-mix(in oklab, ${colors.danger} 78%, ${colors.text})` },
});
/** Change vs a previous period. `good` flips colour meaning (e.g. refunds going down is good). */
export function DeltaPill({ value, suffix = '%', good, variant = 'dot' }: { value: number; suffix?: string; good?: 'up' | 'down'; variant?: 'dot' | 'arrow' }) {
  const up = value >= 0;
  const positive = good === 'down' ? !up : up;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(value)}${suffix}`} {...stylex.props(dp.root, positive ? dp.up : dp.down, variant === 'arrow' && dp.plain)}>
      {variant === 'dot' ? (
        <span aria-hidden {...stylex.props(dp.dot, positive ? dp.dotUp : dp.dotDown)}>
          <Arrow size={11} strokeWidth={3} />
        </span>
      ) : (
        <Arrow size={13} strokeWidth={2.4} aria-hidden />
      )}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}
// #endregion

// #region StatTile
const st = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 6, padding: 6, borderRadius: 22, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, minWidth: 0 },
  head: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, padding: '2px 6px 0 8px' },
  icon: { width: 24, height: 24, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { flexGrow: 1, minWidth: 0, fontSize: font.sm, fontWeight: 500, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  card: { display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px 12px', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, minWidth: 0 },
  value: { fontSize: { default: 30, '@media (max-width: 640px)': 26 }, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.05, color: colors.text, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' },
  foot: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, minHeight: 24 },
  change: { display: 'flex', alignItems: 'center', gap: 6, fontSize: font.sm, color: colors.textMuted, minWidth: 0, flexWrap: 'wrap' },
  num: { fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  up: { color: `color-mix(in oklab, ${colors.success} 78%, ${colors.text})` },
  down: { color: `color-mix(in oklab, ${colors.danger} 80%, ${colors.text})` },
  spark: { width: 72, flexShrink: 0, height: 32, display: 'flex', alignItems: 'flex-end' },
});
/**
 * KPI tile. The label and a tinted icon sit on the grey well; the white card
 * holds the value, the change in words ("+16% vs October") and a tiny trend.
 */
export function StatTile({ icon, color = seriesColors.blue, label, value, delta, good, foot = 'vs last month', info, trend }: { icon: ReactNode; color?: string; label: string; value: ReactNode; delta: number; good?: 'up' | 'down'; foot?: ReactNode; info?: ReactNode; trend?: number[] }) {
  const up = delta >= 0;
  const positive = good === 'down' ? !up : up;
  const Arrow = up ? ArrowUp : ArrowDown;
  const series = trend ?? Array.from({ length: 10 }, (_, i) => 5 + Math.round(Math.sin(i * 0.9 + label.length) * 2 + (up ? i : 10 - i) * 0.6));
  return (
    <section aria-label={label} {...stylex.props(st.root)} style={{ ['--sfera-kpi' as string]: color }}>
      <div {...stylex.props(st.head)}>
        <span aria-hidden {...stylex.props(st.icon)} style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
          {isValidElement(icon) ? cloneElement(icon as ReactElement<{ size?: number }>, { size: 14 }) : icon}
        </span>
        <span {...stylex.props(st.label)}>{label}</span>
        {info && <InfoTip label={`About ${label}`}>{info}</InfoTip>}
      </div>
      <div {...stylex.props(st.card)}>
        <span {...stylex.props(st.value)}>{value}</span>
        <div {...stylex.props(st.foot)}>
          <span {...stylex.props(st.change)}>
            <span {...stylex.props(st.num, positive ? st.up : st.down)} aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(delta)} percent`}>
              <Arrow size={12} strokeWidth={2.6} style={{ display: 'inline', verticalAlign: '-1px' }} /> {Math.abs(delta)}%
            </span>
            {foot}
          </span>
          <span {...stylex.props(st.spark)}>
            <SparkBars values={series} />
          </span>
        </div>
      </div>
    </section>
  );
}
// #endregion

// #region KpiStrip
const KPI = 'var(--sfera-kpi, #4C7DF0)';
const ks = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(4, minmax(0, 1fr))', '@media (max-width: 1100px)': 'repeat(2, minmax(0, 1fr))', '@media (max-width: 600px)': 'minmax(0, 1fr)' },
    padding: 6,
    gap: 6,
    backgroundColor: colors.well,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
    borderRadius: 22,
  },
  cell: { display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', minWidth: 0, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  head: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 },
  icon: { width: 24, height: 24, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: KPI, backgroundColor: `color-mix(in oklab, ${KPI} 16%, transparent)` },
  label: { fontSize: font.sm, fontWeight: 500, color: colors.textMuted, minWidth: 0, flexGrow: 1 },
  period: { fontSize: font.xs, color: colors.textMuted, paddingInline: 8, height: 22, display: 'inline-flex', alignItems: 'center', borderRadius: 999, backgroundColor: colors.well, whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' },
  valueRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  value: { fontSize: { default: 30, '@media (max-width: 600px)': 26 }, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.05, color: colors.text, fontVariantNumeric: 'tabular-nums' },
  viz: { height: 32, display: 'flex', alignItems: 'center', minWidth: 0 },
  note: { fontSize: font.sm, color: colors.textMuted, minWidth: 0, lineHeight: 1.45 },
  strong: { color: colors.text, fontWeight: 500 },
});
export type Kpi = { icon?: ReactNode; label: string; period?: string; value: ReactNode; delta?: number; good?: 'up' | 'down'; viz?: ReactNode; note?: ReactNode; color?: string };
const kpiPalette = [seriesColors.blue, seriesColors.green, seriesColors.violet, seriesColors.amber, seriesColors.teal, seriesColors.pink];
/**
 * A well of KPI cards. Each card has its own colour (icon + mini chart), a
 * sentence-case label, a period pill, value + change, a tiny chart and a note.
 */
export function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div {...stylex.props(ks.root)}>
      {items.map((k, i) => (
        <section key={k.label} aria-label={k.label} {...stylex.props(ks.cell)} style={{ ['--sfera-kpi' as string]: k.color ?? kpiPalette[i % kpiPalette.length] }}>
          <div {...stylex.props(ks.head)}>
            {k.icon && <span aria-hidden {...stylex.props(ks.icon)}>{isValidElement(k.icon) ? cloneElement(k.icon as ReactElement<{ size?: number }>, { size: 14 }) : k.icon}</span>}
            <span {...stylex.props(ks.label)}>{k.label}</span>
            {k.period && <span {...stylex.props(ks.period)} title={k.period}>{k.period}</span>}
          </div>
          <div {...stylex.props(ks.valueRow)}>
            <span {...stylex.props(ks.value)}>{k.value}</span>
            {k.delta !== undefined && <DeltaPill value={k.delta} good={k.good} variant="arrow" />}
          </div>
          {k.viz && <div {...stylex.props(ks.viz)}>{k.viz}</div>}
          {k.note && <div {...stylex.props(ks.note)}>{k.note}</div>}
        </section>
      ))}
    </div>
  );
}
/** Emphasised part of a KPI note. */
export function KpiStrong({ children }: { children: ReactNode }) {
  return <span {...stylex.props(ks.strong)}>{children}</span>;
}
// #endregion

// #region MiniViz
// Mini charts take the KPI colour (--sfera-kpi) and fall back to the accent outside a KpiStrip.
const MV = `var(--sfera-kpi, ${accent.base})`;
const mv = stylex.create({
  quota: { display: 'flex', gap: 3, width: '100%', height: 30, alignItems: 'stretch' },
  tick: { flex: '1 1 0', borderRadius: 3, backgroundColor: colors.track, minWidth: 2 },
  tickOn: { backgroundColor: MV },
  spark: { display: 'flex', gap: 3, width: '100%', height: 32, alignItems: 'flex-end' },
  sbar: { flex: '1 1 0', borderRadius: 2, backgroundColor: `color-mix(in oklab, ${MV} 35%, ${colors.track})`, minWidth: 2 },
  sbarHi: { backgroundColor: MV },
  waffle: { display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(4, 1fr)', gap: 2, width: '100%', height: 32 },
  sq: { borderRadius: 2, backgroundColor: colors.track },
  sqOn: { backgroundColor: MV },
  range: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', fontSize: 12, color: colors.textSubtle, fontVariantNumeric: 'tabular-nums' },
  track: { position: 'relative', flexGrow: 1, height: 14, borderRadius: 4, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, display: 'flex', justifyContent: 'space-between', paddingInline: 4, alignItems: 'center' },
  rtick: { width: 1, height: 8, backgroundColor: colors.borderStrong },
  now: { position: 'absolute', top: '50%', width: 16, height: 16, marginTop: -8, marginLeft: -8, borderRadius: 999, backgroundColor: MV, boxShadow: `0 0 0 4px color-mix(in oklab, ${MV} 20%, transparent)` },
  prev: { position: 'absolute', top: '50%', width: 14, height: 14, marginTop: -7, marginLeft: -7, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 2, borderStyle: 'solid', borderColor: colors.textMuted },
});
/** Filled ticks showing progress toward a quota. */
export function QuotaBar({ value, max, ticks = 30 }: { value: number; max: number; ticks?: number }) {
  const on = Math.round((value / max) * ticks);
  return (
    <div role="meter" aria-valuenow={value} aria-valuemax={max} aria-label={`${Math.round((value / max) * 100)}% of quota`} {...stylex.props(mv.quota)}>
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} {...stylex.props(mv.tick, i < on && mv.tickOn)} />
      ))}
    </div>
  );
}
/** Tiny bar sparkline; the highest bar is emphasised. */
export function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div aria-hidden {...stylex.props(mv.spark)}>
      {values.map((v, i) => (
        <span key={i} {...stylex.props(mv.sbar, v === max && mv.sbarHi)} style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}
/** Square grid: `filled` of `total` squares are dark (e.g. 112 won of 329). */
export function WaffleGrid({ filled, total, cells = 120 }: { filled: number; total: number; cells?: number }) {
  const on = Math.round((filled / total) * cells);
  return (
    <div role="img" aria-label={`${filled} of ${total}`} {...stylex.props(mv.waffle)}>
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} {...stylex.props(mv.sq, i < on && mv.sqOn)} />
      ))}
    </div>
  );
}
/** Position on a range: filled dot = now, ring = previous period. */
export function RangeMarker({ min, max, value, previous, unit = 'd' }: { min: number; max: number; value: number; previous?: number; unit?: string }) {
  const at = (n: number) => `${((n - min) / (max - min)) * 100}%`;
  return (
    <div {...stylex.props(mv.range)} role="img" aria-label={`${value}${unit}, previously ${previous}${unit}, on a ${min}–${max}${unit} range`}>
      <span>
        {min}
        {unit}
      </span>
      <span {...stylex.props(mv.track)}>
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} {...stylex.props(mv.rtick)} />
        ))}
        {previous !== undefined && <span {...stylex.props(mv.prev)} style={{ left: at(previous) }} />}
        <span {...stylex.props(mv.now)} style={{ left: at(value) }} />
      </span>
      <span>
        {max}
        {unit}
      </span>
    </div>
  );
}
// #endregion

// #region UsageMeter
const um = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 14, padding: 20, borderRadius: 24, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, minWidth: 0 },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 17, fontWeight: 500, color: colors.text },
  value: { fontSize: 40, fontWeight: 500, letterSpacing: '-0.04em', color: colors.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  of: { fontSize: font.lg, color: colors.textMuted, letterSpacing: 0, marginLeft: 6, fontWeight: 400 },
  bar: { display: 'flex', gap: 4, height: 44, width: '100%' },
  seg: { borderRadius: 8, minWidth: 4, transitionProperty: 'opacity, flex-grow', transitionDuration: motion.base, transitionTimingFunction: motion.ease, flexShrink: 0 },
  rest: { flexGrow: 1, borderRadius: 8, backgroundColor: colors.track, minWidth: 0 },
  dim: { opacity: 0.25 },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, paddingInline: 12, borderRadius: 999, borderWidth: 0, backgroundColor: { default: colors.surface, ':hover': colors.hover }, color: colors.text, fontSize: font.md, cursor: 'pointer' },
  chipOn: { boxShadow: `inset 0 0 0 1px ${colors.borderStrong}` },
  sw: { width: 10, height: 10, borderRadius: 3 },
  val: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted },
});
export type UsageSegment = { label: string; value: number; color: string };
/** Stacked usage bar (e.g. context window). Legend chips focus one segment. */
export function UsageMeter({ title, segments, total, format = (n: number) => `${(n / 1000).toFixed(1)}K`, action }: { title: string; segments: UsageSegment[]; total: number; format?: (n: number) => string; action?: ReactNode }) {
  const [focus, setFocus] = useState<string | null>(null);
  const used = segments.reduce((a, s) => a + s.value, 0);
  return (
    <section aria-label={title} {...stylex.props(um.root)}>
      <div {...stylex.props(um.head)}>
        <span {...stylex.props(um.title)}>{title}</span>
        {action}
      </div>
      <div {...stylex.props(um.value)}>
        {format(used)}
        <span {...stylex.props(um.of)}>of {format(total)}</span>
      </div>
      <div role="img" aria-label={segments.map((s) => `${s.label} ${format(s.value)}`).join(', ')} {...stylex.props(um.bar)}>
        {segments.map((s) => (
          <span key={s.label} title={`${s.label}: ${format(s.value)}`} {...stylex.props(um.seg, focus !== null && focus !== s.label && um.dim)} style={{ backgroundColor: s.color, flexBasis: `${(s.value / total) * 100}%` }} />
        ))}
        <span {...stylex.props(um.rest)} />
      </div>
      <div {...stylex.props(um.legend)}>
        {segments.map((s) => (
          <button key={s.label} type="button" aria-pressed={focus === s.label} onClick={() => setFocus(focus === s.label ? null : s.label)} {...stylex.props(um.chip, focus === s.label && um.chipOn, fx.focus)}>
            <span {...stylex.props(um.sw)} style={{ backgroundColor: s.color }} />
            {s.label}
            {focus === s.label && <span {...stylex.props(um.val)}>{format(s.value)}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
// #endregion

// #region StackedBarChart
export type StackSeries = { key: string; label: string; color: string };
export type StackDatum = { label: string; values: Record<string, number> };
const sb = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', minWidth: 0, position: 'relative', flexGrow: 1 },
  plot: { position: 'relative', display: 'flex', alignItems: 'stretch', flexGrow: 1, touchAction: 'pan-y', gap: { default: 6, '@media (max-width: 480px)': 3 }, width: '100%' },
  col: { position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', borderWidth: 0, padding: '3px 2px', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: 10, transitionProperty: 'opacity', transitionDuration: motion.fast },
  colOn: { boxShadow: `inset 0 0 0 1.5px ${colors.borderStrong}` },
  up: { display: 'flex', flexDirection: 'column-reverse', justifyContent: 'flex-start', gap: 3, flexGrow: 1 },
  down: { display: 'flex', flexDirection: 'column', gap: 3 },
  seg: { width: '100%', borderRadius: 4, transitionProperty: 'opacity', transitionDuration: motion.fast },
  dim: { opacity: 0.38 },
  axis: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.borderStrong, pointerEvents: 'none' },
  labels: { display: 'flex', justifyContent: 'space-between', fontSize: font.sm, color: colors.textSubtle },
  tip: { position: 'absolute', zIndex: 3, minWidth: 180, padding: '10px 12px', borderRadius: 14, backgroundColor: colors.raised, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.25)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: font.sm },
  tipHead: { display: 'flex', justifyContent: 'space-between', gap: 16, color: colors.textMuted },
  tipRow: { display: 'flex', alignItems: 'center', gap: 8, color: colors.text },
  tipNum: { marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' },
  sw: { width: 10, height: 10, borderRadius: 3 },
});
/**
 * Stacked bars with an optional negative series drawn below the axis.
 * Hover or focus a column to see the breakdown; other columns dim.
 */
export function StackedBarChart({ data, series, negative, height = 220, label }: { data: StackDatum[]; series: StackSeries[]; negative?: StackSeries; height?: number; label: string }) {
  const [hi, setHi] = useState<number | null>(null);
  const up = (d: StackDatum) => series.reduce((a, s) => a + (d.values[s.key] ?? 0), 0);
  const maxUp = Math.max(...data.map(up));
  const maxDown = negative ? Math.max(...data.map((d) => d.values[negative.key] ?? 0)) : 0;
  // Sized in percentages so the chart can grow to fill a stretched card.
  const ratio = negative ? 0.78 : 1;
  const pctUp = (n: number) => `${(n / maxUp) * 92}%`;
  const pctDown = (n: number) => `${maxDown ? (n / maxDown) * 80 : 0}%`;
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setHi(Math.max(0, Math.min(data.length - 1, Math.floor(((e.clientX - r.left) / r.width) * data.length))));
  };
  const cur = hi !== null ? data[hi] : null;
  return (
    <figure role="group" aria-label={label} {...stylex.props(sb.root)} style={{ margin: 0 }} onPointerLeave={() => setHi(null)}>
      <div {...stylex.props(sb.plot)} style={{ minHeight: height }} onPointerMove={pick} onPointerDown={pick}>
        <span aria-hidden {...stylex.props(sb.axis)} style={{ top: `${ratio * 100}%` }} />
        {data.map((d, i) => (
          <button
            key={d.label + i}
            type="button"
            aria-label={`${d.label}: ${series.map((s) => `${s.label} ${d.values[s.key] ?? 0}`).join(', ')}${negative ? `, ${negative.label} ${d.values[negative.key] ?? 0}` : ''}`}
            data-chart-target
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHi(i)}
            onFocus={() => setHi(i)}
            onBlur={() => setHi(null)}
            {...stylex.props(sb.col, hi === i && sb.colOn, fx.focus)}
          >
            <span {...stylex.props(sb.up)} style={{ height: `${ratio * 100}%`, flexGrow: 0 }}>
              {series.map((s) => (
                <span key={s.key} {...stylex.props(sb.seg, hi !== null && hi !== i && sb.dim)} style={{ height: pctUp(d.values[s.key] ?? 0), backgroundColor: s.color }} />
              ))}
            </span>
            {negative && (
              <span {...stylex.props(sb.down)} style={{ height: `${(1 - ratio) * 100}%`, paddingTop: 4 }}>
                <span {...stylex.props(sb.seg, hi !== null && hi !== i && sb.dim)} style={{ height: pctDown(d.values[negative.key] ?? 0), backgroundColor: negative.color }} />
              </span>
            )}
          </button>
        ))}
        {cur && hi !== null && (
          <div {...stylex.props(sb.tip)} style={{ top: 8, left: hi < data.length / 2 ? `calc(${((hi + 1) / data.length) * 100}% + 6px)` : undefined, right: hi >= data.length / 2 ? `calc(${((data.length - hi) / data.length) * 100}% + 6px)` : undefined }}>
            <div {...stylex.props(sb.tipHead)}>
              <span>{cur.label}</span>
              <span style={{ color: 'inherit', fontVariantNumeric: 'tabular-nums' }}>{up(cur).toLocaleString('en-US')}</span>
            </div>
            {[...series].reverse().slice(0, 4).map((s) => (
              <div key={s.key} {...stylex.props(sb.tipRow)}>
                <span {...stylex.props(sb.sw)} style={{ backgroundColor: s.color }} />
                {s.label}
                <span {...stylex.props(sb.tipNum)}>{(cur.values[s.key] ?? 0).toLocaleString('en-US')}</span>
              </div>
            ))}
            {negative && (
              <div {...stylex.props(sb.tipRow)}>
                <span {...stylex.props(sb.sw)} style={{ backgroundColor: negative.color }} />
                {negative.label}
                <span {...stylex.props(sb.tipNum)}>{(cur.values[negative.key] ?? 0).toLocaleString('en-US')}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div {...stylex.props(sb.labels)} aria-hidden>
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </figure>
  );
}
// #endregion

// #region TrendCard
const tc = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 6, padding: 20, borderRadius: 24, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, minWidth: 0 },
  value: { fontSize: { default: 44, '@media (max-width: 480px)': 34 }, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.05, color: colors.text, fontVariantNumeric: 'tabular-nums' },
  cents: { color: colors.textSubtle },
  delta: { fontSize: font.md, fontVariantNumeric: 'tabular-nums' },
  up: { color: `color-mix(in oklab, ${colors.success} 80%, ${colors.text})` },
  down: { color: `color-mix(in oklab, ${colors.danger} 80%, ${colors.text})` },
  when: { color: colors.textSubtle, marginLeft: 6 },
  // the plot grows with the card, so a stretched card never leaves a gap under the line
  plot: { flexGrow: 1, minHeight: 120, marginBlock: '14px 10px', position: 'relative' },
  svg: { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', overflow: 'visible' },
});
/** Smooth path through the points (Catmull-Rom → cubic Bézier). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}
/** Big value with faded decimals, change line, a smooth trend with an endpoint ring, and a range switcher. */
export function TrendCard({ ranges, label = 'Balance', prefix = '$', period = 'today' }: { ranges: Record<string, number[]>; label?: string; prefix?: string; period?: string }) {
  const keys = Object.keys(ranges);
  const [r, setR] = useState(keys[keys.length - 1]);
  const vals = ranges[r];
  const last = vals[vals.length - 1];
  const first = vals[0];
  const diff = last - first;
  const pctv = (diff / first) * 100;
  const plotRef = useRef<HTMLDivElement>(null);
  const [{ W, H }, setSize] = useState({ W: 320, H: 120 });
  useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ W: Math.max(120, el.clientWidth), H: Math.max(80, el.clientHeight) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pts = useMemo(() => vals.map((v, i) => [(i / (vals.length - 1)) * (W - 10) + 2, H - 8 - ((v - min) / (max - min || 1)) * (H - 20)] as [number, number]), [vals, min, max, W, H]);
  const [whole, cents] = last.toFixed(2).split('.');
  const color = diff >= 0 ? colors.success : colors.danger;
  return (
    <section aria-label={label} {...stylex.props(tc.root)}>
      <span {...stylex.props(tc.value)}>
        {prefix}
        {Number(whole).toLocaleString('en-US')}
        <span {...stylex.props(tc.cents)}>.{cents}</span>
      </span>
      <span {...stylex.props(tc.delta, diff >= 0 ? tc.up : tc.down)}>
        {diff >= 0 ? '+' : '−'}
        {Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · {Math.abs(pctv).toFixed(1)}%<span {...stylex.props(tc.when)}>{period}</span>
      </span>
      <div ref={plotRef} {...stylex.props(tc.plot)}>
        <svg viewBox={`0 0 ${W} ${H}`} {...stylex.props(tc.svg)} role="img" aria-label={`${label} trend over ${r}`}>
          <path d={smooth(pts)} fill="none" style={{ stroke: color }} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={6} style={{ fill: colors.well, stroke: color }} strokeWidth={2.5} />
        </svg>
      </div>
      <SegmentedControl fullWidth size="sm" value={r} onChange={setR} label="Range" options={keys.map((k) => ({ value: k, label: k }))} />
    </section>
  );
}
// #endregion

// #region InsightCard
export type Insight = {
  text: ReactNode;
  compare: { label: string; color: string; pct: number; amount: number }[];
  trend?: { color: string; values: number[] }[];
};
const ic = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 },
  head: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: 500, color: colors.text },
  count: { fontSize: 18, color: colors.textSubtle, flexGrow: 1 },
  text: { fontSize: 17, lineHeight: 1.55, color: colors.textMuted, margin: 0 },
  box: { display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 22, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  pair: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 },
  lab: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: font.md, color: colors.textMuted },
  dot: { width: 10, height: 10, borderRadius: 999 },
  pct: { fontSize: 26, fontWeight: 600, fontFamily: font.mono, letterSpacing: '-0.02em', lineHeight: 1.3 },
  amt: { fontFamily: font.mono, fontSize: font.md },
  pos: { color: `color-mix(in oklab, ${colors.success} 80%, ${colors.text})` },
  neg: { color: `color-mix(in oklab, ${colors.danger} 80%, ${colors.text})` },
  snap: { borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  snapHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 8px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, fontSize: font.md, color: colors.textMuted },
  plot: { position: 'relative', height: 150 },
  empty: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: font.md, color: colors.textSubtle },
  mention: { display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: colors.text },
  mono: { fontFamily: font.mono, fontSize: '0.92em' },
  suggest: { alignSelf: 'flex-start', height: 40, paddingInline: 18, borderRadius: 999, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: { default: colors.surface, ':hover': colors.hover }, color: colors.text, fontSize: font.md, cursor: 'pointer', transform: { default: null, ':active': 'scale(0.97)' }, transitionProperty: 'transform, background-color', transitionDuration: motion.fast },
});
/** Inline helpers for insight sentences. */
export const InsightMention = ({ color, children }: { color: string; children: ReactNode }) => (
  <span {...stylex.props(ic.mention)}>
    <span {...stylex.props(ic.dot)} style={{ backgroundColor: color }} />
    {children}
  </span>
);
export const InsightNumber = ({ children, tone = 'neg' }: { children: ReactNode; tone?: 'pos' | 'neg' }) => <span {...stylex.props(ic.mono, tone === 'pos' ? ic.pos : ic.neg)}>{children}</span>;
/** Paged insights: a sentence, two compared items and a trend snapshot (with an empty state). */
export function InsightCard({ insights, suggestion, onSuggest }: { insights: Insight[]; suggestion?: string; onSuggest?: () => void }) {
  const [i, setI] = useState(0);
  const [snap, setSnap] = useState(true);
  const cur = insights[i];
  const id = useId();
  return (
    <section aria-labelledby={id} {...stylex.props(ic.root)}>
      <div {...stylex.props(ic.head)}>
        <span id={id} {...stylex.props(ic.title)}>Insights</span>
        <span {...stylex.props(ic.count)}>{insights.length}</span>
        <IconButton size="sm" label="Previous insight" icon={<ChevronLeft />} disabled={i === 0} onClick={() => setI(i - 1)} />
        <IconButton size="sm" label="Next insight" icon={<ChevronRight />} disabled={i === insights.length - 1} onClick={() => setI(i + 1)} />
      </div>
      <p aria-live="polite" {...stylex.props(ic.text)}>{cur.text}</p>
      <div {...stylex.props(ic.box)}>
        <div {...stylex.props(ic.pair)}>
          {cur.compare.map((c) => (
            <div key={c.label}>
              <span {...stylex.props(ic.lab)}>
                <span {...stylex.props(ic.dot)} style={{ backgroundColor: c.color }} />
                {c.label}
              </span>
              <div {...stylex.props(ic.pct, c.pct >= 0 ? ic.pos : ic.neg)}>
                {c.pct >= 0 ? '+' : '−'}
                {Math.abs(c.pct).toFixed(2)}%
              </div>
              <div {...stylex.props(ic.amt, c.pct >= 0 ? ic.pos : ic.neg)}>
                {c.amount >= 0 ? '+' : '−'}${Math.abs(c.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
        <div {...stylex.props(ic.snap)}>
          <div {...stylex.props(ic.snapHead)}>
            Trend snapshot
            <Button size="xs" variant="soft" onClick={() => setSnap(!snap)}>{snap ? 'Hide' : 'Show'}</Button>
          </div>
          <div {...stylex.props(ic.plot)}>
            {snap && cur.trend?.length ? (
              <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }} aria-label="Trend">
                {cur.trend.map((t, k) => {
                  const mn = Math.min(...t.values);
                  const mx = Math.max(...t.values);
                  const pts = t.values.map((v, j) => [(j / (t.values.length - 1)) * 300, 130 - ((v - mn) / (mx - mn || 1)) * 100] as [number, number]);
                  return <path key={k} d={smooth(pts)} fill="none" style={{ stroke: t.color }} strokeWidth={2} vectorEffect="non-scaling-stroke" />;
                })}
              </svg>
            ) : (
              <span {...stylex.props(ic.empty)}>{snap ? 'No data to display' : 'Snapshot hidden'}</span>
            )}
          </div>
        </div>
      </div>
      {suggestion && (
        <button type="button" onClick={onSuggest} {...stylex.props(ic.suggest, fx.focus)}>
          {suggestion}
        </button>
      )}
    </section>
  );
}
// #endregion

// #region ConditionBuilder
export type CondField = { id: string; label: string; options: { value: string; label: string; color?: string }[] };
export type Condition = { id: string; field: string; value: string };
const cb = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 },
  tag: { alignSelf: 'flex-start', paddingInline: 10, height: 26, display: 'inline-flex', alignItems: 'center', borderRadius: 8, fontSize: font.sm, fontWeight: 500, backgroundColor: `color-mix(in oklab, ${colors.warning} 18%, transparent)`, color: `color-mix(in oklab, ${colors.warning} 62%, ${colors.text})` },
  box: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border },
  row: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, minWidth: 0 },
  grip: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: { default: 22, '@media (pointer: coarse)': 32 }, height: { default: 28, '@media (pointer: coarse)': 32 }, borderWidth: 0, borderRadius: 6, backgroundColor: { default: 'transparent', ':hover': colors.hover }, color: colors.textSubtle, cursor: 'grab' },
  word: { width: 32, fontSize: font.md, color: colors.textMuted },
  entity: { display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, paddingInline: 10, borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, fontSize: font.md, color: colors.text },
  is: { fontSize: font.md, color: colors.textMuted, paddingInline: 2 },
  dot: { width: 8, height: 8, borderRadius: 999, display: 'inline-block', marginRight: 6 },
});
/** If/Else rule editor: entity · field · is · value rows, reorderable with the grip (arrow keys too). */
export function ConditionBuilder({ entity, entityIcon, fields, conditions, onChange, tag = 'If / Else' }: { entity: string; entityIcon?: ReactNode; fields: CondField[]; conditions: Condition[]; onChange: (c: Condition[]) => void; tag?: string }) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= conditions.length) return;
    const next = [...conditions];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const set = (i: number, p: Partial<Condition>) => onChange(conditions.map((c, k) => (k === i ? { ...c, ...p } : c)));
  return (
    <div {...stylex.props(cb.root)}>
      <span {...stylex.props(cb.tag)}>{tag}</span>
      <div {...stylex.props(cb.box)}>
        {conditions.map((c, i) => {
          const f = fields.find((x) => x.id === c.field) ?? fields[0];
          return (
            <div key={c.id} {...stylex.props(cb.row)}>
              <button type="button" aria-label={`Reorder condition ${i + 1}. Use arrow keys.`} onKeyDown={(e) => (e.key === 'ArrowUp' ? (e.preventDefault(), move(i, -1)) : e.key === 'ArrowDown' ? (e.preventDefault(), move(i, 1)) : null)} {...stylex.props(cb.grip, fx.focus)}>
                <GripVertical size={15} />
              </button>
              <span {...stylex.props(cb.word)}>{i === 0 ? 'If' : 'and'}</span>
              <span {...stylex.props(cb.entity)}>
                {entityIcon}
                {entity}
              </span>
              <Select size="sm" width="auto" label="Field" value={c.field} onChange={(v) => set(i, { field: v, value: fields.find((x) => x.id === v)!.options[0].value })} options={fields.map((x) => ({ value: x.id, label: x.label }))} />
              <span {...stylex.props(cb.is)}>is</span>
              <Select
                size="sm"
                width="auto"
                label="Value"
                value={c.value}
                onChange={(v) => set(i, { value: v })}
                options={f.options.map((o) => ({ value: o.value, label: o.label, icon: o.color ? <span {...stylex.props(cb.dot)} style={{ backgroundColor: o.color }} /> : undefined }))}
              />
              {conditions.length > 1 && <IconButton size="xs" label="Remove condition" icon={<X />} onClick={() => onChange(conditions.filter((_, k) => k !== i))} />}
            </div>
          );
        })}
        <div>
          <Button size="xs" variant="soft" iconStart={<Plus />} onClick={() => onChange([...conditions, { id: String(Date.now()), field: fields[0].id, value: fields[0].options[0].value }])}>
            Add condition
          </Button>
        </div>
      </div>
    </div>
  );
}
// #endregion

