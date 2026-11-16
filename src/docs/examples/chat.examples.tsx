import { useEffect, useState } from 'react';
import { Badge, ChatComposer, ChatLayout, ChatMessage, ChatSystemMessage, ChatTokenizedText, ChatToolCalls, Markdown, useStreamingText, useToast, colors, type ToolCall } from '../../sfera';

const answer = 'Revenue grew **12%** week over week. Most of it came from the `Autumn glaze` launch:\n\n- 38 orders from returning customers\n- Average order up to $128\n- 3 failed deliveries need a reship';

// #region ChatExample
export function ChatExample() {
  const toast = useToast();
  const [msgs, setMsgs] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'user', text: 'How did the store do this week? cc @ana' },
  ]);
  const [busy, setBusy] = useState(true);
  const [calls, setCalls] = useState<ToolCall[]>([
    { id: '1', name: 'Query', detail: 'orders where week = 46', status: 'done' },
    { id: '2', name: 'Compare', detail: 'revenue vs week 45', status: 'running' },
  ]);
  const [streamed, done] = useStreamingText(answer, 40, busy);
  useEffect(() => {
    const t = setTimeout(() => setCalls((c) => c.map((x) => ({ ...x, status: 'done' }))), 900);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (busy && done) {
      setBusy(false);
      setMsgs((m) => [...m, { role: 'assistant', text: answer }]);
    }
  }, [busy, done]);
  return (
    <div style={{ height: 520, width: '100%', borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
      <ChatLayout
        composer={
          <ChatComposer
            busy={busy}
            onStop={() => setBusy(false)}
            onAttach={() => toast({ title: 'Attachments are coming soon' })}
            start={<Badge variant="outline">Compose</Badge>}
            onSend={(text) => {
              setMsgs((m) => [...m, { role: 'user', text }, { role: 'assistant', text: `You said “${text}”. This demo echoes your message.` }]);
            }}
          />
        }
      >
        <ChatSystemMessage>Today · Kiln workspace</ChatSystemMessage>
        {msgs.map((m, i) =>
          m.role === 'user' ? (
            <ChatMessage key={i} role="user" time="9:41">
              <ChatTokenizedText text={m.text} />
            </ChatMessage>
          ) : (
            <ChatMessage key={i} role="assistant" name="Kiln Assistant" time="9:41" copyText={m.text} onRetry={() => toast({ title: 'Regenerating…' })}>
              <Markdown source={m.text} />
            </ChatMessage>
          ),
        )}
        {busy && (
          <ChatMessage role="assistant" name="Kiln Assistant" streaming>
            <ChatToolCalls calls={calls} />
            <div style={{ marginTop: 10 }}>
              <Markdown source={streamed || ' '} />
            </div>
          </ChatMessage>
        )}
      </ChatLayout>
    </div>
  );
}
// #endregion

// #region ToolCallsExample
export function ToolCallsExample() {
  return (
    <ChatToolCalls
      calls={[
        { id: 'a', name: 'Read', detail: 'src/sfera/forms.tsx', status: 'done' },
        { id: 'b', name: 'Edit', detail: 'Select: add width prop', status: 'done', output: '+12 −3 lines' },
        { id: 'c', name: 'Run', detail: 'npm run build', status: 'running' },
        { id: 'd', name: 'Fetch', detail: 'https://status.example.com', status: 'failed', output: 'Timed out after 10s' },
      ]}
    />
  );
}
// #endregion

// #region ComposerExample
export function ComposerExample() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <ChatComposer placeholder="Ask about your orders…" onSend={(t) => setSent((s) => [t, ...s].slice(0, 3))} />
      <div style={{ fontSize: 13, opacity: 0.7 }}>{sent.length ? `Sent: ${sent.join(' · ')}` : 'Press Enter to send, Shift+Enter for a new line.'}</div>
    </div>
  );
}
// #endregion
