import * as stylex from '@stylexjs/stylex';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronRight, CircleAlert, Copy, Mic, Paperclip, RotateCcw, Square, ThumbsDown, ThumbsUp } from 'lucide-react';
import { accent, colors, font, motion } from './tokens.stylex';
import { fx } from './shared';
import { IconButton } from './action';
import { Avatar } from './content';
import { Tooltip } from './overlay';
import { useClipboard } from './hooks';

const spin = stylex.keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } });
const blink = stylex.keyframes({ '0%': { opacity: 1 }, '50%': { opacity: 0 }, '100%': { opacity: 1 } });

// #region ChatLayout
const cl = stylex.create({
  root: { position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', backgroundColor: colors.page },
  scroll: { flexGrow: 1, minHeight: 0, overflowY: 'auto', scrollBehavior: 'smooth' },
  inner: { maxWidth: 760, marginInline: 'auto', padding: { default: '24px 20px', '@media (max-width: 640px)': '16px 12px' }, display: 'flex', flexDirection: 'column', gap: 22 },
  foot: { padding: { default: '0 20px 16px', '@media (max-width: 640px)': '0 8px 8px' }, maxWidth: 800, width: '100%', marginInline: 'auto' },
  jump: { position: 'absolute', left: '50%', bottom: 96, transform: 'translateX(-50%)', zIndex: 2 },
});
/** Chat frame: scrolling message area that sticks to the bottom, a jump-to-latest button, and the composer. */
export function ChatLayout({ children, composer }: { children: ReactNode; composer: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [away, setAway] = useState(false);
  const stick = useRef(true);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  });
  return (
    <div {...stylex.props(cl.root)}>
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const far = el.scrollHeight - el.scrollTop - el.clientHeight > 80;
          stick.current = !far;
          setAway(far);
        }}
        {...stylex.props(cl.scroll)}
      >
        <div {...stylex.props(cl.inner)} role="log" aria-live="polite">
          {children}
        </div>
      </div>
      {away && (
        <span {...stylex.props(cl.jump)}>
          <IconButton label="Jump to latest" variant="secondary" shape="circle" icon={<ArrowDown size={16} />} onClick={() => ref.current?.scrollTo({ top: ref.current.scrollHeight })} />
        </span>
      )}
      <div {...stylex.props(cl.foot)}>{composer}</div>
    </div>
  );
}
// #endregion

// #region ChatMessage
const cm = stylex.create({
  row: { display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 },
  mine: { justifyContent: 'flex-end' },
  body: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, maxWidth: '100%' },
  bodyMine: { alignItems: 'flex-end', maxWidth: 'min(560px, 85%)' },
  bubble: { padding: '9px 14px', borderRadius: 18, borderBottomRightRadius: 6, backgroundColor: colors.well, color: colors.text, fontSize: font.md, lineHeight: 1.55, overflowWrap: 'anywhere' },
  text: { fontSize: font.md, lineHeight: 1.65, color: colors.text, overflowWrap: 'anywhere', minWidth: 0 },
  meta: { display: 'flex', alignItems: 'center', gap: 8, fontSize: font.xs, color: colors.textSubtle },
  name: { fontWeight: 500, color: colors.text },
  actions: { display: 'flex', gap: 2, marginLeft: -6 },
  caret: { display: 'inline-block', width: 7, height: '1em', marginLeft: 2, verticalAlign: '-2px', backgroundColor: colors.text, borderRadius: 1, animationName: blink, animationDuration: '1s', animationIterationCount: 'infinite' },
  error: { display: 'flex', alignItems: 'center', gap: 8, fontSize: font.sm, color: colors.danger },
});
/**
 * One message. `role="user"` renders a right-aligned bubble; `assistant` renders
 * plain text with avatar, metadata and actions (copy, retry, feedback).
 */
