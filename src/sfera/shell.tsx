import * as stylex from '@stylexjs/stylex';
import { useState, type ReactNode } from 'react';
import { ChevronsUpDown, Menu, PanelLeft } from 'lucide-react';
import { colors, font, radius, space } from './tokens.stylex';
import { IconButton } from './action';
import { Drawer } from './overlay';
import { useMediaQuery } from './hooks';
import { Avatar } from './content';
import { fx } from './shared';

// #region AppShell
const sh = stylex.create({
  root: { display: 'flex', minHeight: '100%', width: '100%', backgroundColor: colors.page, minWidth: 0 },
  side: {
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    display: { default: 'flex', '@media (max-width: 900px)': 'none' },
    flexDirection: 'column',
    gap: 8,
    width: 248,
    flexShrink: 0,
    height: '100dvh',
    maxHeight: '100%',
    padding: 10,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
    backgroundColor: colors.page,
    overflowY: 'auto',
  },
  sideInner: { display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1, minHeight: 0 },
  collapsed: { display: 'none' },
  main: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  top: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingInline: { default: 20, '@media (max-width: 640px)': 12 },
    backgroundColor: colors.page,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  menuBtn: { display: { default: 'none', '@media (max-width: 900px)': 'inline-flex' } },
  collapseBtn: { display: { default: 'inline-flex', '@media (max-width: 900px)': 'none' } },
  topContent: { flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 },
  body: { flexGrow: 1, minWidth: 0, padding: { default: '24px 28px 40px', '@media (max-width: 640px)': '16px 16px 32px' } },
  flush: { padding: 0, display: 'flex', minHeight: 0 },
});
/**
 * App frame: sidebar on desktop, drawer on phones, sticky top bar.
 * Pass the same `sidebar` node; it is reused inside the drawer.
 */
export function AppShell({ sidebar, topbar, children, flush }: { sidebar: ReactNode; topbar?: ReactNode; children: ReactNode; flush?: boolean }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const small = useMediaQuery('(max-width: 900px)');
  return (
    <div {...stylex.props(sh.root)}>
      <aside {...stylex.props(sh.side, collapsed && sh.collapsed)} aria-label="Sidebar">
        <div {...stylex.props(sh.sideInner)}>{sidebar}</div>
      </aside>
      <div {...stylex.props(sh.main)}>
        <div {...stylex.props(sh.top)}>
          <span {...stylex.props(sh.menuBtn)}>
            <IconButton label="Open menu" icon={<Menu size={18} />} onClick={() => setOpen(true)} />
          </span>
          <span {...stylex.props(sh.collapseBtn)}>
            <IconButton label={collapsed ? 'Show sidebar' : 'Hide sidebar'} icon={<PanelLeft size={17} />} onClick={() => setCollapsed(!collapsed)} />
          </span>
          <div {...stylex.props(sh.topContent)}>{topbar}</div>
        </div>
        <main {...stylex.props(sh.body, flush && sh.flush)}>{children}</main>
      </div>
      {small && (
        <Drawer open={open} onClose={() => setOpen(false)} side="left">
          <div onClick={(e) => (e.target as HTMLElement).closest('button[aria-current], button:not([aria-expanded])') && setOpen(false)} {...stylex.props(sh.sideInner)}>
            {sidebar}
          </div>
        </Drawer>
      )}
    </div>
  );
}
// #endregion

// #region WorkspaceSwitcher
const ws = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: 6,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    cursor: 'pointer',
    textAlign: 'left',
    color: colors.text,
  },
  mark: { width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },
  text: { display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 },
  name: { fontSize: font.md, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontSize: font.xs, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chev: { color: colors.textSubtle, flexShrink: 0 },
});
export function WorkspaceSwitcher({ name, subtitle, mark, color = '#121214', onClick }: { name: string; subtitle?: string; mark?: ReactNode; color?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} {...stylex.props(ws.root, fx.focus)}>
      <span {...stylex.props(ws.mark)} style={{ backgroundColor: color }}>
        {mark ?? name[0]}
      </span>
      <span {...stylex.props(ws.text)}>
        <span {...stylex.props(ws.name)}>{name}</span>
        {subtitle && <span {...stylex.props(ws.sub)}>{subtitle}</span>}
      </span>
      <ChevronsUpDown size={15} {...stylex.props(ws.chev)} />
    </button>
  );
}
// #endregion

// #region UserCard
const uc = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    marginTop: 'auto',
    borderRadius: 14,
    backgroundColor: colors.well,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
  },
  text: { display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 },
  name: { fontSize: font.sm, fontWeight: 500, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  mail: { fontSize: font.xs, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});
/** Signed-in user at the foot of a sidebar. */
export function UserCard({ name, email, action }: { name: string; email: string; action?: ReactNode }) {
  return (
    <div {...stylex.props(uc.root)}>
      <Avatar name={name} size="md" presence="online" />
      <div {...stylex.props(uc.text)}>
        <span {...stylex.props(uc.name)}>{name}</span>
        <span {...stylex.props(uc.mail)}>{email}</span>
      </div>
      {action}
    </div>
  );
}
// #endregion

export const shellSpace = space;
export const shellRadius = radius;

// #region AuthShell
const au = stylex.create({
  root: { minHeight: '100dvh', display: 'grid', gridTemplateColumns: { default: 'minmax(0, 1fr) minmax(0, 1fr)', '@media (max-width: 900px)': 'minmax(0, 1fr)' }, backgroundColor: colors.page },
  form: { display: 'flex', flexDirection: 'column', padding: { default: '28px 40px', '@media (max-width: 640px)': '20px 16px' }, minWidth: 0 },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  center: { flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBlock: 32 },
  inner: { width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20 },
  foot: { fontSize: font.xs, color: colors.textSubtle, textAlign: 'center' },
  side: { display: { default: 'flex', '@media (max-width: 900px)': 'none' }, padding: 10 },
  panel: { flexGrow: 1, borderRadius: 28, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  single: { gridTemplateColumns: 'minmax(0, 1fr)' },
});
/** Sign-in / sign-up frame: form column plus a showcase well that hides on small screens. */
export function AuthShell({ brand, topRight, children, aside, footer }: { brand: ReactNode; topRight?: ReactNode; children: ReactNode; aside?: ReactNode; footer?: ReactNode }) {
  return (
    <div {...stylex.props(au.root, !aside && au.single)}>
      <div {...stylex.props(au.form)}>
        <div {...stylex.props(au.top)}>
          {brand}
          {topRight}
        </div>
        <div {...stylex.props(au.center)}>
          <div {...stylex.props(au.inner)}>{children}</div>
        </div>
        {footer && <div {...stylex.props(au.foot)}>{footer}</div>}
      </div>
      {aside && (
        <div {...stylex.props(au.side)} aria-hidden>
          <div {...stylex.props(au.panel)}>{aside}</div>
        </div>
      )}
    </div>
  );
}
// #endregion
