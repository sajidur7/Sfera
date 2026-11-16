import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AccentName } from './themes';

// #region context
export type ThemeMode = 'light' | 'dark';
export type SferaContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accent: AccentName;
  setAccent: (a: AccentName) => void;
  portalRoot: HTMLElement | null;
};
export const SferaContext = createContext<SferaContextValue>({
  mode: 'light',
  setMode: () => {},
  accent: 'blue',
  setAccent: () => {},
  portalRoot: null,
});
export const useSfera = () => useContext(SferaContext);
// #endregion

// #region useControllable
/** Controlled/uncontrolled state in one hook. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : inner;
  const set = useCallback(
    (v: T) => {
      if (!isControlled) setInner(v);
      onChange?.(v);
    },
    [isControlled, onChange],
  );
  return [current, set] as const;
}
// #endregion

// #region useDismiss
/** Closes on Escape and on pointer down outside the given elements. */
export function useDismiss(open: boolean, onClose: () => void, refs: Array<React.RefObject<HTMLElement | null>>) {
  const cb = useRef(onClose);
  cb.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb.current();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refs.some((r) => r.current?.contains(t))) return;
      cb.current();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
// #endregion

// #region useAnchoredPosition
export type Placement = 'bottom-start' | 'bottom-end' | 'bottom' | 'top' | 'top-start' | 'right' | 'left';
/**
 * Positions a fixed floating element next to an anchor. Flips when there is no
 * room and clamps to the viewport with an 8px gutter, so it never causes
 * sideways scroll on a phone.
 */
export function useAnchoredPosition(
  anchor: React.RefObject<HTMLElement | null>,
  floating: React.RefObject<HTMLElement | null>,
  open: boolean,
  placement: Placement = 'bottom-start',
  offset = 6,
) {
  const [pos, setPos] = useState<{ top: number; left: number; origin: string } | null>(null);
  const update = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    const f = floating.current;
    if (!a || !f) return;
    const fw = f.offsetWidth;
    const fh = f.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const g = 8;
    let top = 0;
    let left = 0;
    let originY = 'top';
    const side = placement.split('-')[0];
    if (side === 'right' || side === 'left') {
      left = side === 'right' ? a.right + offset : a.left - fw - offset;
      if (left + fw > vw - g) left = a.left - fw - offset;
      if (left < g) left = a.right + offset;
      top = a.top + a.height / 2 - fh / 2;
    } else {
      let below = side !== 'top';
      if (below && a.bottom + offset + fh > vh - g && a.top - offset - fh > g) below = false;
      if (!below && a.top - offset - fh < g) below = true;
      top = below ? a.bottom + offset : a.top - offset - fh;
      originY = below ? 'top' : 'bottom';
      if (placement.endsWith('start')) left = a.left;
      else if (placement.endsWith('end')) left = a.right - fw;
      else left = a.left + a.width / 2 - fw / 2;
    }
    left = Math.max(g, Math.min(left, vw - fw - g));
    top = Math.max(g, Math.min(top, vh - fh - g));
    setPos({ top, left, origin: `${originY} ${placement.endsWith('end') ? 'right' : 'left'}` });
  }, [anchor, floating, placement, offset]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update]);
  return pos;
}
// #endregion

// #region usePresence
/** Keeps an element mounted while it animates out. */
export function usePresence(open: boolean, ms = 200) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(r);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, ms]);
  return { mounted, visible };
}
// #endregion

// #region useClipboard
export function useClipboard(timeout = 1400) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch {
          /* ignore */
        }
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout],
  );
  return { copied, copy };
}
// #endregion

// #region useMediaQuery
export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}
// #endregion
