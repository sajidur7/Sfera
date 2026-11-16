import * as stylex from '@stylexjs/stylex';
import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Eye, EyeOff, FileText, Minus, Plus, Search, Upload, X } from 'lucide-react';
import { accent, colors, control, font, motion, radius, shadows, space } from './tokens.stylex';
import { fx } from './shared';

const fadeUp = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(4px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } });
import { useAnchoredPosition, useControllable, useDismiss, useSfera } from './hooks';

const FieldCtx = createContext<{ id?: string; describedBy?: string; invalid?: boolean }>({});

// #region Field
const fld = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  labelRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space.s2 },
  label: { fontSize: font.sm, fontWeight: 500, color: colors.text },
  optional: { fontSize: font.xs, color: colors.textSubtle, fontFamily: font.mono },
  help: { fontSize: font.xs, lineHeight: 1.45, color: colors.textMuted, margin: 0 },
  error: { color: colors.danger, display: 'flex', alignItems: 'center', gap: 4 },
});
export type FieldProps = {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  children: ReactNode;
};
/** Label + control + help or error text. Wires ids and aria-describedby for the control inside. */
export function Field({ label, help, error, optional, children }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <FieldCtx.Provider value={{ id, describedBy: help || error ? msgId : undefined, invalid: !!error }}>
      <div {...stylex.props(fld.root)}>
        <div {...stylex.props(fld.labelRow)}>
          <label htmlFor={id} {...stylex.props(fld.label)}>
            {label}
          </label>
          {optional && <span {...stylex.props(fld.optional)}>optional</span>}
        </div>
        {children}
        {(error || help) && (
          <p id={msgId} role={error ? 'alert' : undefined} {...stylex.props(fld.help, !!error && fld.error)}>
            {error || help}
          </p>
        )}
      </div>
    </FieldCtx.Provider>
  );
}
// #endregion

// #region TextInput
const inp = stylex.create({
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: control.md,
    paddingInline: 10,
    minWidth: 0,
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.borderStrong, ':hover': `color-mix(in oklab, ${colors.borderStrong} 70%, ${colors.text})` },
    borderRadius: radius.control,
    boxShadow: { default: 'none', ':focus-within': `0 0 0 3px color-mix(in oklab, ${accent.base} 22%, transparent)` },
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    color: colors.textSubtle,
  },
  focusBorder: { borderColor: { default: colors.borderStrong, ':focus-within': accent.base } },
  sm: { height: control.sm, paddingInline: 8 },
  lg: { height: control.lg },
  invalid: { borderColor: colors.danger },
  disabled: { opacity: 0.5, backgroundColor: colors.well, cursor: 'not-allowed' },
  input: {
    flexGrow: 1,
    minWidth: 0,
    height: '100%',
    borderWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    color: colors.text,
    fontSize: { default: font.md, '@media (max-width: 640px)': font.lg },
    '::placeholder': { color: colors.textSubtle },
  },
  affix: { display: 'inline-flex', alignItems: 'center', flexShrink: 0, color: colors.textMuted, fontSize: font.sm },
});
export type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'style' | 'className'> & {
  size?: 'sm' | 'md' | 'lg';
  iconStart?: ReactNode;
  end?: ReactNode;
  invalid?: boolean;
};
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { size = 'md', iconStart, end, invalid, disabled, id, ...rest },
  ref,
) {
  const f = useContext(FieldCtx);
  const bad = invalid ?? f.invalid;
  return (
    <div {...stylex.props(inp.wrap, inp.focusBorder, size !== 'md' && inp[size], bad && inp.invalid, disabled && inp.disabled)}>
      {iconStart && <span {...stylex.props(inp.affix)}>{iconStart}</span>}
      <input
        ref={ref}
        id={id ?? f.id}
        aria-invalid={bad || undefined}
        aria-describedby={f.describedBy}
        disabled={disabled}
        {...rest}
        {...stylex.props(inp.input)}
      />
      {end && <span {...stylex.props(inp.affix)}>{end}</span>}
    </div>
  );
});
// #endregion

// #region SearchInput
const si = stylex.create({
  clear: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { default: 20, '@media (pointer: coarse)': 32 },
    height: { default: 20, '@media (pointer: coarse)': 32 },
    borderRadius: radius.pill,
    borderWidth: 0,
    cursor: 'pointer',
    backgroundColor: { default: colors.well, ':hover': colors.pressed },
    color: colors.textMuted,
  },
});
export function SearchInput({
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Search',
  end,
  ...rest
}: Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange'> & { value?: string; defaultValue?: string; onValueChange?: (v: string) => void }) {
  const [v, setV] = useControllable(value, defaultValue, onValueChange);
  return (
    <TextInput
      type="search"
      role="searchbox"
      placeholder={placeholder}
      value={v}
      onChange={(e) => setV(e.target.value)}
      iconStart={<Search size={15} />}
      end={
        v ? (
          <button type="button" aria-label="Clear search" onClick={() => setV('')} {...stylex.props(si.clear, fx.focus)}>
            <X size={12} />
          </button>
        ) : (
          end
        )
      }
      {...rest}
    />
  );
}
// #endregion

