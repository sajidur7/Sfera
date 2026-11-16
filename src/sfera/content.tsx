import * as stylex from '@stylexjs/stylex';
import { useRef, useState, type ReactNode } from 'react';
import { ArrowBigUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronUp, Command, CornerDownLeft, Delete, Globe, Image as ImageIcon, Option, Space, X as XIcon } from 'lucide-react';
import { accent, colors, font, radius } from './tokens.stylex';
import type { Tone } from './shared';
import { StatusDot } from './feedback';

// #region Heading
const hd = stylex.create({
  base: { margin: 0, color: colors.text, fontWeight: 500, letterSpacing: '-0.025em', textWrap: 'balance' },
  display: { fontSize: { default: 44, '@media (max-width: 640px)': 32 }, lineHeight: 1.05, letterSpacing: '-0.035em' },
  h1: { fontSize: { default: 32, '@media (max-width: 640px)': 26 }, lineHeight: 1.12, letterSpacing: '-0.03em' },
  h2: { fontSize: 24, lineHeight: 1.2 },
  h3: { fontSize: 18, lineHeight: 1.3, letterSpacing: '-0.015em' },
  h4: { fontSize: 15, lineHeight: 1.35, letterSpacing: '-0.01em' },
});
/** Big, light headings: weight 500, tight tracking. `level` sets the tag, `size` the look. */
export function Heading({ level = 2, size, children, id }: { level?: 1 | 2 | 3 | 4; size?: 'display' | 'h1' | 'h2' | 'h3' | 'h4'; children: ReactNode; id?: string }) {
  const Tag = `h${level}` as 'h1';
  return (
    <Tag id={id} {...stylex.props(hd.base, hd[size ?? (`h${level}` as 'h1')])}>
      {children}
    </Tag>
  );
}
// #endregion

// #region Text
const tx = stylex.create({
  base: { margin: 0, fontSize: font.md, lineHeight: 1.55, color: colors.text },
  sm: { fontSize: font.sm },
  xs: { fontSize: font.xs },
  lg: { fontSize: font.lg },
  muted: { color: colors.textMuted },
  subtle: { color: colors.textSubtle },
  medium: { fontWeight: 500 },
  mono: { fontFamily: font.mono, letterSpacing: 0 },
  num: { fontVariantNumeric: 'tabular-nums' },
  truncate: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
});
export function Text({
  as: Tag = 'p',
  size = 'md',
  tone = 'default',
  weight,
  mono,
  numeric,
  truncate,
  children,
}: {
  as?: 'p' | 'span' | 'div' | 'label';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'default' | 'muted' | 'subtle';
  weight?: 'medium';
  mono?: boolean;
  numeric?: boolean;
  truncate?: boolean;
  children: ReactNode;
}) {
  return (
    <Tag
      {...stylex.props(
        tx.base,
        size !== 'md' && tx[size],
        tone !== 'default' && tx[tone],
        weight === 'medium' && tx.medium,
        mono && tx.mono,
        numeric && tx.num,
        truncate && tx.truncate,
      )}
    >
      {children}
    </Tag>
  );
}
// #endregion

