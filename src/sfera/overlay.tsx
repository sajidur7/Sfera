import * as stylex from '@stylexjs/stylex';
import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Ellipsis, Info, Search, X } from 'lucide-react';
import { accent, colors, font, motion, radius, shadows, space } from './tokens.stylex';
import { fx } from './shared';
import { useAnchoredPosition, useDismiss, useSfera, usePresence, type Placement } from './hooks';
import { Button, IconButton } from './action';
import { menuStyles } from './forms';

function Portal({ children }: { children: ReactNode }) {
  const { portalRoot } = useSfera();
  return portalRoot ? createPortal(children, portalRoot) : null;
}

/** Keeps Tab inside an open dialog and restores focus to the opener on close. */
function useFocusTrap(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const sel = 'button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const t = setTimeout(() => {
      const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(sel);
      (first ?? el)?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(sel));
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) (e.preventDefault(), z.focus());
      else if (!e.shiftKey && document.activeElement === z) (e.preventDefault(), a.focus());
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, ref]);
}

// #region Dialog
const dlg = stylex.create({
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: { default: 'center', '@media (max-width: 640px)': 'flex-end' },
    justifyContent: 'center',
    // --sfera-overlay-offset lets an app with a fixed sidebar centre dialogs over its content column
    paddingBlock: { default: space.s6, '@media (max-width: 640px)': space.s2 },
    paddingRight: { default: space.s6, '@media (max-width: 640px)': space.s2 },
    paddingLeft: { default: `calc(${space.s6} + var(--sfera-overlay-offset, 0px))`, '@media (max-width: 640px)': space.s2 },
    backgroundColor: colors.scrim,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
  },
  scrimIn: { opacity: 1 },
  panel: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: 'calc(100dvh - 32px)',
    backgroundColor: colors.raised,
    borderRadius: { default: 20, '@media (max-width: 640px)': 18 },
    boxShadow: shadows.dialog,
    overflow: 'hidden',
    transform: 'translateY(8px) scale(0.97)',
    transitionProperty: 'transform',
    transitionDuration: motion.slow,
    transitionTimingFunction: motion.ease,
    outlineStyle: 'none',
  },
  panelIn: { transform: 'none' },
  sm: { maxWidth: 400 },
  md: { maxWidth: 520 },
  lg: { maxWidth: 760 },
  xl: { maxWidth: 960 },
  head: { display: 'flex', alignItems: 'flex-start', gap: space.s3, padding: '18px 18px 0 20px' },
  titles: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  title: { margin: 0, fontSize: font.lg, fontWeight: 500, letterSpacing: '-0.01em', color: colors.text },
  desc: { margin: 0, fontSize: font.sm, lineHeight: 1.5, color: colors.textMuted },
  body: { padding: '16px 20px', overflowY: 'auto', fontSize: font.md, color: colors.text, lineHeight: 1.55, minHeight: 0 },
  flush: { padding: 0 },
  foot: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: space.s2,
    padding: '12px 16px',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    backgroundColor: colors.well,
  },
});
export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  flush?: boolean;
  role?: 'dialog' | 'alertdialog';
  dismissable?: boolean;
};
export function Dialog({ open, onClose, title, description, children, footer, size = 'md', flush, role = 'dialog', dismissable = true }: DialogProps) {
  const { mounted, visible } = usePresence(open, 360);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useFocusTrap(open, ref);
  useEffect(() => {
    if (!open || !dismissable) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, onClose, dismissable]);
  if (!mounted) return null;
  return (
    <Portal>
      <div {...stylex.props(dlg.scrim, visible && dlg.scrimIn)} onPointerDown={(e) => dismissable && e.target === e.currentTarget && onClose()}>
        <div
          ref={ref}
          role={role}
          aria-modal="true"
          aria-labelledby={title ? `${id}-t` : undefined}
          aria-describedby={description ? `${id}-d` : undefined}
          tabIndex={-1}
          {...stylex.props(dlg.panel, dlg[size], visible && dlg.panelIn)}
        >
          {(title || dismissable) && (
            <div {...stylex.props(dlg.head)}>
              <div {...stylex.props(dlg.titles)}>
                {title && (
                  <h2 id={`${id}-t`} {...stylex.props(dlg.title)}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={`${id}-d`} {...stylex.props(dlg.desc)}>
                    {description}
                  </p>
                )}
              </div>
              {dismissable && <IconButton label="Close" size="sm" icon={<X size={16} />} onClick={onClose} />}
            </div>
          )}
          {children && <div {...stylex.props(dlg.body, flush && dlg.flush)}>{children}</div>}
          {footer && <div {...stylex.props(dlg.foot)}>{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
// #endregion

// #region AlertDialog
export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      size="sm"
      title={title}
      description={description}
      dismissable={false}
      footer={
        <>
          <Button onClick={onClose} data-autofocus>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
// #endregion

// #region Drawer
const drw = stylex.create({
  scrim: { alignItems: 'stretch', justifyContent: 'flex-end', padding: { default: 8, '@media (max-width: 640px)': 0 } },
  left: { justifyContent: 'flex-start' },
  panel: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: colors.raised,
    borderRadius: { default: 18, '@media (max-width: 640px)': 0 },
    boxShadow: shadows.dialog,
    overflow: 'hidden',
    transform: 'translateX(104%)',
    transitionProperty: 'transform',
    transitionDuration: motion.slow,
    transitionTimingFunction: motion.ease,
    outlineStyle: 'none',
  },
  panelLeft: { transform: 'translateX(-104%)', maxWidth: 300 },
  in: { transform: 'none' },
  body: { flexGrow: 1, overflowY: 'auto', padding: '16px 20px' },
});
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  side?: 'left' | 'right';
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const { mounted, visible } = usePresence(open, 360);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <Portal>
      <div
        {...stylex.props(dlg.scrim, drw.scrim, side === 'left' && drw.left, visible && dlg.scrimIn)}
        onPointerDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Panel'} tabIndex={-1} {...stylex.props(drw.panel, side === 'left' && drw.panelLeft, visible && drw.in)}>
          {title !== undefined && (
            <div {...stylex.props(dlg.head)}>
              <div {...stylex.props(dlg.titles)}>
                <h2 {...stylex.props(dlg.title)}>{title}</h2>
                {description && <p {...stylex.props(dlg.desc)}>{description}</p>}
              </div>
              <IconButton label="Close" size="sm" icon={<X size={16} />} onClick={onClose} />
            </div>
          )}
          <div {...stylex.props(drw.body)}>{children}</div>
          {footer && <div {...stylex.props(dlg.foot)}>{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
// #endregion

// #region Popover
const pop = stylex.create({
  panel: { minWidth: 220, maxHeight: 'none', padding: 0 },
});
type TriggerEl = ReactElement<{ onClick?: (e: React.MouseEvent) => void; ref?: React.Ref<HTMLElement>; 'aria-expanded'?: boolean; 'aria-haspopup'?: string }>;
export function Popover({
  trigger,
  children,
  placement = 'bottom-start',
  open: openProp,
  onOpenChange,
  label,
}: {
  trigger: TriggerEl;
  children: ReactNode | ((close: () => void) => ReactNode);
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  label?: string;
}) {
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const setOpen = useCallback((o: boolean) => (onOpenChange ? onOpenChange(o) : setInner(o)), [onOpenChange]);
  const anchor = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPosition(anchor, panel, open, placement);
  useDismiss(open, () => setOpen(false), [anchor, panel]);
  const close = () => setOpen(false);
  return (
    <>
      {isValidElement(trigger) &&
        cloneElement(trigger, {
          ref: anchor,
          'aria-expanded': open,
          'aria-haspopup': 'dialog',
          onClick: (e: React.MouseEvent) => {
            trigger.props.onClick?.(e);
            setOpen(!open);
          },
        })}
      {open && (
        <Portal>
          <div
            ref={panel}
            role="dialog"
            aria-label={label}
            {...stylex.props(menuStyles.panel, pop.panel)}
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, transformOrigin: pos?.origin }}
          >
            {typeof children === 'function' ? children(close) : children}
          </div>
        </Portal>
      )}
    </>
  );
}
// #endregion

// #region Tooltip
const tip = stylex.create({
  box: {
    position: 'fixed',
    zIndex: 70,
    maxWidth: 240,
    paddingBlock: 5,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: font.xs,
    lineHeight: 1.35,
    fontWeight: 500,
    color: colors.page,
    backgroundColor: colors.text,
    borderRadius: 7,
    pointerEvents: 'none',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  in: { opacity: 1 },
});
/** Tooltip: opens after a short delay on hover or focus, closes instantly. */
export function Tooltip({ content, children, placement = 'top', delay = 350 }: { content: ReactNode; children: TriggerEl; placement?: Placement; delay?: number }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const anchor = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const pos = useAnchoredPosition(anchor, box, open, placement, 6);
  useEffect(() => {
    if (pos) requestAnimationFrame(() => setShown(true));
    else setShown(false);
  }, [pos]);
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  if (!isValidElement(children)) return children;
  const child = children as ReactElement<Record<string, unknown>>;
  return (
    <>
      {cloneElement(child, {
        ref: anchor,
        'aria-describedby': open ? id : undefined,
        onPointerEnter: show,
        onPointerLeave: hide,
        onFocus: show,
        onBlur: hide,
      })}
      {open && (
        <Portal>
          <div ref={box} id={id} role="tooltip" {...stylex.props(tip.box, shown && tip.in)} style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}>
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
// #endregion

// #region DropdownMenu
export type MenuItem =
  | { type?: 'item'; label: ReactNode; icon?: ReactNode; shortcut?: ReactNode; onSelect?: () => void; danger?: boolean; disabled?: boolean }
  | { type: 'checkbox'; label: ReactNode; checked: boolean; onChange: (v: boolean) => void }
  | { type: 'radio'; label: ReactNode; value: string; group: string; current: string; onChange: (v: string) => void }
  | { type: 'divider' }
  | { type: 'label'; label: ReactNode }
  | { type: 'submenu'; label: ReactNode; icon?: ReactNode; items: MenuItem[] };
const dm = stylex.create({
  divider: { height: 1, marginBlock: 4, marginInline: -4, backgroundColor: colors.border },
  label: { paddingInline: 8, paddingBlock: '6px 4px', fontSize: font.xs, fontFamily: font.mono, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.04em' },
  danger: { color: colors.danger },
  disabled: { opacity: 0.45, cursor: 'not-allowed' },
  shortcut: { marginLeft: 'auto', paddingLeft: space.s4, display: 'inline-flex', color: colors.textSubtle },
  tick: { width: 16, display: 'inline-flex', flexShrink: 0, color: accent.base },
  radio: { width: 6, height: 6, borderRadius: '50%', backgroundColor: accent.base, marginInline: 5 },
});
export function DropdownMenu({ trigger, items, placement = 'bottom-start', label }: { trigger: TriggerEl; items: MenuItem[]; placement?: Placement; label?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [subOpen, setSubOpen] = useState<number | null>(null);
  const [subActive, setSubActive] = useState(0);
  const anchor = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const subPanel = useRef<HTMLDivElement>(null);
  const subAnchor = useRef<HTMLElement | null>(null);
  const itemEls = useRef<Record<number, HTMLDivElement | null>>({});
  const pos = useAnchoredPosition(anchor, panel, open, placement);
  const subPos = useAnchoredPosition(subAnchor, subPanel, subOpen !== null, 'right', 2);
  useDismiss(open, () => (setOpen(false), setSubOpen(null)), [anchor, panel, subPanel]);
  const openSub = (i: number, focus = false) => {
    subAnchor.current = itemEls.current[i];
    setSubOpen(i);
    setSubActive(0);
    if (focus) requestAnimationFrame(() => subPanel.current?.focus());
  };
  const actionable = items.map((it, i) => (it.type === 'divider' || it.type === 'label' || (('disabled' in it) && it.disabled) ? -1 : i)).filter((i) => i >= 0);
  useEffect(() => {
    if (open) {
      setActive(-1);
      requestAnimationFrame(() => panel.current?.focus());
    }
  }, [open]);
  const run = (it: MenuItem) => {
    if (it.type === 'submenu') return;
    if (it.type === 'checkbox') return it.onChange(!it.checked);
    if (it.type === 'radio') {
      it.onChange(it.value);
      setOpen(false);
      setSubOpen(null);
      anchor.current?.focus();
      return;
    }
    if (it.type === 'divider' || it.type === 'label') return;
    if (it.disabled) return;
    it.onSelect?.();
    setOpen(false);
    setSubOpen(null);
    anchor.current?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const at = actionable.indexOf(active);
    if (e.key === 'ArrowRight' && items[active]?.type === 'submenu') (e.preventDefault(), openSub(active, true));
    if (e.key === 'ArrowDown') (e.preventDefault(), setActive(actionable[(at + 1) % actionable.length]));
    if (e.key === 'ArrowUp') (e.preventDefault(), setActive(actionable[(at - 1 + actionable.length) % actionable.length]));
    if ((e.key === 'Enter' || e.key === ' ') && active >= 0) (e.preventDefault(), run(items[active]));
    if (e.key === 'Tab') setOpen(false);
  };
  return (
    <>
      {isValidElement(trigger) &&
        cloneElement(trigger, {
          ref: anchor,
          'aria-expanded': open,
          'aria-haspopup': 'menu',
          onClick: (e: React.MouseEvent) => {
            trigger.props.onClick?.(e);
            setOpen(!open);
          },
        })}
      {open && (
        <Portal>
          <div
            ref={panel}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={onKey}
            {...stylex.props(menuStyles.panel)}
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, transformOrigin: pos?.origin }}
          >
            {items.map((it, i) => {
              if (it.type === 'divider') return <div key={i} role="separator" {...stylex.props(dm.divider)} />;
              if (it.type === 'label') return <div key={i} {...stylex.props(dm.label)}>{it.label}</div>;
              const role = it.type === 'checkbox' ? 'menuitemcheckbox' : it.type === 'radio' ? 'menuitemradio' : 'menuitem';
              const checked = it.type === 'checkbox' ? it.checked : it.type === 'radio' ? it.current === it.value : undefined;
              const plain = it.type === undefined || it.type === 'item' ? it : null;
              if (it.type === 'submenu')
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      itemEls.current[i] = el;
                    }}
                    role="menuitem"
                    aria-haspopup="menu"
                    aria-expanded={subOpen === i}
                    onPointerEnter={() => (setActive(i), openSub(i))}
                    onClick={() => openSub(i, true)}
                    {...stylex.props(menuStyles.item, (i === active || subOpen === i) && menuStyles.active)}
                  >
                    {it.icon && <span {...stylex.props(menuStyles.muted)}>{it.icon}</span>}
                    <span {...stylex.props(fx.truncate)}>{it.label}</span>
                    <span {...stylex.props(dm.shortcut)}>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                );
              return (
                <div
                  key={i}
                  role={role}
                  aria-checked={checked}
                  aria-disabled={plain?.disabled || undefined}
                  onPointerEnter={() => (setActive(i), setSubOpen(null))}
                  onClick={() => run(it)}
                  {...stylex.props(menuStyles.item, i === active && menuStyles.active, plain?.danger && dm.danger, plain?.disabled && dm.disabled)}
                >
                  {it.type === 'checkbox' && <span {...stylex.props(dm.tick)}>{it.checked && <Check size={15} />}</span>}
                  {it.type === 'radio' && <span {...stylex.props(dm.tick)}>{checked && <span {...stylex.props(dm.radio)} />}</span>}
                  {plain?.icon && <span {...stylex.props(menuStyles.muted, plain.danger && dm.danger)}>{plain.icon}</span>}
                  <span {...stylex.props(fx.truncate)}>{it.label}</span>
                  {plain?.shortcut && <span {...stylex.props(dm.shortcut)}>{plain.shortcut}</span>}
                </div>
              );
            })}
          </div>
          {subOpen !== null && items[subOpen]?.type === 'submenu' && (() => {
            const subItems = (items[subOpen] as Extract<MenuItem, { type: 'submenu' }>).items;
            const leaf = subItems.map((x, k) => (x.type === 'divider' || x.type === 'label' ? -1 : k)).filter((k) => k >= 0);
            return (
              <div
                ref={subPanel}
                role="menu"
                tabIndex={-1}
                onKeyDown={(e) => {
                  const at = leaf.indexOf(subActive);
                  if (e.key === 'ArrowDown') (e.preventDefault(), setSubActive(leaf[(at + 1) % leaf.length]));
                  if (e.key === 'ArrowUp') (e.preventDefault(), setSubActive(leaf[(at - 1 + leaf.length) % leaf.length]));
                  if (e.key === 'Enter') (e.preventDefault(), run(subItems[subActive]));
                  if (e.key === 'ArrowLeft' || e.key === 'Escape') (e.preventDefault(), e.stopPropagation(), setSubOpen(null), panel.current?.focus());
                }}
                {...stylex.props(menuStyles.panel)}
                style={{ top: subPos?.top ?? -9999, left: subPos?.left ?? -9999 }}
              >
                {subItems.map((x, k) =>
                  x.type === 'divider' ? (
                    <div key={k} role="separator" {...stylex.props(dm.divider)} />
                  ) : x.type === 'label' ? (
                    <div key={k} {...stylex.props(dm.label)}>{x.label}</div>
                  ) : (
                    <div key={k} role={x.type === 'radio' ? 'menuitemradio' : 'menuitem'} aria-checked={x.type === 'radio' ? x.current === x.value : undefined} onPointerEnter={() => setSubActive(k)} onClick={() => run(x)} {...stylex.props(menuStyles.item, k === subActive && menuStyles.active)}>
                      {x.type === 'radio' && <span {...stylex.props(dm.tick)}>{x.current === x.value && <span {...stylex.props(dm.radio)} />}</span>}
                      {(x.type === undefined || x.type === 'item') && x.icon && <span {...stylex.props(menuStyles.muted)}>{x.icon}</span>}
                      <span {...stylex.props(fx.truncate)}>{x.label}</span>
                    </div>
                  ),
                )}
              </div>
            );
          })()}
        </Portal>
      )}
    </>
  );
}
// #endregion

// #region Toast
type ToastTone = 'neutral' | 'success' | 'danger' | 'info';
type ToastItem = { id: number; title: ReactNode; description?: ReactNode; tone: ToastTone; action?: { label: string; onClick: () => void }; leaving?: boolean };
type ToastInput = Omit<ToastItem, 'id' | 'tone' | 'leaving'> & { tone?: ToastTone; duration?: number };
const ToastCtx = createContext<(t: ToastInput) => void>(() => {});
/** `const toast = useToast(); toast({ title: 'Saved' })` */
export const useToast = () => useContext(ToastCtx);

const toastIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(12px) scale(0.96)' },
  to: { opacity: 1, transform: 'none' },
});
const tst = stylex.create({
  region: {
    position: 'fixed',
    zIndex: 80,
    right: { default: 16, '@media (max-width: 640px)': 8 },
    left: { default: 'auto', '@media (max-width: 640px)': 8 },
    bottom: { default: 16, '@media (max-width: 640px)': 8 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    width: { default: 360, '@media (max-width: 640px)': '100%' },
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 12px 12px 14px',
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 14,
    boxShadow: shadows.raised,
    animationName: toastIn,
    animationDuration: motion.slow,
    animationTimingFunction: motion.ease,
    transitionProperty: 'opacity, transform',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
  },
  leaving: { opacity: 0, transform: 'translateY(6px) scale(0.97)' },
  icon: { display: 'inline-flex', marginTop: 1, flexShrink: 0 },
  neutral: { color: colors.textMuted },
  success: { color: colors.success },
  danger: { color: colors.danger },
  info: { color: accent.base },
  text: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  title: { fontSize: font.md, fontWeight: 500, color: colors.text },
  desc: { fontSize: font.sm, color: colors.textMuted, lineHeight: 1.45 },
});
const toneIcon = { neutral: Info, success: CircleCheck, danger: CircleAlert, info: Info };
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nid = useRef(0);
  const dismiss = useCallback((id: number) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 220);
  }, []);
  const push = useCallback(
    ({ duration = 4000, tone = 'neutral', ...t }: ToastInput) => {
      const id = ++nid.current;
      setItems((xs) => [...xs.slice(-3), { id, tone, ...t }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <Portal>
        <div role="region" aria-live="polite" aria-label="Notifications" {...stylex.props(tst.region)}>
          {items.map((t) => {
            const I = toneIcon[t.tone];
            return (
              <div key={t.id} role="status" {...stylex.props(tst.toast, t.leaving && tst.leaving)}>
                <span {...stylex.props(tst.icon, tst[t.tone])}>
                  <I size={17} />
                </span>
                <div {...stylex.props(tst.text)}>
                  <span {...stylex.props(tst.title)}>{t.title}</span>
                  {t.description && <span {...stylex.props(tst.desc)}>{t.description}</span>}
                </div>
                {t.action && (
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </Button>
                )}
                <IconButton label="Dismiss" size="sm" icon={<X size={14} />} onClick={() => dismiss(t.id)} />
              </div>
            );
          })}
        </div>
      </Portal>
    </ToastCtx.Provider>
  );
}
// #endregion

// #region ContextMenu
/** Right-click (or long-press / Shift+F10) menu for any area. */
export function ContextMenu({ items, children, label = 'Context menu' }: { items: MenuItem[]; children: ReactNode; label?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const press = useRef<ReturnType<typeof setTimeout>>(undefined);
  useDismiss(!!pos, () => setPos(null), [panel]);
  useEffect(() => {
    if (pos) requestAnimationFrame(() => panel.current?.focus());
  }, [pos]);
  const openAt = (x: number, y: number) => {
    const w = 220;
    const h = items.length * 34 + 8;
    setActive(-1);
    setPos({ x: Math.min(x, window.innerWidth - w - 8), y: Math.min(y, window.innerHeight - h - 8) });
  };
  const run = (it: MenuItem) => {
    if (it.type === 'divider' || it.type === 'label' || it.type === 'submenu') return;
    if (it.type === 'checkbox') return it.onChange(!it.checked);
    if (it.type === 'radio') return it.onChange(it.value);
    if (it.disabled) return;
    it.onSelect?.();
    setPos(null);
  };
  const idx = items.map((it, i) => (it.type === 'divider' || it.type === 'label' ? -1 : i)).filter((i) => i >= 0);
  return (
    <>
      <div
        ref={area}
        tabIndex={0}
        aria-haspopup="menu"
        onContextMenu={(e) => (e.preventDefault(), openAt(e.clientX, e.clientY))}
        onKeyDown={(e) => {
          if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') {
            e.preventDefault();
            const r = area.current!.getBoundingClientRect();
            openAt(r.left + 16, r.top + 16);
          }
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          press.current = setTimeout(() => openAt(t.clientX, t.clientY), 500);
        }}
        onTouchEnd={() => clearTimeout(press.current)}
        {...stylex.props(fx.focus)}
        style={{ borderRadius: 16 }}
      >
        {children}
      </div>
      {pos && (
        <Portal>
          <div
            ref={panel}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={(e) => {
              const at = idx.indexOf(active);
              if (e.key === 'ArrowDown') (e.preventDefault(), setActive(idx[(at + 1) % idx.length]));
              if (e.key === 'ArrowUp') (e.preventDefault(), setActive(idx[(at - 1 + idx.length) % idx.length]));
              if (e.key === 'Enter' && active >= 0) run(items[active]);
            }}
            {...stylex.props(menuStyles.panel)}
            style={{ top: pos.y, left: pos.x, width: 220 }}
          >
            {items.map((it, i) =>
              it.type === 'divider' ? (
                <div key={i} role="separator" {...stylex.props(dm.divider)} />
              ) : it.type === 'label' ? (
                <div key={i} {...stylex.props(dm.label)}>{it.label}</div>
              ) : (
                <div
                  key={i}
                  role="menuitem"
                  onPointerEnter={() => setActive(i)}
                  onClick={() => run(it)}
                  {...stylex.props(menuStyles.item, i === active && menuStyles.active, (it.type === undefined || it.type === 'item') && it.danger && dm.danger)}
                >
                  {(it.type === undefined || it.type === 'item') && it.icon && <span {...stylex.props(menuStyles.muted)}>{it.icon}</span>}
                  <span {...stylex.props(fx.truncate)}>{it.label}</span>
                  {(it.type === undefined || it.type === 'item') && it.shortcut && <span {...stylex.props(dm.shortcut)}>{it.shortcut}</span>}
                </div>
              ),
            )}
          </div>
        </Portal>
      )}
    </>
  );
}
// #endregion

// #region HoverCard
const hc = stylex.create({ panel: { width: 300, maxWidth: 'calc(100vw - 16px)', padding: 14, maxHeight: 'none' } });
/** Rich preview on hover or focus (e.g. a person or a link). Delayed in, short grace period out. */
export function HoverCard({ trigger, children, placement = 'bottom-start' }: { trigger: TriggerEl; children: ReactNode; placement?: Placement }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pos = useAnchoredPosition(anchor, panel, open, placement);
  const show = () => (clearTimeout(t.current), (t.current = setTimeout(() => setOpen(true), 300)));
  const hide = () => (clearTimeout(t.current), (t.current = setTimeout(() => setOpen(false), 180)));
  const child = trigger as ReactElement<Record<string, unknown>>;
  return (
    <>
      {cloneElement(child, { ref: anchor, onPointerEnter: show, onPointerLeave: hide, onFocus: show, onBlur: hide })}
      {open && (
        <Portal>
          <div ref={panel} role="dialog" onPointerEnter={() => clearTimeout(t.current)} onPointerLeave={hide} {...stylex.props(menuStyles.panel, hc.panel)} style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}>
            {children}
          </div>
        </Portal>
      )}
    </>
  );
}
// #endregion

// #region InfoTip
const it = stylex.create({
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: { default: 18, '@media (pointer: coarse)': 32 }, height: { default: 18, '@media (pointer: coarse)': 32 }, margin: { default: 0, '@media (pointer: coarse)': -7 }, padding: 0, borderWidth: 0, borderRadius: 999, backgroundColor: 'transparent', color: { default: colors.textSubtle, ':hover': colors.text }, cursor: 'help', verticalAlign: 'middle' },
});
/** Small (i) button that explains a term. Click or focus to show. */
export function InfoTip({ children, label = 'More information' }: { children: ReactNode; label?: string }) {
  return (
    <Tooltip content={children} delay={100}>
      <button type="button" aria-label={label} {...stylex.props(it.btn, fx.focus)}>
        <Info size={14} />
      </button>
    </Tooltip>
  );
}
// #endregion

// #region BottomSheet
const bs = stylex.create({
  scrim: { alignItems: 'flex-end', padding: 0 },
  panel: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.raised,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    boxShadow: shadows.dialog,
    transform: 'translateY(100%)',
    transitionProperty: 'transform',
    transitionDuration: motion.slow,
    transitionTimingFunction: motion.ease,
    outlineStyle: 'none',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  in: { transform: 'none' },
  grip: { width: 40, height: 4, borderRadius: 999, backgroundColor: colors.borderStrong, margin: '10px auto 2px', flexShrink: 0, cursor: 'grab', touchAction: 'none' },
  body: { overflowY: 'auto', padding: '8px 20px 20px' },
});
/** Sheet that rises from the bottom; drag the grip down (or press Escape) to close. */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  const { mounted, visible } = usePresence(open, 360);
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  useFocusTrap(open, ref);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <Portal>
      <div {...stylex.props(dlg.scrim, bs.scrim, visible && dlg.scrimIn)} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
        <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Sheet'} tabIndex={-1} {...stylex.props(bs.panel, visible && bs.in)} style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}>
          <div
            aria-hidden
            {...stylex.props(bs.grip)}
            onPointerDown={(e) => ((start.current = e.clientY), (e.target as HTMLElement).setPointerCapture(e.pointerId))}
            onPointerMove={(e) => start.current !== null && setDrag(Math.max(0, e.clientY - start.current))}
            onPointerUp={() => {
              if (drag > 90) onClose();
              start.current = null;
              setDrag(0);
            }}
          />
          {title && (
            <div {...stylex.props(dlg.head)} style={{ paddingTop: 6 }}>
              <div {...stylex.props(dlg.titles)}>
                <h2 {...stylex.props(dlg.title)}>{title}</h2>
              </div>
              <IconButton label="Close" size="sm" icon={<X size={16} />} onClick={onClose} />
            </div>
          )}
          <div {...stylex.props(bs.body)}>{children}</div>
        </div>
      </div>
    </Portal>
  );
}
// #endregion