export function ChatMessage({
  role,
  name,
  time,
  children,
  streaming,
  error,
  onRetry,
  copyText,
}: {
  role: 'user' | 'assistant';
  name?: string;
  time?: string;
  children: ReactNode;
  streaming?: boolean;
  error?: string;
  onRetry?: () => void;
  copyText?: string;
}) {
  const { copied, copy } = useClipboard();
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  if (role === 'user')
    return (
      <div {...stylex.props(cm.row, cm.mine)}>
        <div {...stylex.props(cm.body, cm.bodyMine)}>
          <div {...stylex.props(cm.bubble)}>{children}</div>
          {time && <span {...stylex.props(cm.meta)}>{time}</span>}
        </div>
      </div>
    );
  return (
    <div {...stylex.props(cm.row)}>
      <Avatar name={name ?? 'Assistant'} size="md" square />
      <div {...stylex.props(cm.body)} style={{ flex: 1 }}>
        <span {...stylex.props(cm.meta)}>
          <span {...stylex.props(cm.name)}>{name ?? 'Assistant'}</span>
          {time}
        </span>
        <div {...stylex.props(cm.text)}>
          {children}
          {streaming && <span aria-hidden {...stylex.props(cm.caret)} />}
        </div>
        {error && (
          <div role="alert" {...stylex.props(cm.error)}>
            <CircleAlert size={15} /> {error}
          </div>
        )}
        {!streaming && (
          <div {...stylex.props(cm.actions)}>
            {copyText && <IconButton size="sm" label={copied ? 'Copied' : 'Copy'} icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={() => copy(copyText)} />}
            {onRetry && <IconButton size="sm" label="Retry" icon={<RotateCcw size={14} />} onClick={onRetry} />}
            <IconButton size="sm" label="Good response" aria-pressed={vote === 'up'} icon={<ThumbsUp size={14} fill={vote === 'up' ? 'currentColor' : 'none'} />} onClick={() => setVote(vote === 'up' ? null : 'up')} />
            <IconButton size="sm" label="Bad response" aria-pressed={vote === 'down'} icon={<ThumbsDown size={14} fill={vote === 'down' ? 'currentColor' : 'none'} />} onClick={() => setVote(vote === 'down' ? null : 'down')} />
          </div>
        )}
      </div>
    </div>
  );
}
// #endregion

// #region ChatSystemMessage
const sm = stylex.create({
  root: { display: 'flex', alignItems: 'center', gap: 12, fontSize: font.xs, color: colors.textSubtle, fontFamily: font.mono },
  line: { flexGrow: 1, height: 1, backgroundColor: colors.border },
});
/** Divider-style notice inside a conversation ("Model switched", "Today"). */
export function ChatSystemMessage({ children }: { children: ReactNode }) {
  return (
    <div role="note" {...stylex.props(sm.root)}>
      <span {...stylex.props(sm.line)} />
      {children}
      <span {...stylex.props(sm.line)} />
    </div>
  );
}
// #endregion