// #region TextArea
const ta = stylex.create({
  root: {
    width: '100%',
    minHeight: 88,
    padding: '8px 10px',
    resize: 'vertical',
    fontSize: { default: font.md, '@media (max-width: 640px)': font.lg },
    lineHeight: 1.5,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.borderStrong, ':focus': accent.base },
    borderRadius: radius.control,
    outlineStyle: 'none',
    boxShadow: { default: 'none', ':focus': `0 0 0 3px color-mix(in oklab, ${accent.base} 22%, transparent)` },
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.fast,
    '::placeholder': { color: colors.textSubtle },
  },
  invalid: { borderColor: colors.danger },
});
export const TextArea = forwardRef<HTMLTextAreaElement, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style' | 'className'> & { invalid?: boolean }>(
  function TextArea({ invalid, id, ...rest }, ref) {
    const f = useContext(FieldCtx);
    const bad = invalid ?? f.invalid;
    return <textarea ref={ref} id={id ?? f.id} aria-invalid={bad || undefined} aria-describedby={f.describedBy} {...rest} {...stylex.props(ta.root, bad && ta.invalid)} />;
  },
);
// #endregion

// #region NumberInput
const ni = stylex.create({
  step: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { default: 22, '@media (pointer: coarse)': 32 },
    height: { default: 22, '@media (pointer: coarse)': 32 },
    borderWidth: 0,
    borderRadius: 6,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.4 },
    backgroundColor: { default: 'transparent', ':hover:not(:disabled)': colors.hover },
    color: colors.textMuted,
  },
  value: { textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
});
export function NumberInput({
  value,
  defaultValue = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  size,
  label,
}: {
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <TextInput
      size={size}
      inputMode="numeric"
      aria-label={label}
      value={String(v)}
      onChange={(e) => {
        const n = Number(e.target.value.replace(/[^\d.-]/g, ''));
        if (!Number.isNaN(n)) setV(clamp(n));
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') (e.preventDefault(), setV(clamp(v + step)));
        if (e.key === 'ArrowDown') (e.preventDefault(), setV(clamp(v - step)));
      }}
      iconStart={
        <button type="button" aria-label="Decrease" disabled={v <= min} onClick={() => setV(clamp(v - step))} {...stylex.props(ni.step, fx.focus)}>
          <Minus size={13} />
        </button>
      }
      end={
        <button type="button" aria-label="Increase" disabled={v >= max} onClick={() => setV(clamp(v + step))} {...stylex.props(ni.step, fx.focus)}>
          <Plus size={13} />
        </button>
      }
    />
  );
}
// #endregion

