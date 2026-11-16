import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { accent, colors, control, font, motion, radius } from './tokens.stylex';
import { fx } from './shared';
import { useControllable, useMediaQuery } from './hooks';
import { Button, IconButton } from './action';
import { Popover } from './overlay';
import { TextInput } from './forms';

const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// #region Calendar
const cal = stylex.create({
  root: { display: 'inline-flex', flexDirection: 'column', gap: 8, padding: 8, width: 280, maxWidth: '100%' },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  month: { fontSize: font.md, fontWeight: 500, color: colors.text },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', rowGap: 2 },
  dow: { height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: font.mono, color: colors.textSubtle },
  day: {
    position: 'relative',
    height: 34,
    borderWidth: 0,
    padding: 0,
    fontSize: font.sm,
    fontVariantNumeric: 'tabular-nums',
    color: colors.text,
    backgroundColor: { default: 'transparent', ':hover:not(:disabled)': colors.hover },
    borderRadius: 9,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    transitionProperty: 'background-color, color, transform',
    transitionDuration: motion.fast,
    transform: { default: null, ':active:not(:disabled)': 'scale(0.94)' },
  },
  outside: { color: colors.textSubtle },
  disabled: { opacity: 0.35, textDecorationLine: 'line-through' },
  today: { boxShadow: `inset 0 0 0 1px ${colors.borderStrong}` },
  inRange: { backgroundColor: { default: `color-mix(in oklab, ${accent.base} 12%, transparent)`, ':hover:not(:disabled)': `color-mix(in oklab, ${accent.base} 18%, transparent)` }, borderRadius: 0 },
  selected: { backgroundColor: { default: accent.base, ':hover:not(:disabled)': accent.hover }, color: accent.onAccent },
});
export type CalendarProps = {
  mode?: 'single' | 'range';
  value?: Date | null;
  onChange?: (d: Date) => void;
  range?: [Date | null, Date | null];
  onRangeChange?: (r: [Date | null, Date | null]) => void;
  min?: Date;
  max?: Date;
  defaultMonth?: Date;
};
/** Month grid. Single date or range; arrow keys move focus, Enter picks. */
export function Calendar({ mode = 'single', value, onChange, range, onRangeChange, min, max, defaultMonth }: CalendarProps) {
  const anchor = (mode === 'range' ? range?.[0] : value) ?? defaultMonth ?? new Date(2026, 10, 15);
  const [month, setMonth] = useState(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const [focus, setFocus] = useState<Date>(startOfDay(anchor));
  const [hover, setHover] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());
  const days = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7; // Monday first
    return Array.from({ length: 42 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), 1 - offset + i));
  }, [month]);
  const disabled = (d: Date) => (min && d < startOfDay(min)) || (max && d > startOfDay(max));
  const pick = (d: Date) => {
    if (disabled(d)) return;
    if (mode === 'single') return onChange?.(d);
    const [a, b] = range ?? [null, null];
    if (!a || b) onRangeChange?.([d, null]);
    else onRangeChange?.(d < a ? [d, a] : [a, d]);
  };
  const moveFocus = (n: number) => {
    const d = new Date(focus);
    d.setDate(d.getDate() + n);
    setFocus(d);
    if (d.getMonth() !== month.getMonth()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus());
  };
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (map[e.key]) (e.preventDefault(), moveFocus(map[e.key]));
  };
  const [ra, rb] = range ?? [null, null];
  const rEnd = rb ?? (ra && hover ? hover : null);
  const lo = ra && rEnd ? (ra < rEnd ? ra : rEnd) : null;
  const hi = ra && rEnd ? (ra < rEnd ? rEnd : ra) : null;
  return (
    <div {...stylex.props(cal.root)}>
      <div {...stylex.props(cal.head)}>
        <IconButton size="sm" label="Previous month" icon={<ChevronLeft size={16} />} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
        <span aria-live="polite" {...stylex.props(cal.month)}>
          {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </span>
        <IconButton size="sm" label="Next month" icon={<ChevronRight size={16} />} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
      </div>
      <div role="grid" ref={gridRef} onKeyDown={onKey} {...stylex.props(cal.grid)}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} role="columnheader" {...stylex.props(cal.dow)}>
            {d}
          </span>
        ))}
        {days.map((d) => {
          const sel = mode === 'single' ? sameDay(d, value) : sameDay(d, ra) || sameDay(d, rb);
          const inR = mode === 'range' && lo && hi && d > lo && d < hi;
          const f = sameDay(d, focus);
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={sel}
              aria-label={fmtDate(d)}
              data-focus={f}
              tabIndex={f ? 0 : -1}
              disabled={!!disabled(d)}
              onClick={() => (setFocus(d), pick(d))}
              onPointerEnter={() => setHover(d)}
              {...stylex.props(cal.day, d.getMonth() !== month.getMonth() && cal.outside, sameDay(d, today) && cal.today, inR && cal.inRange, sel && cal.selected, disabled(d) && cal.disabled, fx.focus)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
// #endregion

// #region DateInput
const di = stylex.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minWidth: 0,
    height: control.md,
    paddingInline: 10,
    fontSize: font.md,
    color: colors.text,
    textAlign: 'left',
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: radius.control,
    cursor: 'pointer',
    fontVariantNumeric: 'tabular-nums',
  },
  icon: { color: colors.textMuted, flexShrink: 0, display: 'inline-flex' },
  text: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  placeholder: { color: colors.textSubtle },
  foot: { display: 'flex', justifyContent: 'space-between', padding: '0 12px 10px', fontSize: font.xs, color: colors.textMuted },
  link: { borderWidth: 0, backgroundColor: 'transparent', color: accent.base, cursor: 'pointer', fontSize: font.xs, padding: 0 },
});
/** Button that opens a Calendar in a popover. */
export function DateInput({
  value,
  defaultValue = null,
  onChange,
  placeholder = 'Pick a date',
  min,
  max,
  label,
}: {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (d: Date | null) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  label?: string;
}) {
  const [v, setV] = useControllable<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Choose date"
      trigger={
        <button type="button" aria-label={label ? `${label}: ${v ? fmtDate(v) : 'not set'}` : undefined} {...stylex.props(di.trigger, fx.focus)}>
          <span {...stylex.props(di.icon)}>
            <CalendarIcon size={15} />
          </span>
          <span {...stylex.props(di.text, !v && di.placeholder)}>{v ? fmtDate(v) : placeholder}</span>
          <ChevronDown size={15} {...stylex.props(di.icon)} />
        </button>
      }
    >
      <Calendar value={v} min={min} max={max} onChange={(d) => (setV(d), setOpen(false))} />
      <div {...stylex.props(di.foot)}>
        <button type="button" {...stylex.props(di.link)} onClick={() => (setV(startOfDay(new Date())), setOpen(false))}>
          Today
        </button>
        <button type="button" {...stylex.props(di.link)} onClick={() => (setV(null), setOpen(false))}>
          Clear
        </button>
      </div>
    </Popover>
  );
}
// #endregion