// #region Avatar
const av = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '50%',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    color: colors.textMuted,
    backgroundColor: colors.well,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    userSelect: 'none',
  },
  square: { borderRadius: '28%' },
  img: { width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' },
  xs: { width: 20, height: 20, fontSize: 9 },
  sm: { width: 24, height: 24, fontSize: 10 },
  md: { width: 32, height: 32, fontSize: 12 },
  lg: { width: 40, height: 40, fontSize: 15 },
  xl: { width: 56, height: 56, fontSize: 21 },
  '2xl': { width: 80, height: 80, fontSize: 30, fontWeight: 450 },
  status: { position: 'absolute', right: -1, bottom: -1, display: 'inline-flex' },
  // Tinted initials, picked from the name so each person keeps one colour.
  t0: { backgroundColor: `color-mix(in oklab, ${colors.info} 16%, ${colors.surface})`, color: `color-mix(in oklab, ${colors.info} 75%, ${colors.text})`, borderColor: 'transparent' },
  t1: { backgroundColor: `color-mix(in oklab, ${colors.success} 16%, ${colors.surface})`, color: `color-mix(in oklab, ${colors.success} 70%, ${colors.text})`, borderColor: 'transparent' },
  t2: { backgroundColor: `color-mix(in oklab, ${colors.warning} 20%, ${colors.surface})`, color: `color-mix(in oklab, ${colors.warning} 55%, ${colors.text})`, borderColor: 'transparent' },
  t3: { backgroundColor: `color-mix(in oklab, ${colors.danger} 14%, ${colors.surface})`, color: `color-mix(in oklab, ${colors.danger} 75%, ${colors.text})`, borderColor: 'transparent' },
  t4: { backgroundColor: `color-mix(in oklab, #7C5CE0 16%, ${colors.surface})`, color: `color-mix(in oklab, #7C5CE0 78%, ${colors.text})`, borderColor: 'transparent' },
  t5: { backgroundColor: colors.well, color: colors.textMuted },
});
// Presence badge: each state has its own shape, so it reads without colour.
// The ring uses --sfera-avatar-ring (defaults to the card surface) to cut the badge out of the avatar.
const pr = stylex.create({
  dot: {
    position: 'absolute',
    boxSizing: 'border-box',
    borderRadius: '50%',
    boxShadow: `0 0 0 2px var(--sfera-avatar-ring, ${colors.surface})`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: { backgroundColor: colors.success },
  offline: { backgroundColor: `var(--sfera-avatar-ring, ${colors.surface})`, borderStyle: 'solid', borderColor: colors.textSubtle },
  busy: { backgroundColor: colors.danger, '::after': { content: '""', width: '54%', height: '18%', minHeight: 1.5, borderRadius: 2, backgroundColor: '#fff' } },
  // a crescent: a page-coloured disc bites the top-left of the amber dot
  away: { backgroundColor: colors.warning, overflow: 'hidden', '::after': { content: '""', position: 'absolute', width: '72%', height: '72%', top: '-14%', left: '-14%', borderRadius: '50%', backgroundColor: `var(--sfera-avatar-ring, ${colors.surface})` } },
});
// diameter and the offset that puts the dot's centre on the avatar's edge (45° on a circle)
const presenceBox: Record<AvatarSize, { d: number; round: number; sq: number; bw: number }> = {
  xs: { d: 7, round: -1, sq: -2, bw: 1.5 },
  sm: { d: 8, round: -1, sq: -2, bw: 1.5 },
  md: { d: 10, round: -1, sq: -3, bw: 2 },
  lg: { d: 12, round: 0, sq: -3, bw: 2 },
  xl: { d: 15, round: 1, sq: -4, bw: 2.5 },
  '2xl': { d: 20, round: 3, sq: -5, bw: 3 },
};
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Presence = 'online' | 'away' | 'busy' | 'offline';
const presenceLabel: Record<Presence, string> = { online: 'online', away: 'away', busy: 'busy, do not disturb', offline: 'offline' };
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
const hue = (n: string) => (['t0', 't1', 't2', 't3', 't4', 't5'] as const)[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 6];
export function Avatar({ name, src, size = 'md', square, presence, status, tinted = true }: { name: string; src?: string; size?: AvatarSize; square?: boolean; presence?: Presence; status?: Tone; tinted?: boolean }) {
  const box = presenceBox[size];
  const off = square ? box.sq : box.round;
  return (
    <span role="img" aria-label={presence ? `${name}, ${presenceLabel[presence]}` : name} {...stylex.props(av.root, av[size], square && av.square, !src && tinted && av[hue(name)])}>
      {src ? <img src={src} alt="" {...stylex.props(av.img)} /> : initials(name)}
      {presence && <span {...stylex.props(pr.dot, pr[presence])} style={{ width: box.d, height: box.d, right: off, bottom: off, borderWidth: presence === 'offline' ? box.bw : 0 }} />}
      {!presence && status && (
        <span {...stylex.props(av.status)}>
          <StatusDot tone={status} ring />
        </span>
      )}
    </span>
  );
}
// #endregion

// #region AvatarGroup
const ag = stylex.create({
  root: { display: 'inline-flex', alignItems: 'center' },
  item: { marginLeft: -6, borderRadius: '50%', boxShadow: `0 0 0 2px ${colors.surface}`, display: 'inline-flex', transitionProperty: 'transform', transitionDuration: '200ms', transform: { default: null, ':hover': 'translateY(-2px)' } },
  first: { marginLeft: 0 },
  more: { fontFamily: font.mono, letterSpacing: '-0.02em', fontSize: 11 },
});
export function AvatarGroup({ names, max = 4, size = 'sm' }: { names: string[]; max?: number; size?: AvatarSize }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span {...stylex.props(ag.root)} aria-label={`${names.length} people`}>
      {shown.map((n, i) => (
        <span key={n + i} {...stylex.props(ag.item, i === 0 && ag.first)}>
          <Avatar name={n} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span {...stylex.props(ag.item)}>
          <span {...stylex.props(av.root, av[size], ag.more)}>+{rest}</span>
        </span>
      )}
    </span>
  );
}
// #endregion

// #region Kbd
const kb = stylex.create({
  row: { display: 'inline-flex', alignItems: 'center', gap: 3 },
  key: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    paddingInline: 5,
    fontFamily: font.mono,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderBottomWidth: 2,
    borderRadius: 6,
  },
  onAccent: { color: accent.onAccent, backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.24)' },
});
// Modifier keys are drawn as Lucide icons, never as text symbols.
const keyIcon: Record<string, ReactNode> = {
  mod: <Command size={11} strokeWidth={2.2} />,
  cmd: <Command size={11} strokeWidth={2.2} />,
  shift: <ArrowBigUp size={12} strokeWidth={2} />,
  alt: <Option size={11} strokeWidth={2.2} />,
  option: <Option size={11} strokeWidth={2.2} />,
  ctrl: <ChevronUp size={12} strokeWidth={2.4} />,
  enter: <CornerDownLeft size={11} strokeWidth={2.2} />,
  backspace: <Delete size={12} strokeWidth={2} />,
  up: <ArrowUp size={11} strokeWidth={2.2} />,
  down: <ArrowDown size={11} strokeWidth={2.2} />,
  left: <ArrowLeft size={11} strokeWidth={2.2} />,
  right: <ArrowRight size={11} strokeWidth={2.2} />,
  space: <Space size={12} strokeWidth={2} />,
};
const keyName: Record<string, string> = { mod: 'Command', cmd: 'Command', shift: 'Shift', alt: 'Option', option: 'Option', ctrl: 'Control', enter: 'Enter', backspace: 'Backspace', up: 'Up', down: 'Down', left: 'Left', right: 'Right', space: 'Space' };
/** `<Kbd keys={['mod', 'k']} />` → key caps with icons for modifiers. */
export function Kbd({ keys, onAccent }: { keys: string[]; onAccent?: boolean }) {
  return (
    <kbd aria-label={keys.map((k) => keyName[k.toLowerCase()] ?? k.toUpperCase()).join(' + ')} {...stylex.props(kb.row)}>
      {keys.map((k, i) => (
        <span key={i} aria-hidden {...stylex.props(kb.key, onAccent && kb.onAccent)}>
          {keyIcon[k.toLowerCase()] ?? k.toUpperCase()}
        </span>
      ))}
    </kbd>
  );
}
// #endregion