// #region Checkbox
const cb = stylex.create({
  row: { display: 'inline-flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: font.md, color: colors.text, lineHeight: 1.35, minWidth: 0 },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  input: { position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 },
  box: {
    position: 'relative',
    flexShrink: 0,
    width: 18,
    height: 18,
    marginTop: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: accent.onAccent,
    transitionProperty: 'background-color, border-color, transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  boxOn: { backgroundColor: accent.base, borderColor: accent.base },
  mark: { transitionProperty: 'transform, opacity', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  markOff: { transform: 'scale(0.4)', opacity: 0 },
  focusRing: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: accent.base, outlineOffset: 2 },
  text: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  desc: { fontSize: font.sm, color: colors.textMuted },
});
export type CheckboxProps = {
  checked?: boolean | 'mixed';
  defaultChecked?: boolean;
  onChange?: (c: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
};
export function Checkbox({ checked, defaultChecked = false, onChange, label, description, disabled, ...rest }: CheckboxProps) {
  const [c, setC] = useControllable<boolean | 'mixed'>(checked, defaultChecked, (v) => onChange?.(v === true));
  const [focus, setFocus] = useState(false);
  const on = c === true || c === 'mixed';
  return (
    <label {...stylex.props(cb.row, disabled && cb.disabled)}>
      <input
        type="checkbox"
        checked={c === true}
        ref={(el) => {
          if (el) el.indeterminate = c === 'mixed';
        }}
        disabled={disabled}
        aria-label={rest['aria-label']}
        onChange={(e) => setC(e.target.checked)}
        onFocus={(e) => setFocus(e.target.matches(':focus-visible'))}
        onBlur={() => setFocus(false)}
        {...stylex.props(cb.input)}
      />
      <span aria-hidden {...stylex.props(cb.box, on && cb.boxOn, focus && cb.focusRing)}>
        <span {...stylex.props(cb.mark, !on && cb.markOff)}>{c === 'mixed' ? <Minus size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}</span>
      </span>
      {(label || description) && (
        <span {...stylex.props(cb.text)}>
          {label}
          {description && <span {...stylex.props(cb.desc)}>{description}</span>}
        </span>
      )}
    </label>
  );
}
// #endregion

// #region RadioGroup
const rd = stylex.create({
  group: { display: 'flex', flexDirection: 'column', gap: 10, borderWidth: 0, margin: 0, padding: 0, minWidth: 0 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legend: { fontSize: font.sm, fontWeight: 500, color: colors.text, marginBottom: 8, padding: 0 },
  dot: { borderRadius: '50%' },
  inner: { width: 8, height: 8, borderRadius: '50%', backgroundColor: accent.onAccent },
});
export type RadioOption = { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean };
export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  label,
  direction = 'column',
}: {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  label?: ReactNode;
  direction?: 'row' | 'column';
}) {
  const name = useId();
  const [v, setV] = useControllable(value, defaultValue ?? '', onChange);
  const [focused, setFocused] = useState<string | null>(null);
  return (
    <fieldset {...stylex.props(rd.group, direction === 'row' && rd.row)}>
      {label && <legend {...stylex.props(rd.legend)}>{label}</legend>}
      {options.map((o) => {
        const on = v === o.value;
        return (
          <label key={o.value} {...stylex.props(cb.row, o.disabled && cb.disabled)}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={on}
              disabled={o.disabled}
              onChange={() => setV(o.value)}
              onFocus={(e) => setFocused(e.target.matches(':focus-visible') ? o.value : null)}
              onBlur={() => setFocused(null)}
              {...stylex.props(cb.input)}
            />
            <span aria-hidden {...stylex.props(cb.box, rd.dot, on && cb.boxOn, focused === o.value && cb.focusRing)}>
              <span {...stylex.props(rd.inner, cb.mark, !on && cb.markOff)} />
            </span>
            <span {...stylex.props(cb.text)}>
              {o.label}
              {o.description && <span {...stylex.props(cb.desc)}>{o.description}</span>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
// #endregion

// #region Switch
const sw = stylex.create({
  row: { display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: font.md, color: colors.text },
  track: {
    position: 'relative',
    flexShrink: 0,
    width: 34,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 0,
    padding: 0,
    cursor: 'pointer',
    backgroundColor: colors.borderStrong,
    transitionProperty: 'background-color',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    '::before': { content: '""', position: 'absolute', inset: { default: 0, '@media (pointer: coarse)': -8 } },
  },
  sm: { width: 28, height: 16 },
  on: { backgroundColor: accent.base },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: shadows.thumb,
    transitionProperty: 'transform, width',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
  },
  thumbSm: { width: 12, height: 12 },
  // Tactile: the thumb stretches while pressed.
  thumbPress: { width: 20 },
  thumbOn: { transform: 'translateX(14px)' },
  thumbOnPress: { transform: 'translateX(10px)' },
  thumbOnSm: { transform: 'translateX(12px)' },
  disabled: { opacity: 0.45, cursor: 'not-allowed' },
});
export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  size = 'md',
  disabled,
  ...rest
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  label?: ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const [on, setOn] = useControllable(checked, defaultChecked, onChange);
  const [press, setPress] = useState(false);
  const id = useId();
  const sm = size === 'sm';
  return (
    <span {...stylex.props(sw.row, disabled && sw.disabled)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={rest['aria-label']}
        disabled={disabled}
        onClick={() => setOn(!on)}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onPointerLeave={() => setPress(false)}
        {...stylex.props(sw.track, sm && sw.sm, on && sw.on, fx.focus)}
      >
        <span
          {...stylex.props(
            sw.thumb,
            sm && sw.thumbSm,
            press && !sm && sw.thumbPress,
            on && (sm ? sw.thumbOnSm : press ? sw.thumbOnPress : sw.thumbOn),
          )}
        />
      </button>
      {label && <label htmlFor={id}>{label}</label>}
    </span>
  );
}
// #endregion

// #region Select
export type SelectOption = { value: string; label: ReactNode; icon?: ReactNode; description?: ReactNode };
const sel = stylex.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minWidth: 0,
    height: control.md,
    paddingInline: '10px 8px',
    fontSize: font.md,
    color: colors.text,
    textAlign: 'left',
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: radius.control,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: motion.fast,
  },
  sm: { height: control.sm, fontSize: font.sm },
  auto: { width: 'auto' },
  placeholder: { color: colors.textSubtle },
  value: { flexGrow: 1, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chev: { color: colors.textMuted, flexShrink: 0, transitionProperty: 'transform', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  chevOpen: { transform: 'rotate(180deg)' },
});
export const menuStyles = stylex.create({
  panel: {
    position: 'fixed',
    zIndex: 60,
    minWidth: 180,
    maxWidth: 'calc(100vw - 16px)',
    maxHeight: 320,
    overflowY: 'auto',
    padding: 4,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 12,
    boxShadow: shadows.raised,
    animationName: fadeUp,
    animationDuration: motion.base,
    animationTimingFunction: motion.ease,
    outlineStyle: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minHeight: 32,
    paddingInline: 8,
    borderWidth: 0,
    borderRadius: 8,
    fontSize: font.md,
    textAlign: 'left',
    color: colors.text,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    outlineStyle: 'none',
  },
  active: { backgroundColor: colors.hover },
  muted: { color: colors.textMuted, display: 'inline-flex', flexShrink: 0 },
  grow: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  desc: { fontSize: font.xs, color: colors.textMuted },
  check: { color: accent.base, display: 'inline-flex', flexShrink: 0 },
});
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select…',
  size = 'md',
  width = 'full',
  label,
  renderValue,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md';
  width?: 'full' | 'auto';
  label?: string;
  renderValue?: (o: SelectOption) => ReactNode;
}) {
  const [v, setV] = useControllable(value, defaultValue ?? '', onChange);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const f = useContext(FieldCtx);
  const trig = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { portalRoot } = useSfera();
  const pos = useAnchoredPosition(trig, list, open, 'bottom-start');
  useDismiss(open, () => setOpen(false), [trig, list]);
  const cur = options.find((o) => o.value === v);
  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === v)));
    setOpen(true);
    requestAnimationFrame(() => list.current?.focus());
  };
  const choose = (o: SelectOption) => {
    setV(o.value);
    setOpen(false);
    trig.current?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(options.length - 1, a + 1)));
    if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(0, a - 1)));
    if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), choose(options[active]));
    if (e.key === 'Tab') setOpen(false);
  };
  const listId = useId();
  return (
    <>
      <button
        ref={trig}
        id={f.id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        aria-describedby={f.describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) (e.preventDefault(), openList());
        }}
        {...stylex.props(sel.trigger, size === 'sm' && sel.sm, width === 'auto' && sel.auto, fx.focus)}
      >
        <span {...stylex.props(sel.value, !cur && sel.placeholder)}>{cur ? (renderValue ? renderValue(cur) : <>{cur.icon}{cur.label}</>) : placeholder}</span>
        <ChevronDown size={15} {...stylex.props(sel.chev, open && sel.chevOpen)} />
      </button>
      {open &&
        portalRoot &&
        createPortal(
          <div
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onKey}
            {...stylex.props(menuStyles.panel)}
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, minWidth: trig.current?.offsetWidth, transformOrigin: pos?.origin }}
          >
            {options.map((o, i) => (
              <div
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === v}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(o)}
                {...stylex.props(menuStyles.item, i === active && menuStyles.active)}
              >
                {o.icon && <span {...stylex.props(menuStyles.muted)}>{o.icon}</span>}
                <span {...stylex.props(menuStyles.grow)}>
                  <span>{o.label}</span>
                  {o.description && <span {...stylex.props(menuStyles.desc)}>{o.description}</span>}
                </span>
                {o.value === v && (
                  <span {...stylex.props(menuStyles.check)}>
                    <Check size={15} />
                  </span>
                )}
              </div>
            ))}
          </div>,
          portalRoot,
        )}
    </>
  );
}
// #endregion

