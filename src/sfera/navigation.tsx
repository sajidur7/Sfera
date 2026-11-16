import * as stylex from '@stylexjs/stylex';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check as CheckIcon, ChevronDown, ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { accent, colors, control, font, motion, radius, shadows, space } from './tokens.stylex';
import { fx } from './shared';
import { useControllable, useDismiss } from './hooks';
import { Button } from './action';
import { DropdownMenu } from './overlay';

// #region SideNav
const sn = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  section: { display: 'flex', flexDirection: 'column', gap: 1 },
  heading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 10,
    paddingBlock: '14px 6px',
    fontSize: font.xs,
    fontWeight: 500,
    color: colors.textSubtle,
  },
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    minHeight: 34,
    paddingInline: 10,
    borderWidth: 0,
    borderRadius: radius.control,
    fontSize: font.md,
    textAlign: 'left',
    textDecoration: 'none',
    color: { default: colors.textMuted, ':hover': colors.text },
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    cursor: 'pointer',
    transitionProperty: 'background-color, color, transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    transform: { default: null, ':active': 'scale(0.985)' },
  },
  active: {
    color: { default: accent.onAccent, ':hover': accent.onAccent },
    backgroundColor: { default: accent.base, ':hover': accent.base },
  },
  activeSoft: {
    color: { default: colors.text, ':hover': colors.text },
    backgroundColor: { default: colors.pressed, ':hover': colors.pressed },
  },
  sub: { minHeight: { default: 30, '@media (pointer: coarse)': 40 }, fontSize: font.sm, paddingLeft: 36 },
  icon: { display: 'inline-flex', flexShrink: 0, width: 18, justifyContent: 'center' },
  label: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  count: {
    minWidth: 22,
    height: 20,
    paddingInline: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    fontSize: 11,
    fontFamily: font.mono,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: colors.well,
    color: colors.textMuted,
  },
  countActive: { backgroundColor: 'rgba(255,255,255,0.2)', color: accent.onAccent },
  chev: { color: 'inherit', opacity: 0.7, transitionProperty: 'transform', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  chevOpen: { transform: 'rotate(90deg)' },
  children: { display: 'grid', gridTemplateRows: '0fr', transitionProperty: 'grid-template-rows', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  childrenOpen: { gridTemplateRows: '1fr' },
  childrenInner: { overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 1 },
});
export type NavItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number | string;
  children?: NavItem[];
};
export function SideNav({ children, label = 'Main' }: { children: ReactNode; label?: string }) {
  return (
    <nav aria-label={label} {...stylex.props(sn.root)}>
      {children}
    </nav>
  );
}
export function SideNavSection({ title, action, children }: { title?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <div {...stylex.props(sn.section)}>
      {title && (
        <div {...stylex.props(sn.heading)}>
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
/**
 * Sidebar item. Active = filled with the accent, white text.
 * `soft` uses a grey fill instead (for secondary navs). Items with `children` expand.
 */
export function SideNavItem({
  item,
  active,
  onSelect,
  soft,
  depth = 0,
}: {
  item: NavItem;
  active?: string;
  onSelect: (id: string) => void;
  soft?: boolean;
  depth?: number;
}) {
  const hasKids = !!item.children?.length;
  const childActive = item.children?.some((c) => c.id === active);
  const [open, setOpen] = useState(!!childActive);
  const isActive = active === item.id;
  return (
    <>
      <button
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasKids ? open : undefined}
        onClick={() => (hasKids ? setOpen(!open) : onSelect(item.id))}
        {...stylex.props(sn.item, depth > 0 && sn.sub, isActive && (soft ? sn.activeSoft : sn.active), fx.focus)}
      >
        {item.icon && depth === 0 && <span {...stylex.props(sn.icon)}>{item.icon}</span>}
        <span {...stylex.props(sn.label)}>{item.label}</span>
        {item.count !== undefined && <span {...stylex.props(sn.count, isActive && !soft && sn.countActive)}>{item.count}</span>}
        {hasKids && <ChevronRight size={15} {...stylex.props(sn.chev, open && sn.chevOpen)} />}
      </button>
      {hasKids && (
        <div {...stylex.props(sn.children, open && sn.childrenOpen)}>
          <div {...stylex.props(sn.childrenInner)} inert={!open}>
            {item.children!.map((c) => (
              <SideNavItem key={c.id} item={c} active={active} onSelect={onSelect} soft depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
// #endregion

// #region Tabs
export type TabItem = { id: string; label: ReactNode; count?: number; icon?: ReactNode };
const tbs = stylex.create({
  list: {
    position: 'relative',
    display: 'flex',
    gap: 2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    maxWidth: '100%',
  },
  tab: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingInline: 10,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: font.md,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: { default: colors.textMuted, ':hover': colors.text },
    flexShrink: 0,
    borderRadius: 8,
  },
  on: { color: colors.text },
  count: { fontSize: 11, fontFamily: font.mono, color: colors.textSubtle },
  bar: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.text,
    transitionProperty: 'transform, width',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    pointerEvents: 'none',
  },
  panel: { paddingTop: space.s4, outlineStyle: 'none' },
});
/** Underline tabs; the indicator slides between tabs. Arrow keys move focus. */
export function Tabs({
  tabs,
  value,
  defaultValue,
  onChange,
  children,
  label,
  maxVisible,
}: {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  children?: (active: string) => ReactNode;
  label?: string;
  /** Tabs after this many go into a "More" menu (Tab Menu). */
  maxVisible?: number;
}) {
  const [v, setV] = useControllable(value, defaultValue ?? tabs[0]?.id, onChange);
  const shownTabs = maxVisible && tabs.length > maxVisible ? tabs.slice(0, maxVisible) : tabs;
  const overflow = maxVisible && tabs.length > maxVisible ? tabs.slice(maxVisible) : [];
  const overflowActive = overflow.find((t) => t.id === v);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const el = refs.current[v];
    if (!el) return;
    const m = () => setBar({ x: el.offsetLeft + 8, w: el.offsetWidth - 16 });
    m();
    const ro = new ResizeObserver(m);
    ro.observe(el);
    return () => ro.disconnect();
  }, [v, tabs.length]);
  const onKey = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === v);
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const n = tabs[(i + d + tabs.length) % tabs.length];
    setV(n.id);
    refs.current[n.id]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKey} {...stylex.props(tbs.list)}>
        {shownTabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={v === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={v === t.id ? 0 : -1}
            onClick={() => setV(t.id)}
            {...stylex.props(tbs.tab, v === t.id && tbs.on, fx.focus)}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && <span {...stylex.props(tbs.count)}>{t.count}</span>}
          </button>
        ))}
        {overflow.length > 0 && (
          <DropdownMenu
            label="More tabs"
            placement="bottom-end"
            items={overflow.map((t) => ({ type: 'radio' as const, label: t.label, value: t.id, group: 'tabs', current: v, onChange: setV }))}
            trigger={
              <button
                type="button"
                ref={(el) => {
                  if (overflowActive) refs.current[overflowActive.id] = el;
                }}
                {...stylex.props(tbs.tab, !!overflowActive && tbs.on, fx.focus)}
              >
                {overflowActive ? overflowActive.label : 'More'}
                <ChevronDown size={14} />
              </button>
            }
          />
        )}
        {bar && <span aria-hidden {...stylex.props(tbs.bar)} style={{ transform: `translateX(${bar.x}px)`, width: bar.w }} />}
      </div>
      {children && (
        <div role="tabpanel" id={`panel-${v}`} aria-labelledby={`tab-${v}`} tabIndex={0} {...stylex.props(tbs.panel)}>
          {children(v)}
        </div>
      )}
    </div>
  );
}
// #endregion

// #region Breadcrumbs
const bc = stylex.create({
  list: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, margin: 0, padding: 0, listStyle: 'none', fontSize: font.sm, minWidth: 0 },
  item: { display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 },
  link: {
    minHeight: { default: 0, '@media (pointer: coarse)': 32 },
    display: 'inline-flex',
    alignItems: 'center',
    color: { default: colors.textMuted, ':hover': colors.text },
    textDecoration: 'none',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: '2px 4px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 'inherit',
  },
  current: { color: colors.text, fontWeight: 500, paddingInline: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sep: { color: colors.textSubtle, display: 'inline-flex' },
});
export function Breadcrumbs({ items, onNavigate }: { items: { id: string; label: ReactNode }[]; onNavigate?: (id: string) => void }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol {...stylex.props(bc.list)}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.id} {...stylex.props(bc.item)}>
              {last ? (
                <span aria-current="page" {...stylex.props(bc.current)}>
                  {it.label}
                </span>
              ) : (
                <button type="button" onClick={() => onNavigate?.(it.id)} {...stylex.props(bc.link, fx.focus)}>
                  {it.label}
                </button>
              )}
              {!last && (
                <span aria-hidden {...stylex.props(bc.sep)}>
                  <ChevronRight size={14} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
// #endregion

// #region Pagination
const pg = stylex.create({
  root: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space.s2, flexWrap: 'wrap', width: '100%' },
  pages: { display: 'flex', alignItems: 'center', gap: 2 },
  page: {
    minWidth: control.sm,
    height: control.sm,
    paddingInline: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    fontSize: font.sm,
    fontVariantNumeric: 'tabular-nums',
    color: colors.textMuted,
    cursor: 'pointer',
  },
  on: { color: colors.text, backgroundColor: { default: colors.surface, ':hover': colors.surface }, borderColor: colors.border, boxShadow: '0 1px 1px rgba(0,0,0,0.04)' },
  gap: { color: colors.textSubtle, paddingInline: 4, fontSize: font.sm },
  hideSm: { display: { default: 'flex', '@media (max-width: 480px)': 'none' } },
  summary: { fontSize: font.sm, color: colors.textMuted, display: { default: 'none', '@media (max-width: 480px)': 'inline' } },
});
function range(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (page >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', page - 1, page, page + 1, '…', total];
}
export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <nav aria-label="Pagination" {...stylex.props(pg.root)}>
      <Button size="sm" variant="ghost" iconStart={<ArrowLeft size={14} />} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </Button>
      <div {...stylex.props(pg.pages, pg.hideSm)}>
        {range(page, total).map((p, i) =>
          p === '…' ? (
            <span key={`g${i}`} {...stylex.props(pg.gap)}>
              …
            </span>
          ) : (
            <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)} {...stylex.props(pg.page, p === page && pg.on, fx.focus)}>
              {p}
            </button>
          ),
        )}
      </div>
      <span {...stylex.props(pg.summary)}>
        Page {page} of {total}
      </span>
      <Button size="sm" variant="secondary" iconEnd={<ArrowRight size={14} />} disabled={page >= total} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}
