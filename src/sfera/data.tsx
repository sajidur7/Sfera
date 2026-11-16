import * as stylex from '@stylexjs/stylex';
import { Fragment, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Ellipsis, Plus, X as XIcon } from 'lucide-react';
import { accent, colors, font, radius, space } from './tokens.stylex';
import { fx, type Tone } from './shared';
import { Checkbox } from './forms';
import { DropdownMenu } from './overlay';
import { StatusDot } from './feedback';
import { Avatar } from './content';

// #region Table
export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  width?: number | string;
  hideBelow?: 'sm' | 'md';
};
const tb = stylex.create({
  scroller: { width: '100%', overflowX: 'auto', minWidth: 0 },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: font.md, color: colors.text },
  th: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    height: 38,
    paddingInline: 12,
    textAlign: 'left',
    fontWeight: 500,
    fontSize: font.sm,
    color: colors.textMuted,
    whiteSpace: 'nowrap',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  sortBtn: {
    minHeight: { default: 0, '@media (pointer: coarse)': 32 },
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: { default: 'inherit', ':hover': colors.text },
    fontSize: 'inherit',
    fontWeight: 'inherit',
    cursor: 'pointer',
    borderRadius: 4,
  },
  td: {
    height: 48,
    paddingInline: 12,
    whiteSpace: 'nowrap',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    verticalAlign: 'middle',
  },
  compact: { height: 40 },
  lastRow: { borderBottomWidth: 0 },
  right: { textAlign: 'right' },
  num: { fontVariantNumeric: 'tabular-nums' },
  row: { backgroundColor: { default: 'transparent', ':hover': colors.hover }, transitionProperty: 'background-color', transitionDuration: '120ms' },
  clickable: { cursor: 'pointer' },
  selected: { backgroundColor: { default: `color-mix(in oklab, ${accent.base} 6%, transparent)`, ':hover': `color-mix(in oklab, ${accent.base} 9%, transparent)` } },
  check: { width: 44, paddingRight: 0 },
  hideSm: { display: { default: 'table-cell', '@media (max-width: 640px)': 'none' } },
  hideMd: { display: { default: 'table-cell', '@media (max-width: 900px)': 'none' } },
  w: (w: string) => ({ width: w }),
  exp: { width: 40, paddingRight: 0, paddingLeft: 8 },
  expBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: { default: 26, '@media (pointer: coarse)': 32 }, height: { default: 26, '@media (pointer: coarse)': 32 }, borderWidth: 0, borderRadius: 7, backgroundColor: { default: 'transparent', ':hover': colors.hover }, color: colors.textMuted, cursor: 'pointer' },
  chev: { transitionProperty: 'transform', transitionDuration: '220ms' },
  chevOpen: { transform: 'rotate(90deg)' },
  expanded: { padding: '12px 16px 16px 52px', backgroundColor: colors.well, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, whiteSpace: 'normal' },
});
export type TableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  compact?: boolean;
  label?: string;
  /** Row expansion: content shown under a row when its chevron is open. */
  renderExpanded?: (row: T) => ReactNode;
};
/** Calm data table: hairline rows, sticky header, sortable columns, optional row selection. Scrolls sideways inside itself on small screens. */
export function Table<T>({ columns, rows, rowKey, selectable, selected: selProp, onSelectedChange, onRowClick, compact, label, renderExpanded }: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selInner, setSelInner] = useState<string[]>([]);
  const sel = selProp ?? selInner;
  const setSel = (ids: string[]) => (onSelectedChange ? onSelectedChange(ids) : setSelInner(ids));
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const x = col.sortValue!(a);
      const y = col.sortValue!(b);
      return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
    });
  }, [rows, sort, columns]);
  const allOn = rows.length > 0 && sel.length === rows.length;
  const hide = (c: Column<T>) => (c.hideBelow === 'sm' ? tb.hideSm : c.hideBelow === 'md' ? tb.hideMd : null);
  return (
    <div {...stylex.props(tb.scroller)}>
      <table aria-label={label} {...stylex.props(tb.table)}>
        <thead>
          <tr>
            {renderExpanded && <th aria-label="Expand" {...stylex.props(tb.th, tb.exp)} />}
            {selectable && (
              <th {...stylex.props(tb.th, tb.check)}>
                <Checkbox aria-label="Select all rows" checked={allOn ? true : sel.length ? 'mixed' : false} onChange={() => setSel(allOn ? [] : rows.map(rowKey))} />
              </th>
            )}
            {columns.map((c) => {
              const s = sort?.key === c.key ? sort.dir : 0;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={s === 1 ? 'ascending' : s === -1 ? 'descending' : undefined}
                  {...stylex.props(tb.th, c.align === 'right' && tb.right, hide(c), c.width !== undefined && tb.w(typeof c.width === 'number' ? `${c.width}px` : c.width))}
                >
                  {c.sortValue ? (
                    <button type="button" onClick={() => setSort(s === 1 ? { key: c.key, dir: -1 } : s === -1 ? null : { key: c.key, dir: 1 })} {...stylex.props(tb.sortBtn, fx.focus)}>
                      {c.header}
                      {s === 1 ? <ArrowUp size={13} /> : s === -1 ? <ArrowDown size={13} /> : <ArrowUpDown size={13} opacity={0.5} />}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const id = rowKey(r);
            const on = sel.includes(id);
            const last = i === sorted.length - 1;
            return (
              <Fragment key={id}>
              <tr onClick={onRowClick ? () => onRowClick(r) : undefined} aria-selected={selectable ? on : undefined} {...stylex.props(tb.row, onRowClick && tb.clickable, on && tb.selected)}>
                {renderExpanded && (
                  <td {...stylex.props(tb.td, tb.exp, compact && tb.compact, last && !expanded.includes(id) && tb.lastRow)} onClick={(e) => e.stopPropagation()}>
                    <button type="button" aria-expanded={expanded.includes(id)} aria-label={expanded.includes(id) ? 'Collapse row' : 'Expand row'} onClick={() => setExpanded((x) => (x.includes(id) ? x.filter((k) => k !== id) : [...x, id]))} {...stylex.props(tb.expBtn, fx.focus)}>
                      <ChevronRight size={15} {...stylex.props(tb.chev, expanded.includes(id) && tb.chevOpen)} />
                    </button>
                  </td>
                )}
                {selectable && (
                  <td {...stylex.props(tb.td, tb.check, compact && tb.compact, last && tb.lastRow)} onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label={`Select row ${i + 1}`} checked={on} onChange={() => setSel(on ? sel.filter((x) => x !== id) : [...sel, id])} />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} {...stylex.props(tb.td, compact && tb.compact, c.align === 'right' && [tb.right, tb.num], hide(c), last && tb.lastRow)}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
              {renderExpanded && expanded.includes(id) && (
                <tr>
                  <td colSpan={columns.length + 1 + (selectable ? 1 : 0)} {...stylex.props(tb.expanded, last && tb.lastRow)}>
                    {renderExpanded(r)}
                  </td>
                </tr>
              )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
// #endregion

// #region StatGroup
const sg = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(var(--cols), minmax(0, 1fr))', '@media (max-width: 720px)': 'repeat(2, minmax(0, 1fr))' },
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  cols: (n: number) => ({ '--cols': n }),
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: { default: '14px 16px', '@media (max-width: 720px)': '12px 14px' },
    minWidth: 0,
    // hairline dividers between cells (and between rows when wrapped)
    boxShadow: `-1px 0 0 ${colors.border}, 0 -1px 0 ${colors.border}`,
  },
  label: { fontSize: font.sm, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  value: { fontSize: { default: 24, '@media (max-width: 720px)': 20 }, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, color: colors.text, fontVariantNumeric: 'tabular-nums' },
  delta: { display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: font.xs, fontFamily: font.mono },
  up: { color: `color-mix(in oklab, ${colors.success} 80%, ${colors.text})` },
  down: { color: `color-mix(in oklab, ${colors.danger} 80%, ${colors.text})` },
  foot: { display: 'flex', alignItems: 'center', gap: 6, fontSize: font.xs, color: colors.textSubtle },
});
export type Stat = { label: ReactNode; value: ReactNode; delta?: number; note?: ReactNode; icon?: ReactNode };
/** Stat cells divided by hairlines (one surface, no card-per-number). */
export function StatGroup({ stats }: { stats: Stat[] }) {
  return (
    <div {...stylex.props(sg.root, sg.cols(Math.min(stats.length, 4)))}>
      {stats.map((s, i) => (
        <div key={i} {...stylex.props(sg.cell)}>
          <span {...stylex.props(sg.label)}>
            {s.icon}
            {s.label}
          </span>
          <span {...stylex.props(sg.value)}>{s.value}</span>
          {(s.delta !== undefined || s.note) && (
            <span {...stylex.props(sg.foot)}>
              {s.delta !== undefined && (
                <span {...stylex.props(sg.delta, s.delta >= 0 ? sg.up : sg.down)}>
                  {s.delta >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {Math.abs(s.delta)}%
                </span>
              )}
              {s.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region MetadataList
const ml = stylex.create({
  root: { display: 'flex', flexDirection: 'column', margin: 0 },
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(96px, 38%) minmax(0, 1fr)',
    gap: space.s3,
    alignItems: 'center',
    minHeight: 38,
    paddingBlock: 6,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  last: { borderBottomWidth: 0 },
  dt: { fontSize: font.sm, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 8 },
  dd: { margin: 0, fontSize: font.md, color: colors.text, minWidth: 0, overflowWrap: 'anywhere', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  right: { justifyContent: 'flex-end', textAlign: 'right' },
  rowRight: { gridTemplateColumns: 'minmax(0, 1fr) auto' },
});
/** Label / value rows, e.g. record attributes. */
export function MetadataList({ items, alignValues = 'left' }: { items: { label: ReactNode; value: ReactNode; icon?: ReactNode }[]; alignValues?: 'left' | 'right' }) {
  return (
    <dl {...stylex.props(ml.root)}>
      {items.map((it, i) => (
        <div key={i} {...stylex.props(ml.row, alignValues === 'right' && ml.rowRight, i === items.length - 1 && ml.last)}>
          <dt {...stylex.props(ml.dt)}>
            {it.icon}
            {it.label}
          </dt>
          <dd {...stylex.props(ml.dd, alignValues === 'right' && ml.right)}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
// #endregion

// #region StatusSelect
export type StatusOption = { value: string; label: string; tone: Tone };
const ss = stylex.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: { default: 30, '@media (pointer: coarse)': 36 },
    paddingInline: '10px 6px',
    borderRadius: radius.control,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    fontSize: font.sm,
    fontWeight: 500,
    color: colors.text,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 1px rgba(0,0,0,0.03)',
  },
  chev: { color: colors.textMuted },
});
/** A status shown as a dot + label inside a select. Pick to change it. */
export function StatusSelect({ options, value, onChange, label = 'Status' }: { options: StatusOption[]; value: string; onChange: (v: string) => void; label?: string }) {
  const cur = options.find((o) => o.value === value) ?? options[0];
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <DropdownMenu
        label={label}
        items={options.map((o) => ({ type: 'radio' as const, label: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><StatusDot tone={o.tone} />{o.label}</span>), value: o.value, group: 'status', current: value, onChange }))}
        trigger={
          <button type="button" aria-label={`${label}: ${cur.label}`} {...stylex.props(ss.trigger, fx.focus)}>
            <StatusDot tone={cur.tone} />
            {cur.label}
            <ChevronDown size={14} {...stylex.props(ss.chev)} />
          </button>
        }
      />
    </span>
  );
}
// #endregion

// #region List
const ls = stylex.create({
  root: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' },
  boxed: { borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.surface },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', minHeight: 52, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, minWidth: 0 },
  last: { borderBottomWidth: 0 },
  btn: { width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, backgroundColor: { default: 'transparent', ':hover': colors.hover }, cursor: 'pointer' },
  text: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flexGrow: 1 },
  title: { fontSize: font.md, fontWeight: 500, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontSize: font.sm, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  end: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, fontSize: font.sm, color: colors.textMuted },
});
export function List({ children, boxed = true, label }: { children: ReactNode; boxed?: boolean; label?: string }) {
  return (
    <ul aria-label={label} {...stylex.props(ls.root, boxed && ls.boxed)}>
      {children}
    </ul>
  );
}
/** Row with a leading slot (avatar, icon), title + subtitle and a trailing slot. Pass onClick to make it a button. */
export function ListItem({ leading, title, subtitle, trailing, onClick, last }: { leading?: ReactNode; title: ReactNode; subtitle?: ReactNode; trailing?: ReactNode; onClick?: () => void; last?: boolean }) {
  const inner = (
    <>
      {leading}
      <span {...stylex.props(ls.text)}>
        <span {...stylex.props(ls.title)}>{title}</span>
        {subtitle && <span {...stylex.props(ls.sub)}>{subtitle}</span>}
      </span>
      {trailing && <span {...stylex.props(ls.end)}>{trailing}</span>}
    </>
  );
  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} {...stylex.props(ls.item, ls.btn, last && ls.last, fx.focus)}>
          {inner}
        </button>
      ) : (
        <div {...stylex.props(ls.item, last && ls.last)}>{inner}</div>
      )}
    </li>
  );
}
// #endregion

// #region OverflowList
const ov = stylex.create({
  root: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden', width: '100%' },
  measure: { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', display: 'flex', gap: 6, whiteSpace: 'nowrap' },
  more: { display: 'inline-flex', alignItems: 'center', height: { default: 24, '@media (pointer: coarse)': 32 }, paddingInline: 8, borderRadius: 999, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: { default: colors.surface, ':hover': colors.hover }, fontSize: font.xs, color: colors.text, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
});
/** Shows as many items as fit on one line, then a "+N" button that opens a menu with the rest. */
export function OverflowList<T>({ items, render, label }: { items: T[]; render: (t: T) => ReactNode; label: (t: T) => string }) {
  const root = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(items.length);
  useLayoutEffect(() => {
    const calc = () => {
      const w = root.current?.offsetWidth ?? 0;
      const kids = Array.from(measure.current?.children ?? []) as HTMLElement[];
      let used = 0;
      let n = 0;
      for (const k of kids) {
        const next = used + k.offsetWidth + (n ? 6 : 0);
        if (next > w - 52) break;
        used = next;
        n++;
      }
      setFit(n === kids.length && used <= w ? kids.length : n);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (root.current) ro.observe(root.current);
    return () => ro.disconnect();
  }, [items]);
  const rest = items.slice(fit);
  return (
    <div ref={root} {...stylex.props(ov.root)} style={{ position: 'relative' }}>
      <div ref={measure} aria-hidden {...stylex.props(ov.measure)}>
        {items.map((t, i) => (
          <span key={i}>{render(t)}</span>
        ))}
      </div>
      {items.slice(0, fit).map((t, i) => (
        <span key={i} style={{ flexShrink: 0 }}>
          {render(t)}
        </span>
      ))}
      {rest.length > 0 && (
        <DropdownMenu
          label={`${rest.length} more`}
          items={rest.map((t) => ({ label: label(t) }))}
          trigger={
            <button type="button" aria-label={`Show ${rest.length} more`} {...stylex.props(ov.more, fx.focus)}>
              +{rest.length}
            </button>
          }
        />
      )}
    </div>
  );
}
// #endregion

// #region PowerSearch
export type PowerField = { id: string; label: string; options: string[] };
export type PowerFilter = { field: string; op: 'is' | 'is not'; value: string };
const ps = stylex.create({
  root: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, padding: 6, minHeight: 44, borderRadius: 14, borderWidth: 1, borderStyle: 'solid', borderColor: colors.borderStrong, backgroundColor: colors.surface },
  chip: { display: 'inline-flex', alignItems: 'stretch', height: { default: 28, '@media (pointer: coarse)': 34 }, borderRadius: 9, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, overflow: 'hidden', fontSize: font.sm, backgroundColor: colors.well },
  part: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: { default: 0, '@media (pointer: coarse)': 32 }, paddingInline: 8, borderWidth: 0, backgroundColor: 'transparent', color: colors.text, fontSize: font.sm, cursor: 'pointer', borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: colors.border, whiteSpace: 'nowrap' },
  field: { color: colors.textMuted, cursor: 'default' },
  op: { color: colors.textMuted, backgroundColor: { default: 'transparent', ':hover': colors.pressed } },
  val: { fontWeight: 500, backgroundColor: { default: 'transparent', ':hover': colors.pressed } },
  x: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: { default: 24, '@media (pointer: coarse)': 32 }, minHeight: { default: 24, '@media (pointer: coarse)': 32 }, paddingInline: 6, borderWidth: 0, backgroundColor: { default: 'transparent', ':hover': colors.pressed }, color: colors.textMuted, cursor: 'pointer' },
  input: { flexGrow: 1, minWidth: 120, height: 28, borderWidth: 0, outlineStyle: 'none', backgroundColor: 'transparent', color: colors.text, fontSize: { default: font.md, '@media (max-width: 640px)': font.lg }, paddingInline: 6, '::placeholder': { color: colors.textSubtle } },
});
/** Structured search: text plus filter chips (field · is/is not · value). Each chip part is editable. */
export function PowerSearch({ fields, filters, onFiltersChange, query, onQueryChange, placeholder = 'Search or add a filter' }: { fields: PowerField[]; filters: PowerFilter[]; onFiltersChange: (f: PowerFilter[]) => void; query: string; onQueryChange: (q: string) => void; placeholder?: string }) {
  const set = (i: number, p: Partial<PowerFilter>) => onFiltersChange(filters.map((f, j) => (j === i ? { ...f, ...p } : f)));
  return (
    <div role="search" {...stylex.props(ps.root)}>
      <DropdownMenu
        label="Add filter"
        items={fields.map((f) => ({ label: f.label, onSelect: () => onFiltersChange([...filters, { field: f.id, op: 'is', value: f.options[0] }]) }))}
        trigger={<button type="button" aria-label="Add filter" {...stylex.props(ps.x, fx.focus)} style={{ borderRadius: 9 }}><Plus size={15} /></button>}
      />
      {filters.map((f, i) => {
        const def = fields.find((x) => x.id === f.field)!;
        return (
          <span key={i} {...stylex.props(ps.chip)}>
            <span {...stylex.props(ps.part, ps.field)}>{def.label}</span>
            <button type="button" aria-label={`Toggle ${def.label} operator`} onClick={() => set(i, { op: f.op === 'is' ? 'is not' : 'is' })} {...stylex.props(ps.part, ps.op, fx.focus)}>
              {f.op}
            </button>
            <DropdownMenu
              label={`${def.label} value`}
              items={def.options.map((o) => ({ type: 'radio' as const, label: o, value: o, group: f.field, current: f.value, onChange: (v: string) => set(i, { value: v }) }))}
              trigger={<button type="button" {...stylex.props(ps.part, ps.val, fx.focus)}>{f.value}</button>}
            />
            <button type="button" aria-label={`Remove ${def.label} filter`} onClick={() => onFiltersChange(filters.filter((_, j) => j !== i))} {...stylex.props(ps.x, fx.focus)}>
              <XIcon size={13} />
            </button>
          </span>
        );
      })}
      <input aria-label="Search text" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={filters.length ? 'Add text…' : placeholder} {...stylex.props(ps.input)} />
    </div>
  );
}
// #endregion

// #region KanbanBoard
export type KanbanColumn<T> = { id: string; title: string; tone?: Tone; items: T[] };
const kb = stylex.create({
  board: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, minWidth: 0, alignItems: 'flex-start', scrollSnapType: { default: 'none', '@media (max-width: 640px)': 'x mandatory' } },
  col: { flex: { default: '1 0 260px', '@media (max-width: 640px)': '0 0 86%' }, maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 6, padding: 6, borderRadius: 20, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, scrollSnapAlign: 'start', transitionProperty: 'border-color, background-color', transitionDuration: '160ms' },
  over: { borderColor: accent.base, backgroundColor: `color-mix(in oklab, ${accent.base} 5%, ${colors.well})` },
  head: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px 4px' },
  title: { fontSize: font.sm, fontWeight: 500, color: colors.text, flexGrow: 1 },
  count: { fontFamily: font.mono, fontSize: 11, color: colors.textMuted },
  list: { display: 'flex', flexDirection: 'column', gap: 6, minHeight: 40 },
  card: { position: 'relative', padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, cursor: 'grab', boxShadow: '0 1px 1px rgba(0,0,0,0.03)', transitionProperty: 'transform, box-shadow, opacity', transitionDuration: '160ms' },
  dragging: { opacity: 0.45 },
  move: { position: 'absolute', top: 6, right: 6 },
  empty: { padding: '14px 8px', textAlign: 'center', fontSize: font.xs, color: colors.textSubtle, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: 12 },
});
/**
 * Columns of cards. Drag a card to another column, or use its "…" menu
 * (keyboard and touch alternative to dragging).
 */
export function KanbanBoard<T>({
  columns,
  onMove,
  getId,
  renderCard,
  onAdd,
}: {
  columns: KanbanColumn<T>[];
  onMove: (itemId: string, toColumn: string) => void;
  getId: (t: T) => string;
  renderCard: (t: T) => ReactNode;
  onAdd?: (column: string) => void;
}) {
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  return (
    <div {...stylex.props(kb.board)}>
      {columns.map((c) => (
        <section
          key={c.id}
          aria-label={`${c.title}, ${c.items.length} items`}
          onDragOver={(e) => (e.preventDefault(), setOver(c.id))}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            if (id) onMove(id, c.id);
            setOver(null);
            setDrag(null);
          }}
          {...stylex.props(kb.col, over === c.id && kb.over)}
        >
          <div {...stylex.props(kb.head)}>
            {c.tone && <StatusDot tone={c.tone} />}
            <span {...stylex.props(kb.title)}>{c.title}</span>
            <span {...stylex.props(kb.count)}>{c.items.length}</span>
            {onAdd && (
              <button type="button" aria-label={`Add to ${c.title}`} onClick={() => onAdd(c.id)} {...stylex.props(ps.x, fx.focus)} style={{ borderRadius: 7 }}>
                <Plus size={14} />
              </button>
            )}
          </div>
          <div {...stylex.props(kb.list)}>
            {c.items.length === 0 && <div {...stylex.props(kb.empty)}>Drop cards here</div>}
            {c.items.map((it) => {
              const id = getId(it);
              return (
                <article
                  key={id}
                  draggable
                  onDragStart={(e) => (e.dataTransfer.setData('text/plain', id), setDrag(id))}
                  onDragEnd={() => (setDrag(null), setOver(null))}
                  {...stylex.props(kb.card, drag === id && kb.dragging)}
                >
                  {renderCard(it)}
                  <span {...stylex.props(kb.move)}>
                    <DropdownMenu
                      label="Move card"
                      placement="bottom-end"
                      items={[{ type: 'label', label: 'Move to' }, ...columns.filter((x) => x.id !== c.id).map((x) => ({ label: x.title, onSelect: () => onMove(id, x.id) }))]}
                      trigger={
                        <button type="button" aria-label="Move card" {...stylex.props(ps.x, fx.focus)} style={{ borderRadius: 7 }}>
                          <Ellipsis size={14} />
                        </button>
                      }
                    />
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
// #endregion

// #region ActivityFeed
export type Activity = { id: string; who: string; action: ReactNode; detail?: ReactNode; when: ReactNode; icon?: ReactNode };
const af = stylex.create({
  list: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' },
  item: { position: 'relative', display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) auto', gap: 12, paddingBottom: 16 },
  rail: { position: 'absolute', left: 13, top: 30, bottom: 2, width: 1, backgroundColor: colors.border },
  dot: { width: 28, height: 28, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.well, color: colors.textMuted, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, position: 'relative', zIndex: 1 },
  line: { fontSize: font.sm, color: colors.text, lineHeight: 1.45, paddingTop: 4 },
  who: { fontWeight: 500 },
  detail: { marginTop: 4, fontSize: font.sm, color: colors.textMuted, lineHeight: 1.5 },
  when: { fontSize: font.xs, color: colors.textSubtle, whiteSpace: 'nowrap', paddingTop: 5 },
});
/** Vertical timeline of events with icons and a connecting rail. */
export function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <ol {...stylex.props(af.list)}>
      {items.map((a, i) => (
        <li key={a.id} {...stylex.props(af.item)}>
          {i < items.length - 1 && <span aria-hidden {...stylex.props(af.rail)} />}
          <span {...stylex.props(af.dot)}>{a.icon ?? <Avatar name={a.who} size="xs" />}</span>
          <div style={{ minWidth: 0 }}>
            <div {...stylex.props(af.line)}>
              <span {...stylex.props(af.who)}>{a.who}</span> {a.action}
            </div>
            {a.detail && <div {...stylex.props(af.detail)}>{a.detail}</div>}
          </div>
          <span {...stylex.props(af.when)}>{a.when}</span>
        </li>
      ))}
    </ol>
  );
}
// #endregion