// #region Slider
const sl = stylex.create({
  root: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', minWidth: 0 },
  input: {
    appearance: 'none',
    flexGrow: 1,
    minWidth: 0,
    height: 20,
    margin: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '::-webkit-slider-runnable-track': { height: 6, borderRadius: 999, backgroundColor: 'transparent' },
    '::-webkit-slider-thumb': {
      appearance: 'none',
      width: 18,
      height: 18,
      marginTop: -6,
      borderRadius: '50%',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colors.borderStrong,
      boxShadow: shadows.thumb,
    },
    '::-moz-range-thumb': { width: 16, height: 16, borderRadius: '50%', backgroundColor: '#FFFFFF', borderWidth: 1, borderStyle: 'solid', borderColor: colors.borderStrong },
    outlineStyle: 'none',
  },
  val: { fontFamily: font.mono, fontSize: font.xs, color: colors.textMuted, minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
});
const slt = stylex.create({
  wrap: { position: 'relative', flexGrow: 1, minWidth: 0, height: 20, display: 'flex', alignItems: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, backgroundColor: colors.track, overflow: 'hidden', pointerEvents: 'none' },
  fill: { height: '100%', backgroundColor: accent.base, borderRadius: 999 },
  input: { position: 'relative', width: '100%' },
  pct: (w: string) => ({ width: w }),
});
export function Slider({
  value,
  defaultValue = 50,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  format = (n: number) => String(n),
}: {
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  format?: (n: number) => string;
}) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const f = useContext(FieldCtx);
  const pct = `${((v - min) / (max - min)) * 100}%`;
  return (
    <div {...stylex.props(sl.root)}>
      <span {...stylex.props(slt.wrap)}>
        <span aria-hidden {...stylex.props(slt.track)}>
          <span {...stylex.props(slt.fill, slt.pct(pct))} />
        </span>
      <input
        id={f.id}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        {...stylex.props(sl.input, slt.input, fx.focus)}
      />
      </span>
      {showValue && <span {...stylex.props(sl.val)}>{format(v)}</span>}
    </div>
  );
}
// #endregion

