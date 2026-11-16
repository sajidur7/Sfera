import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
import { Bold, Code, Heading2, Italic, Link2, List, ListOrdered, Quote, Strikethrough, Underline } from 'lucide-react';
import { accent, colors, font, radius } from './tokens.stylex';
import { IconButton, Toolbar, ToolbarSeparator } from './action';

// #region sanitize
const ALLOWED = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'A', 'UL', 'OL', 'LI', 'H2', 'H3', 'BLOCKQUOTE', 'CODE', 'DIV', 'SPAN']);
/** Keeps only safe formatting tags and http(s) links. Used for both editing and viewing. */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const walk = (el: Element) => {
    for (const c of Array.from(el.children)) {
      if (!ALLOWED.has(c.tagName)) {
        c.replaceWith(...Array.from(c.childNodes));
        continue;
      }
      for (const a of Array.from(c.attributes)) {
        if (!(c.tagName === 'A' && a.name === 'href' && /^https?:\/\//.test(a.value))) c.removeAttribute(a.name);
      }
      if (c.tagName === 'A') (c.setAttribute('target', '_blank'), c.setAttribute('rel', 'noreferrer'));
      walk(c);
    }
  };
  const root = doc.body.firstElementChild!;
  walk(root);
  return root.innerHTML;
}
// #endregion

const rt = stylex.create({
  root: { display: 'flex', flexDirection: 'column', borderWidth: 1, borderStyle: 'solid', borderColor: { default: colors.borderStrong, ':focus-within': accent.base }, borderRadius: radius.card, backgroundColor: colors.surface, overflow: 'hidden', minWidth: 0 },
  bar: { padding: 6, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, backgroundColor: colors.well },
  prose: {
    minHeight: 140,
    maxHeight: 360,
    overflowY: 'auto',
    padding: '12px 14px',
    outlineStyle: 'none',
    fontSize: { default: font.md, '@media (max-width: 640px)': font.lg },
    lineHeight: 1.6,
    color: colors.text,
    overflowWrap: 'anywhere',
  },
  view: { fontSize: font.md, lineHeight: 1.65, color: colors.text, overflowWrap: 'anywhere' },
  foot: { display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: font.xs, color: colors.textSubtle, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border },
  on: { backgroundColor: colors.pressed, color: colors.text },
});
// Prose styles for content inside the editor and viewer (StyleX cannot target descendants, so they are inline).
const proseCss = `
.sfera-prose p{margin:0 0 .6em}.sfera-prose h2{font-size:18px;font-weight:500;letter-spacing:-.015em;margin:.6em 0 .3em}
.sfera-prose ul,.sfera-prose ol{margin:0 0 .6em;padding-left:1.4em}.sfera-prose blockquote{margin:0 0 .6em;padding-left:12px;border-left:2px solid currentColor;opacity:.8}
.sfera-prose a{color:inherit;text-decoration:underline;text-underline-offset:3px}.sfera-prose code{font-family:"Geist Mono",ui-monospace,monospace;font-size:.9em;padding:1px 4px;border-radius:5px;background:rgba(127,127,127,.15)}
.sfera-prose:empty::before{content:attr(data-placeholder);opacity:.45}`;

// #region RichTextEditor
type Cmd = { cmd: string; arg?: string; label: string; icon: React.ReactNode; state?: string };
const cmds: (Cmd | '|')[] = [
  { cmd: 'bold', label: 'Bold', icon: <Bold size={15} />, state: 'bold' },
  { cmd: 'italic', label: 'Italic', icon: <Italic size={15} />, state: 'italic' },
  { cmd: 'underline', label: 'Underline', icon: <Underline size={15} />, state: 'underline' },
  { cmd: 'strikeThrough', label: 'Strikethrough', icon: <Strikethrough size={15} />, state: 'strikeThrough' },
  '|',
  { cmd: 'formatBlock', arg: 'H2', label: 'Heading', icon: <Heading2 size={15} /> },
  { cmd: 'formatBlock', arg: 'BLOCKQUOTE', label: 'Quote', icon: <Quote size={15} /> },
  { cmd: 'insertUnorderedList', label: 'Bulleted list', icon: <List size={15} />, state: 'insertUnorderedList' },
  { cmd: 'insertOrderedList', label: 'Numbered list', icon: <ListOrdered size={15} />, state: 'insertOrderedList' },
  '|',
  { cmd: 'code', label: 'Inline code', icon: <Code size={15} /> },
  { cmd: 'link', label: 'Link selection', icon: <Link2 size={15} /> },
];
/**
 * Rich text editor on contentEditable with a formatting toolbar, keyboard
 * shortcuts (mod+B/I/U), paste sanitising and an auto-link plugin that turns
 * typed URLs into links when you press space or Enter.
 */
export function RichTextEditor({ defaultValue = '', onChange, placeholder = 'Write something…', label = 'Rich text', autoLink = true }: { defaultValue?: string; onChange?: (html: string) => void; placeholder?: string; label?: string; autoLink?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [words, setWords] = useState(0);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = sanitizeHtml(defaultValue);
    setWords((ref.current?.innerText.trim().match(/\S+/g) ?? []).length);
  }, [defaultValue]);
  const sync = () => {
    const st: Record<string, boolean> = {};
    for (const c of cmds) if (c !== '|' && c.state) st[c.state] = document.queryCommandState(c.state);
    setActive(st);
    setWords((ref.current?.innerText.trim().match(/\S+/g) ?? []).length);
    onChange?.(sanitizeHtml(ref.current?.innerHTML ?? ''));
  };
  const run = (c: Cmd) => {
    ref.current?.focus();
    if (c.cmd === 'code') {
      const s = window.getSelection()?.toString();
      if (s) document.execCommand('insertHTML', false, `<code>${s.replace(/</g, '&lt;')}</code>`);
    } else if (c.cmd === 'link') {
      const s = window.getSelection()?.toString().trim();
      if (s) document.execCommand('createLink', false, /^https?:\/\//.test(s) ? s : `https://${s}`);
    } else document.execCommand(c.cmd, false, c.arg);
    sync();
  };
  const linkify = () => {
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (!node || node.nodeType !== 3 || node.parentElement?.closest('a')) return;
    const text = node.textContent ?? '';
    const m = text.slice(0, sel!.anchorOffset).match(/(https?:\/\/[^\s]+|www\.[^\s]+\.[a-z]{2,}[^\s]*)$/);
    if (!m) return;
    const end = sel!.anchorOffset;
    const r = document.createRange();
    r.setStart(node, end - m[0].length);
    r.setEnd(node, end);
    const a = document.createElement('a');
    a.href = m[0].startsWith('http') ? m[0] : `https://${m[0]}`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    r.surroundContents(a);
    sel!.collapse(a.nextSibling ?? a.parentNode!, a.nextSibling ? 0 : 1);
  };
  return (
    <div {...stylex.props(rt.root)}>
      <style>{proseCss}</style>
      <div {...stylex.props(rt.bar)}>
        <Toolbar label="Formatting">
          {cmds.map((c, i) =>
            c === '|' ? (
              <ToolbarSeparator key={i} />
            ) : (
              <IconButton key={c.label} size="sm" label={c.label} aria-pressed={c.state ? !!active[c.state] : undefined} icon={c.icon} onMouseDown={(e) => e.preventDefault()} onClick={() => run(c)} xstyle={c.state && active[c.state] ? rt.on : undefined} />
            ),
          )}
        </Toolbar>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={sync}
        onKeyUp={sync}
        onMouseUp={sync}
        onKeyDown={(e) => {
          if (autoLink && (e.key === ' ' || e.key === 'Enter')) linkify();
        }}
        onPaste={(e) => {
          e.preventDefault();
          const html = e.clipboardData.getData('text/html');
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertHTML', false, html ? sanitizeHtml(html) : text.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;')).replace(/\n/g, '<br>'));
          sync();
        }}
        className={`sfera-prose ${stylex.props(rt.prose).className ?? ''}`}
      />
      <div {...stylex.props(rt.foot)}>
        <span>{autoLink ? 'URLs become links as you type' : ''}</span>
        <span>{words} words</span>
      </div>
    </div>
  );
}
// #endregion

// #region RichTextView
/** Read-only rendering of editor HTML (sanitised). */
export function RichTextView({ html }: { html: string }) {
  return (
    <>
      <style>{proseCss}</style>
      <div className={`sfera-prose ${stylex.props(rt.view).className ?? ''}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    </>
  );
}
// #endregion