// #region DateRangeInput
const presets: [string, number][] = [
  ['Last 7 days', 7],
  ['Last 30 days', 30],
  ['Last 90 days', 90],
];
const dr = stylex.create({
  body: { display: 'flex', flexDirection: { default: 'row', '@media (max-width: 520px)': 'column' } },
  side: {
    display: 'flex',
    flexDirection: { default: 'column', '@media (max-width: 520px)': 'row' },
    flexWrap: 'wrap',
    gap: 2,
    padding: 8,
    borderRightWidth: { default: 1, '@media (max-width: 520px)': 0 },
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    minWidth: 130,
  },
  preset: { textAlign: 'left', borderWidth: 0, borderRadius: 8, padding: '7px 10px', fontSize: font.sm, color: colors.text, backgroundColor: { default: 'transparent', ':hover': colors.hover }, cursor: 'pointer', whiteSpace: 'nowrap' },
});
export function DateRangeInput({
  value,
  defaultValue = [null, null],
  onChange,
  placeholder = 'Pick a range',
}: {
  value?: [Date | null, Date | null];
  defaultValue?: [Date | null, Date | null];
  onChange?: (r: [Date | null, Date | null]) => void;
  placeholder?: string;
}) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const text = v[0] && v[1] ? `${fmtDate(v[0])} – ${fmtDate(v[1])}` : v[0] ? `${fmtDate(v[0])} – …` : '';
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Choose range"
      trigger={
        <button type="button" {...stylex.props(di.trigger, fx.focus)}>
          <span {...stylex.props(di.icon)}>
            <CalendarIcon size={15} />
          </span>
          <span {...stylex.props(di.text, !text && di.placeholder)}>{text || placeholder}</span>
          <ChevronDown size={15} {...stylex.props(di.icon)} />
        </button>
      }
    >
      <div {...stylex.props(dr.body)}>
        <div {...stylex.props(dr.side)}>
          {presets.map(([l, n]) => (
            <button
              key={l}
              type="button"
              {...stylex.props(dr.preset)}
              onClick={() => {
                const end = startOfDay(new Date());
                const start = new Date(end);
                start.setDate(end.getDate() - (n - 1));
                setV([start, end]);
                setOpen(false);
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <Calendar mode="range" range={v} onRangeChange={(r) => (setV(r), r[1] && setOpen(false))} />
      </div>
    </Popover>
  );
}
// #endregion

// #region TimeInput
/** Native time field in Sfera's input frame: accessible and keyboard friendly on every platform. */
export function TimeInput({ value, defaultValue = '09:30', onChange, step = 300, label }: { value?: string; defaultValue?: string; onChange?: (v: string) => void; step?: number; label?: string }) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  return <TextInput type="time" aria-label={label} step={step} value={v} onChange={(e) => setV(e.target.value)} />;
}
// #endregion

// #region DateTimeInput
const dt = stylex.create({ row: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(110px, 1fr)', gap: 8, width: '100%' } });
export function DateTimeInput({ value, onChange }: { value?: Date | null; onChange?: (d: Date) => void }) {
  const [d, setD] = useState<Date | null>(value ?? new Date(2026, 10, 18, 14, 30));
  const time = d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '09:00';
  const emit = (nd: Date) => (setD(nd), onChange?.(nd));
  return (
    <div {...stylex.props(dt.row)}>
      <DateInput label="Date" value={d} onChange={(x) => x && emit(new Date(x.getFullYear(), x.getMonth(), x.getDate(), d?.getHours() ?? 9, d?.getMinutes() ?? 0))} />
      <TimeInput
        label="Time"
        value={time}
        onChange={(t) => {
          const [h, m] = t.split(':').map(Number);
          const base = d ?? new Date();
          emit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), h || 0, m || 0));
        }}
      />
    </div>
  );
}
// #endregion

// #region Timestamp
const ts = stylex.create({ root: { fontVariantNumeric: 'tabular-nums', color: colors.textMuted, fontSize: font.sm, whiteSpace: 'nowrap' } });
export function relativeTime(d: Date, now = new Date()) {
  const s = Math.round((now.getTime() - d.getTime()) / 1000);
  const abs = Math.abs(s);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 45) return 'just now';
  if (abs < 3600) return rtf.format(-Math.round(s / 60), 'minute');
  if (abs < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  if (abs < 604800) return rtf.format(-Math.round(s / 86400), 'day');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}
/** Relative time ("3 hours ago") that refreshes each minute; full date on hover. */
export function Timestamp({ date, format = 'relative' }: { date: Date; format?: 'relative' | 'date' | 'datetime' }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (format !== 'relative') return;
    const t = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, [format]);
  const full = date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const text = format === 'relative' ? relativeTime(date) : format === 'date' ? fmtDate(date) : full;
  return (
    <time dateTime={date.toISOString()} title={full} {...stylex.props(ts.root)}>
      {text}
    </time>
  );
}
// #endregion