// #region CheckboxList
const cl = stylex.create({
  root: { display: 'flex', flexDirection: 'column', borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, backgroundColor: { default: 'transparent', ':hover': colors.hover } },
  last: { borderBottomWidth: 0 },
  grow: { flexGrow: 1, minWidth: 0 },
  meta: { fontSize: font.xs, color: colors.textMuted, fontFamily: font.mono, flexShrink: 0 },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: colors.well, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, fontSize: font.sm },
});
export type CheckItem = { value: string; label: ReactNode; description?: ReactNode; meta?: ReactNode; disabled?: boolean };
/** Bordered list of checkbox rows with a select-all header. */
export function CheckboxList({ items, value, defaultValue = [], onChange, label }: { items: CheckItem[]; value?: string[]; defaultValue?: string[]; onChange?: (v: string[]) => void; label: string }) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const enabled = items.filter((i) => !i.disabled).map((i) => i.value);
  const all = enabled.every((x) => v.includes(x));
  return (
    <div role="group" aria-label={label} {...stylex.props(cl.root)}>
      <div {...stylex.props(cl.head)}>
        <Checkbox label={label} checked={all ? true : v.length ? 'mixed' : false} onChange={() => setV(all ? [] : enabled)} />
        <span {...stylex.props(cl.meta)}>
          {v.length}/{items.length}
        </span>
      </div>
      {items.map((it, i) => (
        <div key={it.value} {...stylex.props(cl.row, i === items.length - 1 && cl.last)}>
          <span {...stylex.props(cl.grow)}>
            <Checkbox
              label={it.label}
              description={it.description}
              disabled={it.disabled}
              checked={v.includes(it.value)}
              onChange={(c) => setV(c ? [...v, it.value] : v.filter((x) => x !== it.value))}
            />
          </span>
          {it.meta && <span {...stylex.props(cl.meta)}>{it.meta}</span>}
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region FileInput
const fi = stylex.create({
  zone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '22px 16px',
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: 16,
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: motion.fast,
    color: colors.textMuted,
    fontSize: font.sm,
  },
  over: { borderColor: accent.base, backgroundColor: `color-mix(in oklab, ${accent.base} 6%, ${colors.surface})` },
  strong: { color: colors.text, fontWeight: 500 },
  list: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  file: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 12px', borderRadius: 12, backgroundColor: colors.well, fontSize: font.sm, color: colors.text },
  name: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  size: { fontFamily: font.mono, fontSize: 11, color: colors.textMuted },
  rm: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: { default: 24, '@media (pointer: coarse)': 32 }, minHeight: { default: 24, '@media (pointer: coarse)': 32 }, borderWidth: 0, backgroundColor: 'transparent', color: colors.textMuted, cursor: 'pointer', padding: 4, borderRadius: 6 },
});
const kb = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
/** Drop zone + file picker. Lists picked files with remove buttons. */
export function FileInput({ accept, multiple = true, onChange, hint = 'PNG, JPG or PDF up to 10 MB' }: { accept?: string; multiple?: boolean; onChange?: (files: File[]) => void; hint?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const f = useContext(FieldCtx);
  const add = (list: FileList | null) => {
    if (!list) return;
    const next = multiple ? [...files, ...Array.from(list)] : Array.from(list).slice(0, 1);
    setFiles(next);
    onChange?.(next);
  };
  return (
    <div>
      <label
        htmlFor={f.id}
        onDragOver={(e) => (e.preventDefault(), setOver(true))}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => (e.preventDefault(), setOver(false), add(e.dataTransfer.files))}
        {...stylex.props(fi.zone, over && fi.over)}
      >
        <Upload size={18} />
        <span>
          <span {...stylex.props(fi.strong)}>Choose files</span> or drag them here
        </span>
        <span>{hint}</span>
        <input ref={ref} id={f.id} type="file" accept={accept} multiple={multiple} onChange={(e) => (add(e.target.files), (e.target.value = ''))} {...stylex.props(fx.srOnly)} />
      </label>
      {files.length > 0 && (
        <div {...stylex.props(fi.list)}>
          {files.map((file, i) => (
            <div key={file.name + i} {...stylex.props(fi.file)}>
              <FileText size={15} />
              <span {...stylex.props(fi.name)}>{file.name}</span>
              <span {...stylex.props(fi.size)}>{kb(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => {
                  const next = files.filter((_, j) => j !== i);
                  setFiles(next);
                  onChange?.(next);
                }}
                {...stylex.props(fi.rm, fx.focus)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// #endregion

// #region Combobox
const cbx = stylex.create({
  wrap: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    minHeight: control.md,
    width: '100%',
    padding: '3px 8px 3px 6px',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.borderStrong, ':focus-within': accent.base },
    borderRadius: radius.control,
    boxShadow: { default: 'none', ':focus-within': `0 0 0 3px color-mix(in oklab, ${accent.base} 22%, transparent)` },
    cursor: 'text',
  },
  input: { flexGrow: 1, minWidth: 80, height: 24, borderWidth: 0, outlineStyle: 'none', backgroundColor: 'transparent', color: colors.text, fontSize: { default: font.md, '@media (max-width: 640px)': font.lg }, paddingInline: 4, '::placeholder': { color: colors.textSubtle } },
  token: { display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, paddingInline: '8px 4px', borderRadius: 999, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, fontSize: font.sm, color: colors.text, maxWidth: '100%' },
  tokenText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  x: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderWidth: 0, padding: { default: 2, '@media (pointer: coarse)': 10 }, margin: { default: 0, '@media (pointer: coarse)': -8 }, borderRadius: 999, backgroundColor: { default: 'transparent', ':hover': colors.pressed }, color: colors.textMuted, cursor: 'pointer' },
  empty: { padding: '10px 8px', fontSize: font.sm, color: colors.textMuted },
  create: { color: accent.base },
});
export type ComboOption = { value: string; label: string; description?: string; icon?: ReactNode };
function useListbox(open: boolean, count: number) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [open, count]);
  return [active, setActive] as const;
}
/** Shared engine behind Typeahead, MultiSelect and Tokenizer. */
function ComboBase({
  options,
  selected,
  onPick,
  onRemove,
  multi,
  placeholder,
  allowCreate,
  label,
  query,
  setQuery,
}: {
  options: ComboOption[];
  selected: ComboOption[];
  onPick: (o: ComboOption) => void;
  onRemove: (o: ComboOption) => void;
  multi: boolean;
  placeholder?: string;
  allowCreate?: boolean;
  label?: string;
  query: string;
  setQuery: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const { portalRoot } = useSfera();
  const f = useContext(FieldCtx);
  const listId = useId();
  const pos = useAnchoredPosition(wrap, list, open, 'bottom-start');
  useDismiss(open, () => setOpen(false), [wrap, list]);
  const sel = new Set(selected.map((s) => s.value));
  const shown = options.filter((o) => (!multi || !sel.has(o.value)) && (o.label + ' ' + (o.description ?? '')).toLowerCase().includes(query.toLowerCase()));
  const canCreate = allowCreate && query.trim() && !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());
  const total = shown.length + (canCreate ? 1 : 0);
  const [active, setActive] = useListbox(open, total);
  const pick = (i: number) => {
    if (i < shown.length) onPick(shown[i]);
    else if (canCreate) onPick({ value: query.trim().toLowerCase().replace(/\s+/g, '-'), label: query.trim() });
    // Multi clears the text for the next pick; single-value pickers show the chosen label instead.
    if (multi) setQuery('');
    else setOpen(false);
    input.current?.focus();
  };
  return (
    <>
      <div ref={wrap} onClick={() => input.current?.focus()} {...stylex.props(cbx.wrap)}>
        {multi &&
          selected.map((s) => (
            <span key={s.value} {...stylex.props(cbx.token)}>
              {s.icon}
              <span {...stylex.props(cbx.tokenText)}>{s.label}</span>
              <button type="button" aria-label={`Remove ${s.label}`} onClick={(e) => (e.stopPropagation(), onRemove(s))} {...stylex.props(cbx.x, fx.focus)}>
                <X size={12} />
              </button>
            </span>
          ))}
        <input
          ref={input}
          id={f.id}
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && total ? `${listId}-${active}` : undefined}
          value={query}
          placeholder={multi && selected.length ? '' : placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => (setQuery(e.target.value), setOpen(true))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') (e.preventDefault(), setOpen(true), setActive(Math.min(total - 1, active + 1)));
            if (e.key === 'ArrowUp') (e.preventDefault(), setActive(Math.max(0, active - 1)));
            if (e.key === 'Enter' && open && total) (e.preventDefault(), pick(active));
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Backspace' && !query && multi && selected.length) onRemove(selected[selected.length - 1]);
          }}
          {...stylex.props(cbx.input)}
        />
      </div>
      {open &&
        portalRoot &&
        createPortal(
          <div ref={list} id={listId} role="listbox" aria-multiselectable={multi || undefined} {...stylex.props(menuStyles.panel)} style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: wrap.current?.offsetWidth }}>
            {shown.map((o, i) => (
              <div key={o.value} id={`${listId}-${i}`} role="option" aria-selected={i === active} onPointerDown={(e) => e.preventDefault()} onPointerEnter={() => setActive(i)} onClick={() => pick(i)} {...stylex.props(menuStyles.item, i === active && menuStyles.active)}>
                {o.icon && <span {...stylex.props(menuStyles.muted)}>{o.icon}</span>}
                <span {...stylex.props(menuStyles.grow)}>
                  <span>{o.label}</span>
                  {o.description && <span {...stylex.props(menuStyles.desc)}>{o.description}</span>}
                </span>
                {!multi && sel.has(o.value) && (
                  <span {...stylex.props(menuStyles.check)}>
                    <Check size={15} />
                  </span>
                )}
              </div>
            ))}
            {canCreate && (
              <div id={`${listId}-${shown.length}`} role="option" aria-selected={active === shown.length} onPointerDown={(e) => e.preventDefault()} onPointerEnter={() => setActive(shown.length)} onClick={() => pick(shown.length)} {...stylex.props(menuStyles.item, cbx.create, active === shown.length && menuStyles.active)}>
                <Plus size={15} /> Create “{query.trim()}”
              </div>
            )}
            {!total && <div {...stylex.props(cbx.empty)}>No matches for “{query}”.</div>}
          </div>,
          portalRoot,
        )}
    </>
  );
}
// #endregion

// #region Typeahead
/** Single-value search field with suggestions (combobox). */
export function Typeahead({ options, value, onChange, placeholder = 'Search…', label }: { options: ComboOption[]; value?: string | null; onChange?: (v: string | null) => void; placeholder?: string; label?: string }) {
  const [v, setV] = useControllable<string | null>(value, null, onChange);
  const cur = options.find((o) => o.value === v);
  const [q, setQ] = useState(cur?.label ?? '');
  useEffect(() => setQ(cur?.label ?? ''), [cur?.label]);
  return <ComboBase options={options} selected={cur ? [cur] : []} multi={false} query={q} setQuery={(s) => (setQ(s), s === '' && setV(null))} onPick={(o) => (setV(o.value), setQ(o.label))} onRemove={() => setV(null)} placeholder={placeholder} label={label} />;
}
// #endregion

// #region MultiSelect
/** Pick several from a list; picked values show as removable tokens. Backspace removes the last. */
export function MultiSelect({ options, value, defaultValue = [], onChange, placeholder = 'Add…', label, allowCreate }: { options: ComboOption[]; value?: string[]; defaultValue?: string[]; onChange?: (v: string[]) => void; placeholder?: string; label?: string; allowCreate?: boolean }) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [q, setQ] = useState('');
  const [created, setCreated] = useState<ComboOption[]>([]);
  const all = [...options, ...created];
  const selected = v.map((x) => all.find((o) => o.value === x) ?? { value: x, label: x });
  return (
    <ComboBase
      options={all}
      selected={selected}
      multi
      allowCreate={allowCreate}
      query={q}
      setQuery={setQ}
      onPick={(o) => {
        if (!all.some((a) => a.value === o.value)) setCreated((c) => [...c, o]);
        if (!v.includes(o.value)) setV([...v, o.value]);
      }}
      onRemove={(o) => setV(v.filter((x) => x !== o.value))}
      placeholder={placeholder}
      label={label}
    />
  );
}
// #endregion

// #region Tokenizer
/** Free-text token input: Enter or comma turns text into a token (emails, tags). */
export function Tokenizer({ value, defaultValue = [], onChange, placeholder = 'Type and press Enter', validate, label }: { value?: string[]; defaultValue?: string[]; onChange?: (v: string[]) => void; placeholder?: string; validate?: (s: string) => boolean; label?: string }) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [q, setQ] = useState('');
  const [bad, setBad] = useState(false);
  const commit = () => {
    const t = q.trim().replace(/,$/, '');
    if (!t) return;
    if (validate && !validate(t)) return setBad(true);
    if (!v.includes(t)) setV([...v, t]);
    setQ('');
    setBad(false);
  };
  return (
    <div {...stylex.props(cbx.wrap, bad && inp.invalid)} aria-invalid={bad || undefined}>
      {v.map((t) => (
        <span key={t} {...stylex.props(cbx.token)}>
          <span {...stylex.props(cbx.tokenText)}>{t}</span>
          <button type="button" aria-label={`Remove ${t}`} onClick={() => setV(v.filter((x) => x !== t))} {...stylex.props(cbx.x, fx.focus)}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        aria-label={label}
        value={q}
        placeholder={v.length ? '' : placeholder}
        onChange={(e) => (setQ(e.target.value), setBad(false), e.target.value.endsWith(',') && setTimeout(commit))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.preventDefault(), commit());
          if (e.key === 'Backspace' && !q && v.length) setV(v.slice(0, -1));
        }}
        onBlur={commit}
        {...stylex.props(cbx.input)}
      />
    </div>
  );
}
// #endregion

// #region PasswordInput
const pw = stylex.create({
  eye: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: { default: 26, '@media (pointer: coarse)': 32 }, height: { default: 26, '@media (pointer: coarse)': 32 }, borderWidth: 0, borderRadius: 7, backgroundColor: { default: 'transparent', ':hover': colors.hover }, color: colors.textMuted, cursor: 'pointer' },
  meter: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 6 },
  seg: { height: 4, borderRadius: 999, backgroundColor: colors.track, transitionProperty: 'background-color', transitionDuration: motion.base },
  weak: { backgroundColor: colors.danger },
  ok: { backgroundColor: colors.warning },
  strong: { backgroundColor: colors.success },
  hint: { fontSize: font.xs, color: colors.textMuted, marginTop: 4 },
});
const strength = (p: string) => [/.{10,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
/** Password field with show/hide and an optional strength meter. Paste and password managers work. */
export function PasswordInput({ value, defaultValue = '', onChange, showStrength, autoComplete = 'current-password', ...rest }: { value?: string; defaultValue?: string; onChange?: (v: string) => void; showStrength?: boolean; autoComplete?: string; 'aria-label'?: string }) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [shown, setShown] = useState(false);
  const s = strength(v);
  return (
    <div>
      <TextInput
        type={shown ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={v}
        onChange={(e) => setV(e.target.value)}
        aria-label={rest['aria-label']}
        end={
          <button type="button" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown(!shown)} {...stylex.props(pw.eye, fx.focus)}>
            {shown ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />
      {showStrength && (
        <>
          <div {...stylex.props(pw.meter)} aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} {...stylex.props(pw.seg, i < s && (s <= 1 ? pw.weak : s <= 2 ? pw.ok : pw.strong))} />
            ))}
          </div>
          <div {...stylex.props(pw.hint)} aria-live="polite">
            {v ? ['Too weak', 'Weak — add length and a number', 'Okay — add a symbol', 'Good', 'Strong'][s] : 'Use 10+ characters with a number and a symbol'}
          </div>
        </>
      )}
    </div>
  );
}
// #endregion