// #region Divider
const dv = stylex.create({
  h: { height: 1, width: '100%', backgroundColor: colors.border, borderWidth: 0, margin: 0, flexShrink: 0 },
  v: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, flexShrink: 0 },
  labelled: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', fontSize: font.xs, color: colors.textSubtle, fontFamily: font.mono },
  line: { flexGrow: 1, height: 1, backgroundColor: colors.border },
});
export function Divider({ orientation = 'horizontal', label }: { orientation?: 'horizontal' | 'vertical'; label?: ReactNode }) {
  if (label)
    return (
      <div role="separator" {...stylex.props(dv.labelled)}>
        <span {...stylex.props(dv.line)} />
        {label}
        <span {...stylex.props(dv.line)} />
      </div>
    );
  return orientation === 'vertical' ? <span role="separator" aria-orientation="vertical" {...stylex.props(dv.v)} /> : <hr {...stylex.props(dv.h)} />;
}
// #endregion

// #region Code
const cd = stylex.create({
  inline: {
    fontFamily: font.mono,
    fontSize: '0.88em',
    paddingInline: 5,
    paddingBlock: 1,
    borderRadius: 6,
    backgroundColor: colors.codeBg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    color: colors.text,
    overflowWrap: 'anywhere',
  },
  block: {
    margin: 0,
    padding: '14px 16px',
    fontFamily: font.mono,
    fontSize: 12.5,
    lineHeight: 1.65,
    color: colors.text,
    backgroundColor: colors.codeBg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    overflowX: 'auto',
    tabSize: 2,
  },
});
export function Code({ children }: { children: ReactNode }) {
  return <code {...stylex.props(cd.inline)}>{children}</code>;
}
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre {...stylex.props(cd.block)}>
      <code>{code}</code>
    </pre>
  );
}
// #endregion