// #region CommandPalette
export type Command = { id: string; label: string; group: string; icon?: ReactNode; shortcut?: ReactNode; keywords?: string; run: () => void };
const cp = stylex.create({
  scrim: { alignItems: 'flex-start', paddingTop: { default: '12vh', '@media (max-width: 640px)': 8 } },
  panel: { maxWidth: 580 },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 52, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, color: colors.textMuted },
  input: { flexGrow: 1, minWidth: 0, height: '100%', borderWidth: 0, outlineStyle: 'none', backgroundColor: 'transparent', fontSize: { default: 15, '@media (max-width: 640px)': 16 }, color: colors.text, '::placeholder': { color: colors.textSubtle } },
  list: { maxHeight: 'min(380px, 60dvh)', overflowY: 'auto', padding: 6 },
  group: { padding: '8px 8px 4px', fontSize: 11, fontFamily: font.mono, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.05em' },
  item: { minHeight: 38 },
  empty: { padding: '28px 16px', textAlign: 'center', fontSize: font.sm, color: colors.textMuted },
  foot: { display: 'flex', gap: 14, padding: '8px 14px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border, fontSize: font.xs, color: colors.textMuted, backgroundColor: colors.well, flexWrap: 'wrap' },
  hint: { display: 'inline-flex', alignItems: 'center', gap: 6 },
});
/** Search-and-run palette. Arrow keys move, Enter runs, Escape closes. */
export function CommandPalette({ open, onClose, commands, placeholder = 'Type a command or search…', footer }: { open: boolean; onClose: () => void; commands: Command[]; placeholder?: string; footer?: ReactNode }) {
  const { mounted, visible } = usePresence(open, 220);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);
  useEffect(() => {
    if (open) (setQ(''), setActive(0));
  }, [open]);
  const shown = commands.filter((c) => (c.label + ' ' + (c.keywords ?? '') + ' ' + c.group).toLowerCase().includes(q.toLowerCase()));
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  if (!mounted) return null;
  const groups = [...new Set(shown.map((c) => c.group))];
  const run = (c?: Command) => {
    if (!c) return;
    onClose();
    c.run();
  };
  let i = -1;
  return (
    <Portal>
      <div {...stylex.props(dlg.scrim, cp.scrim, visible && dlg.scrimIn)} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          {...stylex.props(dlg.panel, cp.panel, visible && dlg.panelIn)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(shown.length - 1, a + 1)));
            if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(0, a - 1)));
            if (e.key === 'Enter') (e.preventDefault(), run(shown.filter(() => true).sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group))[active]));
          }}
        >
          <div {...stylex.props(cp.inputRow)}>
            <Search size={17} />
            <input
              data-autofocus
              role="combobox"
              aria-expanded="true"
              aria-controls="sfera-cmd-list"
              aria-activedescendant={`sfera-cmd-${active}`}
              value={q}
              onChange={(e) => (setQ(e.target.value), setActive(0))}
              placeholder={placeholder}
              {...stylex.props(cp.input)}
            />
          </div>
          <div ref={listRef} id="sfera-cmd-list" role="listbox" {...stylex.props(cp.list)}>
            {shown.length === 0 && <div {...stylex.props(cp.empty)}>No commands match “{q}”.</div>}
            {groups.map((g) => (
              <div key={g} role="group" aria-label={g}>
                <div {...stylex.props(cp.group)}>{g}</div>
                {shown
                  .filter((c) => c.group === g)
                  .map((c) => {
                    i += 1;
                    const n = i;
                    return (
                      <div
                        key={c.id}
                        id={`sfera-cmd-${n}`}
                        data-i={n}
                        role="option"
                        aria-selected={n === active}
                        onPointerMove={() => setActive(n)}
                        onClick={() => run(c)}
                        {...stylex.props(menuStyles.item, cp.item, n === active && menuStyles.active)}
                      >
                        {c.icon && <span {...stylex.props(menuStyles.muted)}>{c.icon}</span>}
                        <span {...stylex.props(fx.truncate)}>{c.label}</span>
                        {c.shortcut && <span {...stylex.props(dm.shortcut)}>{c.shortcut}</span>}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
          {footer !== null && <div {...stylex.props(cp.foot)}>{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
// #endregion

// #region Lightbox
const lb = stylex.create({
  scrim: { backgroundColor: 'rgba(8,8,10,0.86)', flexDirection: 'column', gap: 12, padding: { default: 24, '@media (max-width: 640px)': 8 } },
  img: { maxWidth: '100%', maxHeight: 'calc(100dvh - 140px)', borderRadius: 12, objectFit: 'contain', transform: 'scale(0.96)', transitionProperty: 'transform', transitionDuration: motion.slow, transitionTimingFunction: motion.ease, display: 'block' },
  imgIn: { transform: 'none' },
  bar: { display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontSize: font.sm },
  nav: { color: '#fff', backgroundColor: { default: 'rgba(255,255,255,0.12)', ':hover:not(:disabled)': 'rgba(255,255,255,0.22)' } },
  close: { position: 'absolute', top: 12, right: 12 },
});
export type LightboxItem = { src: string; alt: string; caption?: string };
/** Full-screen image viewer with arrows and keyboard (Left/Right/Escape). */
export function Lightbox({ items, index, onIndexChange, onClose }: { items: LightboxItem[]; index: number | null; onIndexChange: (i: number) => void; onClose: () => void }) {
  const open = index !== null;
  const { mounted, visible } = usePresence(open, 300);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index! < items.length - 1) onIndexChange(index! + 1);
      if (e.key === 'ArrowLeft' && index! > 0) onIndexChange(index! - 1);
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, index, items.length, onClose, onIndexChange]);
  if (!mounted || index === null) return null;
  const cur = items[index];
  return (
    <Portal>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Image viewer" {...stylex.props(dlg.scrim, lb.scrim, visible && dlg.scrimIn)} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
        <span {...stylex.props(lb.close)}>
          <IconButton label="Close viewer" variant="ghost" icon={<X size={18} />} onClick={onClose} xstyle={lb.nav} />
        </span>
        <img src={cur.src} alt={cur.alt} {...stylex.props(lb.img, visible && lb.imgIn)} />
        <div {...stylex.props(lb.bar)}>
          <IconButton label="Previous image" icon={<ChevronLeft size={18} />} disabled={index === 0} onClick={() => onIndexChange(index - 1)} xstyle={lb.nav} />
          <span>
            {cur.caption ?? cur.alt} · {index + 1} / {items.length}
          </span>
          <IconButton label="Next image" icon={<ChevronRight size={18} />} disabled={index === items.length - 1} onClick={() => onIndexChange(index + 1)} xstyle={lb.nav} />
        </div>
      </div>
    </Portal>
  );
}
// #endregion

// #region MoreMenu
/** The "…" button that opens a DropdownMenu of secondary actions. */
export function MoreMenu({ items, label = 'More actions', size = 'md' }: { items: MenuItem[]; label?: string; size?: 'sm' | 'md' }) {
  return <DropdownMenu label={label} placement="bottom-end" items={items} trigger={<IconButton size={size} label={label} icon={<Ellipsis size={16} />} />} />;
}
// #endregion