// #region Timer
const tm = stylex.create({
  root: { display: 'inline-flex', alignItems: 'center', gap: 8 },
  clock: { fontFamily: font.mono, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: colors.text, minWidth: 96 },
  running: { color: accent.base },
  done: { color: colors.danger },
});
const pad = (n: number) => String(n).padStart(2, '0');
export const formatDuration = (ms: number) => {
  const t = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(t / 3600);
  return `${h ? h + ':' : ''}${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
};
/** Stopwatch, or countdown when `countdownFrom` (ms) is set. */
export function Timer({ countdownFrom, autoStart = false, onDone }: { countdownFrom?: number; autoStart?: boolean; onDone?: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const last = useRef<number>(0);
  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const t = setInterval(() => {
      const now = performance.now();
      setElapsed((e) => e + (now - last.current));
      last.current = now;
    }, 250);
    return () => clearInterval(t);
  }, [running]);
  const shown = countdownFrom !== undefined ? countdownFrom - elapsed : elapsed;
  const finished = countdownFrom !== undefined && shown <= 0;
  useEffect(() => {
    if (finished && running) (setRunning(false), onDone?.());
  }, [finished, running, onDone]);
  return (
    <span {...stylex.props(tm.root)}>
      <span role="timer" aria-live="off" {...stylex.props(tm.clock, running && tm.running, finished && tm.done)}>
        {formatDuration(shown)}
      </span>
      <IconButton size="sm" variant="secondary" label={running ? 'Pause' : 'Start'} icon={running ? <Pause size={14} /> : <Play size={14} />} disabled={finished} onClick={() => setRunning(!running)} />
      <IconButton size="sm" label="Reset" icon={<RotateCcw size={14} />} onClick={() => (setRunning(false), setElapsed(0))} />
    </span>
  );
}
// #endregion

// #region EventCalendar
export type CalEvent = { id: string; date: Date; title: string; tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'; time?: string };
const ec = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 },
  head: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: colors.text, flexGrow: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.surface },
  dow: { padding: '8px 10px', fontSize: 11, fontFamily: font.mono, color: colors.textMuted, backgroundColor: colors.well, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  cell: { minHeight: { default: 104, '@media (max-width: 640px)': 64 }, padding: { default: 6, '@media (max-width: 640px)': 3 }, borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: colors.border, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, cursor: 'pointer', backgroundColor: { default: 'transparent', ':hover': colors.hover } },
  out: { backgroundColor: { default: colors.well, ':hover': colors.hover } },
  num: { fontSize: font.xs, fontVariantNumeric: 'tabular-nums', color: colors.textMuted, width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  today: { backgroundColor: accent.base, color: accent.onAccent },
  ev: { display: 'block', padding: { default: '2px 6px', '@media (pointer: coarse)': '7px 6px' }, borderRadius: 6, fontSize: { default: 11, '@media (pointer: coarse)': 12 }, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderWidth: 0, textAlign: 'left', cursor: 'pointer', color: colors.text },
  accent: { backgroundColor: `color-mix(in oklab, ${accent.base} 16%, transparent)` },
  success: { backgroundColor: `color-mix(in oklab, ${colors.success} 18%, transparent)` },
  warning: { backgroundColor: `color-mix(in oklab, ${colors.warning} 22%, transparent)` },
  danger: { backgroundColor: `color-mix(in oklab, ${colors.danger} 16%, transparent)` },
  neutral: { backgroundColor: colors.track },
  dotOnly: { display: { default: 'block', '@media (max-width: 640px)': 'none' } },
  dotM: { display: { default: 'none', '@media (max-width: 640px)': 'block' }, width: 6, height: 6, borderRadius: 999, backgroundColor: accent.base },
  more: { fontSize: 11, color: colors.textMuted, paddingInline: 6 },
  picked: { boxShadow: `inset 0 0 0 2px ${accent.base}` },
  dots: { display: 'flex', gap: 3, flexWrap: 'wrap' },
  dotT: (c: string) => ({ backgroundColor: c }),
  agenda: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: radius.card, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  agendaHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingInline: 4 },
  agendaTitle: { margin: 0, fontSize: font.md, fontWeight: 500, color: colors.text },
  item: { display: 'flex', alignItems: 'center', gap: 10, minHeight: 48, paddingInline: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: colors.surface, textAlign: 'left', cursor: 'pointer', fontSize: font.sm, color: colors.text, fontFamily: 'inherit' },
  bar: { width: 4, alignSelf: 'stretch', marginBlock: 10, borderRadius: 2, flexShrink: 0 },
  time: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted, minWidth: 40 },
  empty: { fontSize: font.sm, color: colors.textMuted, paddingInline: 4, paddingBlock: 6 },
});
const toneColor = { accent: accent.base, success: colors.success, warning: colors.warning, danger: colors.danger, neutral: colors.textSubtle };
/** Month view with events. Click a day to add, an event to open. On phones the grid shows coloured dots; tapping a day lists its events underneath. */
export function EventCalendar({ events, month: monthProp, onMonthChange, onDayClick, onEventClick, today = new Date(2026, 10, 15) }: { events: CalEvent[]; month?: Date; onMonthChange?: (d: Date) => void; onDayClick?: (d: Date) => void; onEventClick?: (e: CalEvent) => void; today?: Date }) {
  const [inner, setInner] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const month = monthProp ?? inner;
  const setMonth = (d: Date) => (onMonthChange ? onMonthChange(d) : setInner(d));
  const offset = (month.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), 1 - offset + i));
  const weeks = days[35].getMonth() !== month.getMonth() ? days.slice(0, 35) : days;
  const phone = useMediaQuery('(max-width: 640px)');
  // start on today, or the next day that has something planned
  const [sel, setSel] = useState(() => {
    if (events.some((e) => sameDay(e.date, today))) return today;
    const next = events.filter((e) => e.date >= today).sort((a, b) => +a.date - +b.date)[0];
    return next ? next.date : today;
  });
  const selEvents = events.filter((e) => sameDay(e.date, sel));
  return (
    <div {...stylex.props(ec.root)}>
      <div {...stylex.props(ec.head)}>
        <h2 {...stylex.props(ec.title)}>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
        <IconButton variant="secondary" size="sm" label="Previous month" icon={<ChevronLeft size={15} />} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
        <IconButton variant="secondary" size="sm" label="Next month" icon={<ChevronRight size={15} />} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
      </div>
      <div {...stylex.props(ec.grid)} role="grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} role="columnheader" {...stylex.props(ec.dow)}>
            {d}
          </div>
        ))}
        {weeks.map((d) => {
          const evs = events.filter((e) => sameDay(e.date, d));
          return (
            <div
              key={d.toISOString()}
              role="gridcell"
              aria-label={`${fmtDate(d)}${evs.length ? `, ${evs.length} event${evs.length > 1 ? 's' : ''}` : ''}`}
              aria-selected={phone ? sameDay(d, sel) : undefined}
              onClick={() => (phone ? setSel(d) : onDayClick?.(d))}
              {...stylex.props(ec.cell, d.getMonth() !== month.getMonth() && ec.out, phone && sameDay(d, sel) && ec.picked)}
            >
              <span {...stylex.props(ec.num, sameDay(d, today) && ec.today)}>{d.getDate()}</span>
              {evs.slice(0, 2).map((e) => (
                <span key={e.id} {...stylex.props(ec.dotOnly)}>
                  <button type="button" onClick={(x) => (x.stopPropagation(), onEventClick?.(e))} {...stylex.props(ec.ev, ec[e.tone ?? 'accent'], fx.focus)} style={{ width: '100%' }}>
                    {e.time && <span style={{ opacity: 0.7 }}>{e.time} </span>}
                    {e.title}
                  </button>
                </span>
              ))}
              {evs.length > 0 && (
                <span aria-hidden {...stylex.props(ec.dots)}>
                  {evs.slice(0, 3).map((e) => (
                    <span key={e.id} {...stylex.props(ec.dotM, ec.dotT(toneColor[e.tone ?? 'accent']))} />
                  ))}
                </span>
              )}
              {evs.length > 2 && <span {...stylex.props(ec.more, ec.dotOnly)}>+{evs.length - 2} more</span>}
            </div>
          );
        })}
      </div>
      {phone && (
        <section aria-label={`Events on ${fmtDate(sel)}`} {...stylex.props(ec.agenda)}>
          <div {...stylex.props(ec.agendaHead)}>
            <h3 {...stylex.props(ec.agendaTitle)}>{sel.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
            {onDayClick && (
              <Button size="sm" variant="ghost" onClick={() => onDayClick(sel)}>
                Add
              </Button>
            )}
          </div>
          {selEvents.length === 0 && <p {...stylex.props(ec.empty)}>Nothing planned. Tap a day with a dot to see its events.</p>}
          {selEvents.map((e) => (
            <button key={e.id} type="button" onClick={() => onEventClick?.(e)} {...stylex.props(ec.item, fx.focus)}>
              <span {...stylex.props(ec.bar, ec.dotT(toneColor[e.tone ?? 'accent']))} />
              <span {...stylex.props(ec.time)}>{e.time ?? 'All day'}</span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
// #endregion