// #region Blockquote
const bq = stylex.create({
  root: { margin: 0, padding: '4px 0 4px 16px', borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: colors.borderStrong, display: 'flex', flexDirection: 'column', gap: 8 },
  text: { margin: 0, fontSize: 17, lineHeight: 1.5, letterSpacing: '-0.01em', color: colors.text },
  cite: { fontSize: font.sm, color: colors.textMuted, fontStyle: 'normal' },
});
export function Blockquote({ children, cite }: { children: ReactNode; cite?: ReactNode }) {
  return (
    <figure style={{ margin: 0 }}>
      <blockquote {...stylex.props(bq.root)}>
        <p {...stylex.props(bq.text)}>{children}</p>
        {cite && <figcaption {...stylex.props(bq.cite)}>— {cite}</figcaption>}
      </blockquote>
    </figure>
  );
}
// #endregion

// #region Citation
const ct = stylex.create({
  chip: {
    position: 'relative',
    '::before': { content: '""', position: 'absolute', inset: { default: 0, '@media (pointer: coarse)': -8 } },
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    marginInline: 2,
    verticalAlign: 'text-top',
    borderRadius: 6,
    fontSize: 11,
    fontFamily: font.mono,
    textDecoration: 'none',
    color: colors.textMuted,
    backgroundColor: { default: colors.well, ':hover': colors.pressed },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
  },
  source: { display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 220, height: { default: 22, '@media (pointer: coarse)': 32 }, paddingInline: 8, borderRadius: 999, fontSize: font.xs, color: colors.text, backgroundColor: colors.well, textDecoration: 'none', borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  domain: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});
/** Numbered inline citation, or a source pill with its domain. */
export function Citation({ n, href, title, variant = 'number' }: { n?: number; href: string; title: string; variant?: 'number' | 'source' }) {
  const domain = href.replace(/^https?:\/\//, '').split('/')[0];
  if (variant === 'source')
    return (
      <a href={href} target="_blank" rel="noreferrer" title={title} {...stylex.props(ct.source)}>
        <Globe size={12} />
        <span {...stylex.props(ct.domain)}>{domain}</span>
      </a>
    );
  return (
    <a href={href} target="_blank" rel="noreferrer" title={`${title} · ${domain}`} aria-label={`Source ${n}: ${title}`} {...stylex.props(ct.chip)}>
      {n}
    </a>
  );
}
// #endregion

// #region Markdown
const md = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 10, fontSize: font.md, lineHeight: 1.6, color: colors.text, minWidth: 0 },
  h: { margin: '6px 0 0', fontWeight: 500, letterSpacing: '-0.015em' },
  h1: { fontSize: 22 },
  h2: { fontSize: 18 },
  h3: { fontSize: 15 },
  p: { margin: 0 },
  list: { margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 },
  strong: { fontWeight: 600 },
});
function inline(s: string, k = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let last = 0;
  for (const m of s.matchAll(re)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={k++} {...stylex.props(md.strong)}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('`')) out.push(<Code key={k++}>{t.slice(1, -1)}</Code>);
    else if (t.startsWith('[')) {
      const [, label, url] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      out.push(<a key={k++} href={url} target="_blank" rel="noreferrer">{label}</a>);
    } else out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    last = m.index! + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
/** Small, safe Markdown renderer: headings, paragraphs, lists, code blocks, bold, italic, code, links. No raw HTML. */
export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    if (l.startsWith('```')) {
      const body: string[] = [];
      while (++i < lines.length && !lines[i].startsWith('```')) body.push(lines[i]);
      blocks.push(<CodeBlock key={i} code={body.join('\n')} />);
    } else if (/^#{1,3} /.test(l)) {
      const lv = l.match(/^#+/)![0].length as 1 | 2 | 3;
      const Tag = `h${lv + 2}` as 'h3';
      blocks.push(<Tag key={i} {...stylex.props(md.h, md[`h${lv}`])}>{inline(l.replace(/^#+ /, ''))}</Tag>);
    } else if (/^(\d+\.|[-*]) /.test(l)) {
      const ordered = /^\d+\./.test(l);
      const items: string[] = [];
      while (i < lines.length && /^(\d+\.|[-*]) /.test(lines[i])) items.push(lines[i++].replace(/^(\d+\.|[-*]) /, ''));
      i--;
      const L = ordered ? 'ol' : 'ul';
      blocks.push(<L key={i} {...stylex.props(md.list)}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</L>);
    } else if (l.startsWith('> ')) {
      blocks.push(<Blockquote key={i}>{inline(l.slice(2))}</Blockquote>);
    } else {
      const para = [l];
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|```|> |\d+\. |[-*] )/.test(lines[i + 1])) para.push(lines[++i]);
      blocks.push(<p key={i} {...stylex.props(md.p)}>{inline(para.join(' '))}</p>);
    }
  }
  return <div {...stylex.props(md.root)}>{blocks}</div>;
}
// #endregion

// #region AspectRatio
const ar = stylex.create({ root: { position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden', borderRadius: radius.card }, r: (r: string) => ({ aspectRatio: r }) });
export function AspectRatio({ ratio = 16 / 9, children }: { ratio?: number; children: ReactNode }) {
  return <div {...stylex.props(ar.root, ar.r(String(ratio)))}>{children}</div>;
}
// #endregion

// #region Thumbnail
const th = stylex.create({
  root: { position: 'relative', display: 'inline-flex', flexShrink: 0, overflow: 'hidden', backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', color: colors.textMuted },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  sm: { width: 40, height: 40, borderRadius: 8 },
  md: { width: 64, height: 64, borderRadius: 12 },
  lg: { width: 96, height: 96, borderRadius: 14 },
  btn: { padding: 0, cursor: 'zoom-in', transitionProperty: 'transform', transitionDuration: '200ms', transform: { default: null, ':hover': 'scale(1.03)' } },
});
/** Small square image (or file-type placeholder). Pass onClick to open a Lightbox. */
export function Thumbnail({ src, alt, size = 'md', onClick, icon }: { src?: string; alt: string; size?: 'sm' | 'md' | 'lg'; onClick?: () => void; icon?: ReactNode }) {
  const inner = src ? <img src={src} alt={alt} {...stylex.props(th.img)} /> : (icon ?? <ImageIcon size={18} aria-label={alt} />);
  if (onClick)
    return (
      <button type="button" aria-label={`Open ${alt}`} onClick={onClick} {...stylex.props(th.root, th[size], th.btn)}>
        {inner}
      </button>
    );
  return <span {...stylex.props(th.root, th[size])}>{inner}</span>;
}
// #endregion

// #region VisuallyHidden
const vh = stylex.create({ root: { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 } });
/** Text for screen readers only. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span {...stylex.props(vh.root)}>{children}</span>;
}
// #endregion

// #region Token
const tk = stylex.create({
  root: { display: 'inline-flex', alignItems: 'center', gap: 6, height: { default: 26, '@media (pointer: coarse)': 32 }, paddingInline: 10, borderRadius: 999, fontSize: font.sm, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, whiteSpace: 'nowrap' },
  onAccent: { backgroundColor: `color-mix(in oklab, ${accent.base} 10%, ${colors.surface})`, borderColor: `color-mix(in oklab, ${accent.base} 35%, ${colors.border})` },
  x: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderWidth: 0, padding: { default: 2, '@media (pointer: coarse)': 10 }, marginRight: { default: -4, '@media (pointer: coarse)': -11 }, marginBlock: { default: 0, '@media (pointer: coarse)': -9 }, borderRadius: 999, backgroundColor: { default: 'transparent', ':hover': colors.hover }, color: colors.textMuted, cursor: 'pointer' },
});
/** A pill for a value: a filter, a tag, a mention. Removable when onRemove is given. */
export function Token({ children, icon, onRemove, selected }: { children: ReactNode; icon?: ReactNode; onRemove?: () => void; selected?: boolean }) {
  return (
    <span {...stylex.props(tk.root, selected && tk.onAccent)}>
      {icon}
      {children}
      {onRemove && (
        <button type="button" aria-label="Remove" onClick={onRemove} {...stylex.props(tk.x)}>
          <XIcon size={12} />
        </button>
      )}
    </span>
  );
}
// #endregion

// #region Carousel
const cs = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 },
  track: { display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', scrollBehavior: 'smooth', minWidth: 0 },
  slide: { flexShrink: 0, scrollSnapAlign: 'start', minWidth: 0 },
  bar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dots: { display: 'flex', gap: 6 },
  dot: { position: 'relative', width: 6, height: 6, borderRadius: 999, borderWidth: 0, padding: 0, backgroundColor: colors.borderStrong, cursor: 'pointer', transitionProperty: 'width, background-color', transitionDuration: '220ms', '::before': { content: '""', position: 'absolute', inset: { default: -6, '@media (pointer: coarse)': -13 } } },
  dotOn: { width: 18, backgroundColor: colors.text },
  w: (w: string) => ({ width: w }),
});
/** Scroll-snap carousel with arrows and dots. Works with touch, trackpad and keyboard; never auto-plays. */
export function Carousel({ slides, perView = 1, label }: { slides: ReactNode[]; perView?: number; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const go = (n: number) => {
    const t = track.current!;
    const k = Math.max(0, Math.min(slides.length - 1, n));
    (t.children[k] as HTMLElement)?.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'smooth' });
  };
  return (
    <section aria-roledescription="carousel" aria-label={label} {...stylex.props(cs.root)}>
      <div
        ref={track}
        tabIndex={0}
        onScroll={(e) => {
          const t = e.currentTarget;
          const w = (t.children[0] as HTMLElement)?.offsetWidth + 10;
          setI(Math.round(t.scrollLeft / w));
        }}
        onKeyDown={(e) => (e.key === 'ArrowRight' ? go(i + 1) : e.key === 'ArrowLeft' ? go(i - 1) : null)}
        {...stylex.props(cs.track)}
      >
        {slides.map((s, k) => (
          <div key={k} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${slides.length}`} {...stylex.props(cs.slide, cs.w(`calc((100% - ${(perView - 1) * 10}px) / ${perView})`))}>
            {s}
          </div>
        ))}
      </div>
      <div {...stylex.props(cs.bar)}>
        <div {...stylex.props(cs.dots)}>
          {slides.map((_, k) => (
            <button key={k} type="button" aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => go(k)} {...stylex.props(cs.dot, k === i && cs.dotOn)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" aria-label="Previous slide" disabled={i === 0} onClick={() => go(i - 1)} {...stylex.props(tk.root)} style={{ cursor: 'pointer', opacity: i === 0 ? 0.4 : 1 }}>
            <ArrowLeft size={14} />
          </button>
          <button type="button" aria-label="Next slide" disabled={i >= slides.length - perView} onClick={() => go(i + 1)} {...stylex.props(tk.root)} style={{ cursor: 'pointer', opacity: i >= slides.length - perView ? 0.4 : 1 }}>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
// #endregion

// #region LogViewer
export type LogLine = { t: string; level: 'info' | 'warn' | 'error' | 'debug'; msg: string };
const lv = stylex.create({
  root: { fontFamily: font.mono, fontSize: 12, lineHeight: 1.7, backgroundColor: colors.codeBg, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, borderRadius: radius.card, overflow: 'auto', minWidth: 0 },
  line: { display: 'grid', gridTemplateColumns: '84px 52px minmax(0, 1fr)', gap: 10, padding: '1px 14px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', backgroundColor: { default: 'transparent', ':hover': colors.hover } },
  t: { color: colors.textSubtle, fontVariantNumeric: 'tabular-nums' },
  info: { color: colors.textMuted },
  debug: { color: colors.textSubtle },
  warn: { color: `color-mix(in oklab, ${colors.warning} 70%, ${colors.text})` },
  error: { color: colors.danger, fontWeight: 500 },
  msg: { color: colors.text },
  errRow: { backgroundColor: `color-mix(in oklab, ${colors.danger} 7%, transparent)` },
});
/** Monospace log stream with level colours. Sticks to the bottom while following. */
export function LogViewer({ lines, maxHeight = 360, label = 'Logs' }: { lines: LogLine[]; maxHeight?: number; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [follow, setFollow] = useState(true);
  if (follow && ref.current) queueMicrotask(() => ref.current && (ref.current.scrollTop = ref.current.scrollHeight));
  return (
    <div ref={ref} role="log" aria-label={label} tabIndex={0} onScroll={(e) => setFollow(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight < 24)} {...stylex.props(lv.root)} style={{ maxHeight }}>
      <div style={{ padding: '8px 0' }}>
        {lines.map((l, i) => (
          <div key={i} {...stylex.props(lv.line, l.level === 'error' && lv.errRow)}>
            <span {...stylex.props(lv.t)}>{l.t}</span>
            <span {...stylex.props(lv[l.level])}>{l.level.toUpperCase()}</span>
            <span {...stylex.props(lv.msg)}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// #endregion