// #region ChatToolCalls
export type ToolCall = { id: string; name: string; detail: string; status: 'running' | 'done' | 'failed'; output?: string };
const tc = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 4, padding: 6, borderRadius: 16, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  head: { display: 'flex', alignItems: 'center', gap: 6, minHeight: { default: 0, '@media (pointer: coarse)': 36 }, padding: '4px 6px', borderWidth: 0, backgroundColor: 'transparent', color: colors.textMuted, fontSize: font.sm, cursor: 'pointer', textAlign: 'left', borderRadius: 8 },
  chev: { transitionProperty: 'transform', transitionDuration: motion.base, transitionTimingFunction: motion.ease },
  open: { transform: 'rotate(90deg)' },
  list: { display: 'flex', flexDirection: 'column', gap: 2, padding: 4, borderRadius: 12, backgroundColor: colors.surface },
  row: { display: 'grid', gridTemplateColumns: '18px auto minmax(0, 1fr)', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: font.sm, color: colors.text },
  name: { fontWeight: 500, whiteSpace: 'nowrap' },
  detail: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted, padding: '2px 6px', borderRadius: 6, backgroundColor: colors.codeBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', justifySelf: 'start', maxWidth: '100%' },
  spinner: { width: 13, height: 13, borderRadius: '50%', borderWidth: 2, borderStyle: 'solid', borderColor: colors.track, borderTopColor: accent.base, animationName: spin, animationDuration: '700ms', animationIterationCount: 'infinite', animationTimingFunction: 'linear' },
  ok: { color: colors.success, display: 'inline-flex' },
  bad: { color: colors.danger, display: 'inline-flex' },
  output: { gridColumn: '2 / -1', fontFamily: font.mono, fontSize: 12, color: colors.textMuted, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
});
/** Collapsible summary of what the assistant did: one row per tool call with live status. */
export function ChatToolCalls({ calls, defaultOpen = true }: { calls: ToolCall[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const running = calls.filter((c) => c.status === 'running').length;
  return (
    <div {...stylex.props(tc.root)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} {...stylex.props(tc.head, fx.focus)}>
        <ChevronRight size={14} {...stylex.props(tc.chev, open && tc.open)} />
        {calls.length} tool calls{running ? ` · ${running} running` : ''}
      </button>
      {open && (
        <div {...stylex.props(tc.list)}>
          {calls.map((c) => (
            <div key={c.id} {...stylex.props(tc.row)}>
              {c.status === 'running' ? <span role="status" aria-label="Running" {...stylex.props(tc.spinner)} /> : c.status === 'done' ? <span {...stylex.props(tc.ok)}><Check size={14} aria-label="Done" /></span> : <span {...stylex.props(tc.bad)}><CircleAlert size={14} aria-label="Failed" /></span>}
              <span {...stylex.props(tc.name)}>{c.name}</span>
              <span {...stylex.props(tc.detail)}>{c.detail}</span>
              {c.output && <span {...stylex.props(tc.output)}>{c.output}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// #endregion

// #region ChatTokenizedText
const tt = stylex.create({
  mention: { display: 'inline-flex', alignItems: 'center', paddingInline: 5, borderRadius: 6, fontWeight: 500, color: `color-mix(in oklab, ${accent.base} 80%, ${colors.text})`, backgroundColor: `color-mix(in oklab, ${accent.base} 10%, transparent)` },
  tag: { fontFamily: font.mono, fontSize: '0.92em', color: colors.textMuted },
});
/** Renders @mentions and #tags inside plain text as tokens. */
export function ChatTokenizedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(@[\w.-]+|#[\w-]+)/g).map((p, i) =>
        p.startsWith('@') ? (
          <span key={i} {...stylex.props(tt.mention)}>{p}</span>
        ) : p.startsWith('#') ? (
          <span key={i} {...stylex.props(tt.tag)}>{p}</span>
        ) : (
          p
        ),
      )}
    </>
  );
}
// #endregion

// #region ChatComposer
const cc = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.borderStrong, ':focus-within': colors.textSubtle },
    backgroundColor: colors.surface,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -16px rgba(0,0,0,0.2)',
  },
  input: {
    width: '100%',
    minHeight: 24,
    maxHeight: 200,
    resize: 'none',
    borderWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    color: colors.text,
    fontSize: { default: font.md, '@media (max-width: 640px)': font.lg },
    lineHeight: 1.5,
    padding: '6px 8px',
    '::placeholder': { color: colors.textSubtle },
  },
  bar: { display: 'flex', alignItems: 'center', gap: 4 },
  grow: { flexGrow: 1 },
  send: { borderRadius: 999 },
  listening: { color: colors.danger },
});
/** Message composer: auto-growing text, attach, dictation, send (Enter) / stop. Shift+Enter adds a line. */
export function ChatComposer({ onSend, busy, onStop, placeholder = 'Message…', start, onAttach }: { onSend: (text: string) => void; busy?: boolean; onStop?: () => void; placeholder?: string; start?: ReactNode; onAttach?: () => void }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const rec = useRef<{ stop: () => void } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(200, el.scrollHeight)}px`;
  }, [text]);
  const send = () => {
    if (!text.trim() || busy) return;
    onSend(text.trim());
    setText('');
  };
  type SR = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void };
  const SpeechRec = typeof window !== 'undefined' ? ((window as unknown as Record<string, new () => SR>).SpeechRecognition ?? (window as unknown as Record<string, new () => SR>).webkitSpeechRecognition) : undefined;
  const dictate = () => {
    if (!SpeechRec) return;
    if (listening) return rec.current?.stop();
    const r = new SpeechRec();
    r.lang = 'en-US';
    r.interimResults = false;
    r.onresult = (e) => setText((t) => (t ? t + ' ' : '') + e.results[0][0].transcript);
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };
  return (
    <div {...stylex.props(cc.root)}>
      <textarea
        ref={ref}
        rows={1}
        aria-label="Message"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) (e.preventDefault(), send());
        }}
        {...stylex.props(cc.input)}
      />
      <div {...stylex.props(cc.bar)}>
        {onAttach && <IconButton size="sm" label="Attach file" icon={<Paperclip size={15} />} onClick={onAttach} />}
        {start}
        <span {...stylex.props(cc.grow)} />
        <Tooltip content={SpeechRec ? (listening ? 'Stop dictation' : 'Dictate') : 'Dictation is not available in this browser'}>
          <span>
            <IconButton size="sm" label={listening ? 'Stop dictation' : 'Dictate'} disabled={!SpeechRec} icon={<Mic size={15} />} onClick={dictate} xstyle={listening && cc.listening} />
          </span>
        </Tooltip>
        {busy ? (
          <IconButton size="sm" variant="primary" shape="circle" label="Stop generating" icon={<Square size={12} fill="currentColor" />} onClick={onStop} />
        ) : (
          <IconButton size="sm" variant="primary" shape="circle" label="Send message" disabled={!text.trim()} icon={<ArrowUp size={15} />} onClick={send} />
        )}
      </div>
    </div>
  );
}
// #endregion

// #region useStreamingText
/** Reveals `full` word by word, like a streamed answer. Returns [shown text, done]. */
export function useStreamingText(full: string, speed = 28, run = true) {
  const [n, setN] = useState(run ? 0 : full.length);
  useEffect(() => {
    if (!run) return setN(full.length);
    setN(0);
    const words = full.split(/(\s+)/);
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setN(words.slice(0, i).join('').length);
      if (i >= words.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [full, speed, run]);
  return [full.slice(0, n), n >= full.length] as const;
}
// #endregion