// #endregion


// #region TopNav
export type TopNavLink = { id: string; label: string; menu?: { id: string; label: string; description?: string; icon?: ReactNode }[]; featured?: { title: string; description: string } };
const megaIn = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(-4px)' }, to: { opacity: 1, transform: 'none' } });
const tn = stylex.create({
  bar: { position: 'relative', display: 'flex', alignItems: 'center', gap: 16, height: 56, paddingInline: 16, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, backgroundColor: colors.page, minWidth: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: font.lg, letterSpacing: '-0.02em', flexShrink: 0 },
  links: { display: { default: 'flex', '@media (max-width: 760px)': 'none' }, alignItems: 'center', gap: 2, flexGrow: 1 },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingInline: 10,
    borderWidth: 0,
    borderRadius: 999,
    fontSize: font.md,
    color: { default: colors.textMuted, ':hover': colors.text },
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    cursor: 'pointer',
  },
  on: { color: colors.text, backgroundColor: colors.well },
  chev: { transitionProperty: 'transform', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  chevOpen: { transform: 'rotate(180deg)' },
  end: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 },
  mobile: { display: { default: 'none', '@media (max-width: 760px)': 'inline-flex' }, marginLeft: 'auto' },
  mega: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 12,
    right: 12,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(200px, 1fr)',
    gap: 8,
    padding: 8,
    backgroundColor: colors.well,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
    boxShadow: shadows.raised,
    animationName: megaIn,
    animationDuration: motion.base,
    animationTimingFunction: motion.ease,
  },
  megaList: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2, padding: 6, backgroundColor: colors.surface, borderRadius: 16 },
  megaItem: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, borderWidth: 0, borderRadius: 12, textAlign: 'left', backgroundColor: { default: 'transparent', ':hover': colors.hover }, cursor: 'pointer', color: colors.text },
  megaIcon: { width: 30, height: 30, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.well, color: colors.textMuted, flexShrink: 0 },
  megaText: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  megaLabel: { fontSize: font.md, fontWeight: 500 },
  megaDesc: { fontSize: font.xs, color: colors.textMuted, lineHeight: 1.4 },
  featured: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4, padding: 16, borderRadius: 16, backgroundColor: accent.base, color: accent.onAccent, minHeight: 140 },
  featTitle: { fontSize: font.lg, fontWeight: 500 },
  featDesc: { fontSize: font.sm, opacity: 0.85 },
});
/** Horizontal app/site navigation. Links with `menu` open a mega menu. Collapses to a menu button on phones. */
export function TopNav({ brand, links, active, onSelect, end, onOpenMobile }: { brand: ReactNode; links: TopNavLink[]; active?: string; onSelect: (id: string) => void; end?: ReactNode; onOpenMobile?: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(!!open, () => setOpen(null), [ref]);
  const cur = links.find((l) => l.id === open);
  return (
    <div ref={ref} {...stylex.props(tn.bar)}>
      <span {...stylex.props(tn.brand)}>{brand}</span>
      <nav aria-label="Primary" {...stylex.props(tn.links)}>
        {links.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-expanded={l.menu ? open === l.id : undefined}
            aria-current={active === l.id ? 'page' : undefined}
            onClick={() => (l.menu ? setOpen(open === l.id ? null : l.id) : (onSelect(l.id), setOpen(null)))}
            {...stylex.props(tn.link, (active === l.id || open === l.id) && tn.on, fx.focus)}
          >
            {l.label}
            {l.menu && <ChevronDown size={14} {...stylex.props(tn.chev, open === l.id && tn.chevOpen)} />}
          </button>
        ))}
      </nav>
      {end && <div {...stylex.props(tn.end)}>{end}</div>}
      {onOpenMobile && (
        <span {...stylex.props(tn.mobile)}>
          <Button variant="ghost" size="sm" onClick={onOpenMobile} iconStart={<MenuIcon size={16} />}>
            Menu
          </Button>
        </span>
      )}
      {cur?.menu && (
        <div {...stylex.props(tn.mega)} role="menu" aria-label={cur.label}>
          <div {...stylex.props(tn.megaList)}>
            {cur.menu.map((m) => (
              <button key={m.id} type="button" role="menuitem" onClick={() => (onSelect(m.id), setOpen(null))} {...stylex.props(tn.megaItem, fx.focus)}>
                {m.icon && <span {...stylex.props(tn.megaIcon)}>{m.icon}</span>}
                <span {...stylex.props(tn.megaText)}>
                  <span {...stylex.props(tn.megaLabel)}>{m.label}</span>
                  {m.description && <span {...stylex.props(tn.megaDesc)}>{m.description}</span>}
                </span>
              </button>
            ))}
          </div>
          {cur.featured && (
            <div {...stylex.props(tn.featured)}>
              <span {...stylex.props(tn.featTitle)}>{cur.featured.title}</span>
              <span {...stylex.props(tn.featDesc)}>{cur.featured.description}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// #endregion

// #region MobileNav
const mn = stylex.create({
  bar: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    padding: '6px 8px calc(6px + env(safe-area-inset-bottom, 0px))',
    backgroundColor: colors.page,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  item: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 48,
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: 'transparent',
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transform: { default: null, ':active': 'scale(0.94)' },
    transitionProperty: 'transform, color',
    transitionDuration: motion.fast,
  },
  on: { color: accent.base },
  pill: { position: 'absolute', top: 4, width: 40, height: 26, borderRadius: 999, backgroundColor: `color-mix(in oklab, ${accent.base} 12%, transparent)` },
  icon: { position: 'relative', display: 'inline-flex' },
  badge: { position: 'absolute', top: -4, right: -10, minWidth: 16, height: 16, paddingInline: 4, borderRadius: 999, backgroundColor: colors.danger, color: '#fff', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2px ${colors.page}` },
});
/** Bottom tab bar for phones: up to 5 top-level destinations, icon + label. */
export function MobileNav({ items, active, onSelect }: { items: { id: string; label: string; icon: ReactNode; badge?: number }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Main" {...stylex.props(mn.bar)}>
      {items.slice(0, 5).map((it) => (
        <button key={it.id} type="button" aria-current={active === it.id ? 'page' : undefined} onClick={() => onSelect(it.id)} {...stylex.props(mn.item, active === it.id && mn.on, fx.focus)}>
          {active === it.id && <span aria-hidden {...stylex.props(mn.pill)} />}
          <span {...stylex.props(mn.icon)}>
            {it.icon}
            {it.badge ? <span {...stylex.props(mn.badge)}>{it.badge}</span> : null}
          </span>
          {it.label}
        </button>
      ))}
    </nav>
  );
}
// #endregion

// #region Stepper
const stp = stylex.create({
  list: { display: 'flex', alignItems: 'flex-start', margin: 0, padding: 0, listStyle: 'none', gap: 0, width: '100%' },
  vertical: { flexDirection: 'column' },
  step: { display: 'flex', alignItems: 'flex-start', gap: 10, flex: '1 1 0', minWidth: 0 },
  stepV: { flex: 'none', paddingBottom: 18, position: 'relative' },
  dot: { width: { default: 26, '@media (pointer: coarse)': 32 }, height: { default: 26, '@media (pointer: coarse)': 32 }, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontFamily: font.mono, borderWidth: 1, borderStyle: 'solid', borderColor: colors.borderStrong, color: colors.textMuted, backgroundColor: colors.surface, transitionProperty: 'background-color, border-color, color', transitionDuration: motion.base },
  done: { backgroundColor: accent.base, borderColor: accent.base, color: accent.onAccent },
  current: { borderColor: accent.base, color: accent.base, boxShadow: `0 0 0 3px color-mix(in oklab, ${accent.base} 18%, transparent)` },
  text: { display: { default: 'flex', '@media (max-width: 560px)': 'none' }, flexDirection: 'column', gap: 1, minWidth: 0, paddingTop: 3 },
  textV: { display: 'flex' },
  label: { fontSize: font.sm, fontWeight: 500, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  desc: { fontSize: font.xs, color: colors.textMuted },
  line: { flexGrow: 1, height: 1, marginTop: 13, marginInline: 10, backgroundColor: colors.border, minWidth: 12 },
  lineDone: { backgroundColor: accent.base },
  lineV: { position: 'absolute', left: 12, top: 30, bottom: 2, width: 1, height: 'auto', margin: 0 },
});
/** Steps of a multi-step flow. Shows where you are and lets you go back to finished steps. */
export function Stepper({ steps, current, onStepClick, orientation = 'horizontal' }: { steps: { label: string; description?: string }[]; current: number; onStepClick?: (i: number) => void; orientation?: 'horizontal' | 'vertical' }) {
  const v = orientation === 'vertical';
  return (
    <ol aria-label="Progress" {...stylex.props(stp.list, v && stp.vertical)}>
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        const clickable = onStepClick && i < current;
        return (
          <li key={i} aria-current={state === 'current' ? 'step' : undefined} {...stylex.props(stp.step, v && stp.stepV)} style={!v && i === steps.length - 1 ? { flex: '0 0 auto' } : undefined}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              aria-label={`Step ${i + 1}: ${s.label}${state === 'done' ? ' (done)' : ''}`}
              {...stylex.props(stp.dot, state === 'done' && stp.done, state === 'current' && stp.current, fx.focus)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              {state === 'done' ? <CheckIcon size={13} strokeWidth={3} /> : i + 1}
            </button>
            <span {...stylex.props(stp.text, v && stp.textV)}>
              <span {...stylex.props(stp.label)}>{s.label}</span>
              {s.description && <span {...stylex.props(stp.desc)}>{s.description}</span>}
            </span>
            {i < steps.length - 1 && <span aria-hidden {...stylex.props(stp.line, i < current && stp.lineDone, v && stp.lineV)} />}
          </li>
        );
      })}
    </ol>
  );
}
// #endregion

// #region Outline
const ol = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 1, borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: colors.border, margin: 0, padding: 0, listStyle: 'none' },
  title: { fontSize: 11, fontFamily: font.mono, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textSubtle, marginBottom: 8 },
  link: {
    display: 'block',
    marginLeft: -1,
    padding: { default: '5px 12px', '@media (pointer: coarse)': '10px 12px' },
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: 'transparent',
    fontSize: font.sm,
    color: { default: colors.textMuted, ':hover': colors.text },
    textDecoration: 'none',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
  },
  sub: { paddingLeft: 24 },
  on: { color: colors.text, borderLeftColor: accent.base, fontWeight: 500 },
});
/** "On this page" outline. Highlights the section in view; click to scroll to it. */
export function Outline({ items, title = 'On this page', root }: { items: { id: string; label: string; depth?: 1 | 2 }[]; title?: string; root?: HTMLElement | null }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { root: root ?? null, rootMargin: '0px 0px -60% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items, root]);
  return (
    <nav aria-label={title}>
      <div {...stylex.props(ol.title)}>{title}</div>
      <ul {...stylex.props(ol.root)}>
        {items.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              aria-current={active === i.id ? 'location' : undefined}
              onClick={() => {
                setActive(i.id);
                document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              {...stylex.props(ol.link, i.depth === 2 && ol.sub, active === i.id && ol.on, fx.focus)}
            >
              {i.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
// #endregion

// #region TreeList
export type TreeNode = { id: string; label: string; icon?: ReactNode; children?: TreeNode[]; meta?: ReactNode };
const tr = stylex.create({
  root: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1 },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    minHeight: { default: 30, '@media (pointer: coarse)': 40 },
    paddingRight: 8,
    borderWidth: 0,
    borderRadius: 8,
    textAlign: 'left',
    fontSize: font.sm,
    color: colors.text,
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    cursor: 'pointer',
  },
  on: { backgroundColor: { default: colors.pressed, ':hover': colors.pressed }, fontWeight: 500 },
  twisty: { width: 18, display: 'inline-flex', justifyContent: 'center', color: colors.textMuted, flexShrink: 0, transitionProperty: 'transform', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  open: { transform: 'rotate(90deg)' },
  icon: { display: 'inline-flex', color: colors.textMuted, flexShrink: 0 },
  label: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { fontSize: 11, fontFamily: font.mono, color: colors.textSubtle },
  indent: (px: string) => ({ paddingLeft: px }),
});
/** Nested, collapsible tree (files, folders, org charts). Arrow keys: Right opens, Left closes. */
export function TreeList({ nodes, selected, onSelect, defaultExpanded = [], label }: { nodes: TreeNode[]; selected?: string; onSelect?: (id: string) => void; defaultExpanded?: string[]; label: string }) {
  const [exp, setExp] = useState<string[]>(defaultExpanded);
  const toggle = (id: string, to?: boolean) => setExp((e) => ((to ?? !e.includes(id)) ? [...new Set([...e, id])] : e.filter((x) => x !== id)));
  const render = (list: TreeNode[], depth: number): ReactNode =>
    list.map((n) => {
      const kids = !!n.children?.length;
      const open = exp.includes(n.id);
      return (
        <li key={n.id} role="treeitem" aria-expanded={kids ? open : undefined} aria-selected={selected === n.id}>
          <button
            type="button"
            onClick={() => (kids && toggle(n.id), onSelect?.(n.id))}
            onKeyDown={(e) => (e.key === 'ArrowRight' && kids ? toggle(n.id, true) : e.key === 'ArrowLeft' && kids ? toggle(n.id, false) : null)}
            {...stylex.props(tr.row, selected === n.id && tr.on, tr.indent(`${depth * 16 + 4}px`), fx.focus)}
          >
            <span {...stylex.props(tr.twisty, open && tr.open)}>{kids && <ChevronRight size={14} />}</span>
            {n.icon && <span {...stylex.props(tr.icon)}>{n.icon}</span>}
            <span {...stylex.props(tr.label)}>{n.label}</span>
            {n.meta && <span {...stylex.props(tr.meta)}>{n.meta}</span>}
          </button>
          {kids && open && (
            <ul role="group" {...stylex.props(tr.root)}>
              {render(n.children!, depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  return (
    <ul role="tree" aria-label={label} {...stylex.props(tr.root)}>
      {render(nodes, 0)}
    </ul>
  );
}
// #endregion