// #region OtpInput
const otp = stylex.create({
  row: { display: 'flex', gap: 8, justifyContent: 'center' },
  cell: {
    width: 44,
    height: 52,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: font.mono,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.borderStrong, ':focus': accent.base },
    borderRadius: 12,
    outlineStyle: 'none',
    boxShadow: { default: 'none', ':focus': `0 0 0 3px color-mix(in oklab, ${accent.base} 22%, transparent)` },
    transitionProperty: 'border-color, box-shadow, transform',
    transitionDuration: motion.fast,
  },
  filled: { borderColor: colors.text },
  invalid: { borderColor: colors.danger },
});
/** One-time code input: one box per digit, paste fills all, Backspace moves back. */
export function OtpInput({ length = 6, onComplete, invalid, label = 'Verification code' }: { length?: number; onComplete?: (code: string) => void; invalid?: boolean; label?: string }) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const set = (next: string[]) => {
    setVals(next);
    if (next.every(Boolean)) onComplete?.(next.join(''));
  };
  return (
    <div role="group" aria-label={label} {...stylex.props(otp.row)}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          value={v}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1);
            const next = [...vals];
            next[i] = d;
            set(next);
            if (d) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !vals[i]) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowLeft') refs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight') refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('');
            if (!digits.length) return;
            e.preventDefault();
            const next = Array(length).fill('').map((_, k) => digits[k] ?? '');
            set(next);
            refs.current[Math.min(digits.length, length - 1)]?.focus();
          }}
          {...stylex.props(otp.cell, !!v && otp.filled, invalid && otp.invalid)}
        />
      ))}
    </div>
  );
}
// #endregion
