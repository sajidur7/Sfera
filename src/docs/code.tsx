import * as stylex from '@stylexjs/stylex';
import { useMemo, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { accent, colors, font, radius } from '../sfera/tokens.stylex';
import { Button, Dialog, SegmentedControl, useClipboard, IconButton } from '../sfera';

const hl = stylex.create({
  kw: { color: `color-mix(in oklab, ${accent.base} 80%, ${colors.text})` },
  str: { color: `color-mix(in oklab, ${colors.success} 72%, ${colors.text})` },
  com: { color: colors.textSubtle, fontStyle: 'italic' },
  tag: { color: `color-mix(in oklab, #9A4DD6 78%, ${colors.text})` },
  num: { color: `color-mix(in oklab, ${colors.warning} 60%, ${colors.text})` },
  attr: { color: colors.textMuted },
});
const RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|const|let|function|return|if|else|type|interface|extends|as|new|default|await|async|true|false|null|undefined|typeof|keyof)\b|\b(\d+(?:\.\d+)?)\b|(\b[a-zA-Z-]+)(?==)/g;
export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(code.slice(last, idx));
    const st = m[1] ? hl.com : m[2] ? hl.str : m[3] ? hl.tag : m[4] ? hl.kw : m[5] ? hl.num : hl.attr;
    out.push(
      <span key={i++} {...stylex.props(st)}>
        {m[0]}
      </span>,
    );
    last = idx + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

const cv = stylex.create({
  pre: {
    margin: 0,
    padding: '14px 0',
    fontFamily: font.mono,
    fontSize: 12.5,
    lineHeight: 1.7,
    color: colors.text,
    overflow: 'auto',
    tabSize: 2,
    minWidth: 0,
  },
  line: { display: 'flex', paddingRight: 16 },
  num: { width: 44, flexShrink: 0, textAlign: 'right', paddingRight: 16, color: colors.textSubtle, userSelect: 'none' },
  code: { whiteSpace: 'pre' },
});
export function CodeView({ code, maxHeight }: { code: string; maxHeight?: number | string }) {
  const lines = useMemo(() => code.split('\n'), [code]);
  const hlLines = useMemo(() => lines.map((l) => highlight(l)), [lines]);
  return (
    <pre {...stylex.props(cv.pre)} style={{ maxHeight }} tabIndex={0}>
      {hlLines.map((l, i) => (
        <div key={i} {...stylex.props(cv.line)}>
          <span {...stylex.props(cv.num)}>{i + 1}</span>
          <code {...stylex.props(cv.code)}>{l.length ? l : ' '}</code>
        </div>
      ))}
    </pre>
  );
}

export function CopyButton({ text, label = 'Copy', iconOnly }: { text: string; label?: string; iconOnly?: boolean }) {
  const { copied, copy } = useClipboard();
  if (iconOnly) return <IconButton size="sm" label={copied ? 'Copied' : label} icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={() => copy(text)} />;
  return (
    <Button size="sm" variant="secondary" iconStart={copied ? <Check size={14} /> : <Copy size={14} />} onClick={() => copy(text)}>
      {copied ? 'Copied' : label}
    </Button>
  );
}

const pp = stylex.create({
  head: { display: 'flex', flexDirection: 'column', gap: 6, padding: '0 20px 14px' },
  path: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted, overflowWrap: 'anywhere' },
  req: { fontSize: font.sm, color: colors.textMuted, lineHeight: 1.5 },
  install: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.text,
    padding: '6px 6px 6px 10px',
    borderRadius: radius.control,
    backgroundColor: colors.codeBg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  dollar: { color: colors.textSubtle },
  grow: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' },
  bar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', padding: '10px 16px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, backgroundColor: colors.well },
  body: { backgroundColor: colors.codeBg },
  foot: { padding: '10px 20px', fontSize: font.xs, color: colors.textMuted, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border },
});

export type CodeTab = { id: string; label: string; code: string; path: string };
/** The code popup: title, file path, what it needs, install line, Copy, then the code. */
export function CodePopup({
  open,
  onClose,
  title,
  tabs,
  requires,
  install,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  tabs: CodeTab[];
  requires: string;
  install: string;
}) {
  const [tab, setTab] = useState(tabs[0]?.id);
  const cur = tabs.find((t) => t.id === tab) ?? tabs[0];
  return (
    <Dialog open={open} onClose={onClose} size="xl" title={title} flush>
      <div {...stylex.props(pp.head)}>
        <span {...stylex.props(pp.path)}>{cur.path}</span>
        <span {...stylex.props(pp.req)}>{requires}</span>
        <div {...stylex.props(pp.install)}>
          <span {...stylex.props(pp.dollar)}>$</span>
          <span {...stylex.props(pp.grow)}>{install}</span>
          <CopyButton text={install} iconOnly label="Copy install command" />
        </div>
      </div>
      <div {...stylex.props(pp.bar)}>
        {tabs.length > 1 ? <SegmentedControl size="sm" value={tab} onChange={setTab} options={tabs.map((t) => ({ value: t.id, label: t.label }))} label="Code view" /> : <span />}
        <CopyButton text={cur.code} />
      </div>
      <div {...stylex.props(pp.body)}>
        <CodeView code={cur.code} maxHeight="min(56vh, 520px)" />
      </div>
      <div {...stylex.props(pp.foot)}>Foundation required once: tokens.stylex.ts, themes.ts, hooks.ts and shared.ts, plus SferaProvider at the root.</div>
    </Dialog>
  );
}
