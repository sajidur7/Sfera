import { useEffect, useState } from 'react';
import { BookOpen, Bot, Copy, FileText, Globe, Library, MessageSquare, Plus, Search, Trash2, Upload, Wrench, Database, Mail, Calendar } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { muse } from './products';
import { Cols, Page } from './ui';

const answer = `Here is a short plan for the **Black Friday** email:\n\n1. Subject: “48 hours early — Ash Grey is back”\n2. Lead with the restock and a 15% code for VIPs\n3. One button: **Shop early access**\n\nI checked last year: early-access emails had a \`41%\` open rate, 9 points above the average.`;

// ───────── Chat with model picker and context meter
export function AiChatScreen() {
  const toast = O.useToast();
  const [msgs, setMsgs] = useState<{ role: 'user' | 'assistant'; text: string }[]>([{ role: 'user', text: 'Draft a plan for the Black Friday email for @kiln' }]);
  const [busy, setBusy] = useState(true);
  const [model, setModel] = useState('compose');
  const [streamed, done] = O.useStreamingText(answer, 35, busy);
  useEffect(() => {
    if (busy && done) {
      setBusy(false);
      setMsgs((m) => [...m, { role: 'assistant', text: answer }]);
    }
  }, [busy, done]);
  const tokens = 12000 + msgs.reduce((a, m) => a + m.text.length * 4, 0);
  return (
    <Screen product={muse} active="chat" flush topbar={<O.HStack gap={2} grow><O.Text weight="medium">Black Friday email</O.Text><span style={{ marginLeft: 'auto' }}><O.Select size="sm" width="auto" label="Model" value={model} onChange={setModel} options={[{ value: 'compose', label: 'Compose', description: 'Balanced' }, { value: 'swift', label: 'Swift', description: 'Fastest' }, { value: 'depth', label: 'Depth', description: 'Careful, slower' }]} /></span></O.HStack>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', height: 'calc(100dvh - 53px)' }}>
        <O.ChatLayout
          composer={
            <O.VStack gap={2}>
              <O.HStack gap={2} wrap>
                {['Make it shorter', 'Write the subject lines', 'Translate to Portuguese'].map((s) => (
                  <O.Button key={s} size="xs" variant="soft" onClick={() => setMsgs((m) => [...m, { role: 'user', text: s }, { role: 'assistant', text: `Sure — here is a version: *${s.toLowerCase()}* applied to the plan above.` }])}>{s}</O.Button>
                ))}
              </O.HStack>
              <O.ChatComposer busy={busy} onStop={() => setBusy(false)} onAttach={() => toast({ title: 'Attach a file from Knowledge — coming soon' })} start={<O.Badge variant="outline">{(tokens / 1000).toFixed(1)}k / 200k</O.Badge>} onSend={(t) => setMsgs((m) => [...m, { role: 'user', text: t }, { role: 'assistant', text: `Noted. I will use that: “${t}”.` }])} />
            </O.VStack>
          }
        >
          <O.ChatSystemMessage>Today · {model} model</O.ChatSystemMessage>
          {msgs.map((m, i) =>
            m.role === 'user' ? (
              <O.ChatMessage key={i} role="user" time="now"><O.ChatTokenizedText text={m.text} /></O.ChatMessage>
            ) : (
              <O.ChatMessage key={i} role="assistant" name="Muse" copyText={m.text} onRetry={() => toast({ title: 'Regenerating…' })}>
                <O.Markdown source={m.text} />
                <O.HStack gap={1}><O.Citation variant="source" href="https://kiln.shop/reports/bf-2025" title="BF 2025 report" /><O.Citation variant="source" href="https://kiln.shop/glazes" title="Glazes" /></O.HStack>
              </O.ChatMessage>
            ),
          )}
          {busy && (
            <O.ChatMessage role="assistant" name="Muse" streaming>
              <O.ChatToolCalls calls={[{ id: '1', name: 'Search', detail: 'kiln.shop campaign reports', status: 'done' }, { id: '2', name: 'Read', detail: 'BF 2025 report.pdf', status: done ? 'done' : 'running' }]} />
              <div style={{ marginTop: 10 }}><O.Markdown source={streamed || ' '} /></div>
            </O.ChatMessage>
          )}
        </O.ChatLayout>
      </div>
    </Screen>
  );
}

// ───────── History
export function AiHistoryScreen() {
  const { open } = useScreenNav();
  const [q, setQ] = useState('');
  const chats = [
    ['Black Friday email', 'Today', 'Compose'],
    ['Refund policy wording', 'Today', 'Swift'],
    ['Q4 board update outline', 'Yesterday', 'Depth'],
    ['SQL for cohort retention', 'Nov 12', 'Depth'],
    ['Translate product pages', 'Nov 10', 'Swift'],
    ['Interview questions: designer', 'Nov 3', 'Compose'],
  ].filter(([t]) => t.toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(chats.map((c) => c[1]))];
  return (
    <Screen product={muse} active="history" topbar={<O.Text weight="medium">History</O.Text>}>
      <Page title="History" max={860}>
        <O.SearchInput value={q} onValueChange={setQ} placeholder="Search chats" />
        {groups.map((g) => (
          <O.Section key={g} title={g}>
            <O.List>
              {chats.filter((c) => c[1] === g).map(([t, , m], i, arr) => (
                <O.ListItem key={t} last={i === arr.length - 1} leading={<MessageSquare size={16} />} title={t} subtitle={`${m} model`} trailing={<O.MoreMenu size="sm" items={[{ label: 'Rename' }, { label: 'Duplicate', icon: <Copy size={15} /> }, { type: 'divider' }, { label: 'Delete', danger: true, icon: <Trash2 size={15} /> }]} />} onClick={() => open('ai-chat')} />
              ))}
            </O.List>
          </O.Section>
        ))}
        {!chats.length && <O.EmptyState icon={<Search size={18} />} title="No chats match" />}
      </Page>
    </Screen>
  );
}

// ───────── Agents gallery
export function AiAgentsScreen() {
  const { open } = useScreenNav();
  const [on, setOn] = useState<Record<string, boolean>>({ a: true, b: true, c: false });
  const agents = [
    { id: 'a', name: 'Support triage', d: 'Tags and routes new tickets in Harbor', icon: <Mail size={18} />, runs: 1240, ok: 98.6, trigger: 'New ticket', last: '2 min ago', spark: [32, 41, 38, 52, 47, 58, 61, 44, 39, 55, 63, 59, 66, 70], color: O.seriesColors.teal },
    { id: 'b', name: 'Weekly revenue brief', d: 'Writes Monday’s summary from Kiln and Ledger', icon: <Calendar size={18} />, runs: 46, ok: 100, trigger: 'Mondays 08:00', last: '4 days ago', spark: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], color: O.seriesColors.blue },
    { id: 'c', name: 'Lead researcher', d: 'Enriches new Relay companies from the web', icon: <Globe size={18} />, runs: 0, ok: 0, trigger: 'New company', last: 'Never run', spark: [], color: O.seriesColors.violet },
  ];
  const recent = [
    { who: 'Support triage', what: 'Routed #4821 “Refund for order 1093” to Billing', when: '2 min', tone: 'success' as const },
    { who: 'Support triage', what: 'Tagged #4820 as Shipping · Urgent', when: '9 min', tone: 'success' as const },
    { who: 'Support triage', what: 'Could not read attachment on #4817, left for a person', when: '31 min', tone: 'warning' as const },
    { who: 'Weekly revenue brief', what: 'Posted the 9 Nov summary to #finance', when: '4 days', tone: 'success' as const },
  ];
  return (
    <Screen product={muse} active="agents" topbar={<O.Text weight="medium">Agents</O.Text>}>
      <Page title="Agents" subtitle="Assistants that run on their own, on a trigger or a schedule." actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => open('ai-builder')}>New agent</O.Button>}>
        <O.Grid min={280} gap={3}>
          {agents.map((a) => (
            <O.Well key={a.id} fill>
              <O.Card grow>
                <O.VStack gap={3} grow>
                  <O.HStack justify="between"><span style={{ width: 40, height: 40, borderRadius: 12, background: a.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</span><O.Switch aria-label={`Enable ${a.name}`} checked={on[a.id]} onChange={(v) => setOn({ ...on, [a.id]: v })} /></O.HStack>
                  <O.VStack gap={0}><O.Text weight="medium">{a.name}</O.Text><O.Text size="sm" tone="muted">{a.d}</O.Text></O.VStack>
                  <div style={{ marginTop: 'auto' }}>
                    <O.MetadataList items={[{ label: 'Trigger', value: a.trigger }, { label: 'Last run', value: a.last }]} />
                  </div>
                </O.VStack>
              </O.Card>
              <O.HStack justify="between">
                <O.Text size="xs" tone="muted">{a.runs ? `${a.runs.toLocaleString('en-US')} runs · ${a.ok}% ok` : 'Turn it on to start'}</O.Text>
                <O.Button size="xs" variant="ghost" onClick={() => open('ai-builder')}>Edit</O.Button>
              </O.HStack>
            </O.Well>
          ))}
        </O.Grid>
        <O.Well title="Recent runs" subtitle="Across all agents, newest first">
          <O.Card padding="sm">
            <O.List>
              {recent.map((r, i) => (
                <O.ListItem key={i} last={i === recent.length - 1} leading={<O.StatusDot tone={r.tone} />} title={r.what} subtitle={r.who} trailing={<O.Text size="sm" tone="muted" numeric>{r.when}</O.Text>} />
              ))}
            </O.List>
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Agent builder: instructions + tools + test chat
export function AiBuilderScreen() {
  const toast = O.useToast();
  const [name, setName] = useState('Support triage');
  const [tools, setTools] = useState(['harbor', 'kb']);
  const [temp, setTemp] = useState(3);
  const [test, setTest] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  return (
    <Screen product={muse} active="builder" topbar={<O.HStack gap={2}><O.Text weight="medium">{name}</O.Text><O.Badge>Draft</O.Badge></O.HStack>}>
      <Page max={1320}>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)">
          <O.VStack gap={3}>
            <O.Well title="Instructions">
              <O.Card>
                <O.VStack gap={4}>
                  <O.Field label="Name"><O.TextInput value={name} onChange={(e) => setName(e.target.value)} /></O.Field>
                  <O.Field label="What it should do" help="Plain language. Be specific about tone and limits."><O.TextArea rows={6} defaultValue={'Read each new Harbor ticket. Tag it (billing, sso, bug, how-to), set priority, and assign to the right queue.\nNever reply to customers yourself.'} /></O.Field>
                  <O.Field label="Creativity"><O.Slider value={temp} onChange={setTemp} min={0} max={4} format={(n) => ['Precise', 'Low', 'Balanced', 'High', 'Free'][n]} /></O.Field>
                </O.VStack>
              </O.Card>
            </O.Well>
            <O.Well title="Tools" subtitle="What the agent may use">
              <O.CheckboxList label="Tools" value={tools} onChange={setTools} items={[{ value: 'harbor', label: 'Harbor tickets', description: 'Read, tag, assign', meta: 'read/write' }, { value: 'kb', label: 'Help center', description: 'Search articles', meta: 'read' }, { value: 'web', label: 'Web search', description: 'Public pages', meta: 'read' }, { value: 'email', label: 'Send email', description: 'Off for this agent', meta: 'write', disabled: true }]} />
            </O.Well>
            <O.HStack justify="end" gap={2}><O.Button onClick={() => toast({ title: 'Draft saved' })}>Save draft</O.Button><O.Button variant="primary" onClick={() => toast({ title: `${name} published`, tone: 'success' })}>Publish</O.Button></O.HStack>
          </O.VStack>
          <O.Well title="Test" subtitle="Try it before you publish">
            <O.Card padding="none">
              <div style={{ height: 520 }}>
                <O.ChatLayout composer={<O.ChatComposer placeholder="Paste a sample ticket…" onSend={(t) => setTest((x) => [...x, { role: 'user', text: t }, { role: 'assistant', text: `**Tags:** billing · **Priority:** high · **Queue:** Billing team\n\nReason: mentions a charge and an invoice number.` }])} />}>
                  {test.length === 0 ? <O.EmptyState bordered={false} icon={<Bot size={18} />} title="No test messages yet" description="Paste a ticket to see how the agent tags it." /> : test.map((m, i) => (m.role === 'user' ? <O.ChatMessage key={i} role="user">{m.text}</O.ChatMessage> : <O.ChatMessage key={i} role="assistant" name={name}><O.Markdown source={m.text} /></O.ChatMessage>))}
                </O.ChatLayout>
              </div>
            </O.Card>
            <O.ChatToolCalls defaultOpen={false} calls={tools.map((t, i) => ({ id: t, name: ['Harbor', 'Help center', 'Web'][['harbor', 'kb', 'web'].indexOf(t)] ?? t, detail: 'connected', status: 'done' as const })).filter(Boolean)} />
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Knowledge files
export function AiKnowledgeScreen() {
  const toast = O.useToast();
  const [files, setFiles] = useState([
    { n: 'Refund policy.pdf', s: '212 KB', st: 'Indexed', chunks: 41 },
    { n: 'Brand voice.md', s: '18 KB', st: 'Indexed', chunks: 9 },
    { n: 'Pricing 2027.xlsx', s: '1.2 MB', st: 'Processing', chunks: 0 },
    { n: 'help.kiln.shop', s: 'Website · 84 pages', st: 'Indexed', chunks: 612 },
  ]);
  return (
    <Screen product={muse} active="knowledge" topbar={<O.Text weight="medium">Knowledge</O.Text>}>
      <Page title="Knowledge" subtitle="Files and sites Muse can cite in answers." max={1040}>
        <O.Field label="Add sources"><O.FileInput hint="PDF, Markdown, CSV, XLSX · up to 50 MB" onChange={(f) => f.length && (setFiles((x) => [...x, ...f.map((ff) => ({ n: ff.name, s: `${Math.round(ff.size / 1000)} KB`, st: 'Processing', chunks: 0 }))]), toast({ title: `${f.length} file(s) queued` }))} /></O.Field>
        <O.UsageMeter title="Index" total={2000} format={(n) => `${Math.round(n)} chunks`} segments={[{ label: 'Documents', value: 50, color: O.seriesColors.blue }, { label: 'Websites', value: 612, color: O.seriesColors.teal }]} />
        <O.Card padding="none">
          <O.Table label="Sources" rows={files} rowKey={(f) => f.n} columns={[
            { key: 'n', header: 'Source', render: (f) => <O.HStack gap={2}>{f.n.includes('.') && !f.n.startsWith('help') ? <FileText size={15} /> : <Globe size={15} />}{f.n}</O.HStack> },
            { key: 's', header: 'Size', hideBelow: 'sm', render: (f) => <O.Text as="span" size="sm" tone="muted">{f.s}</O.Text> },
            { key: 'st', header: 'Status', render: (f) => (f.st === 'Processing' ? <O.HStack gap={2}><O.Spinner size="sm" /><O.Text as="span" size="sm">Processing</O.Text></O.HStack> : <O.StatusChip size="sm" tone="success">Indexed · {f.chunks}</O.StatusChip>) },
            { key: 'x', header: '', align: 'right', render: (f) => <O.IconButton size="sm" label={`Remove ${f.n}`} icon={<Trash2 />} onClick={() => setFiles((x) => x.filter((y) => y.n !== f.n))} /> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Prompt library
export function AiPromptsScreen() {
  const { open } = useScreenNav();
  const { copied, copy } = O.useClipboard();
  const [cat, setCat] = useState('all');
  const prompts = [
    { t: 'Rewrite for clarity', c: 'Writing', p: 'Rewrite the text below in plain English. Keep it under 120 words.' },
    { t: 'Summarise a ticket', c: 'Support', p: 'Summarise this ticket in 3 bullets: problem, what was tried, next step.' },
    { t: 'SQL from a question', c: 'Data', p: 'Write a Postgres query for: {question}. Tables: orders, customers.' },
    { t: 'Release notes', c: 'Writing', p: 'Turn these merged PR titles into customer-facing release notes.' },
    { t: 'Interview questions', c: 'People', p: 'Write 6 interview questions for a {role}, mixing craft and collaboration.' },
  ].filter((p) => cat === 'all' || p.c === cat);
  return (
    <Screen product={muse} active="prompts" topbar={<O.Text weight="medium">Prompt library</O.Text>}>
      <Page title="Prompt library" actions={<O.SegmentedControl size="sm" value={cat} onChange={setCat} options={['all', 'Writing', 'Support', 'Data', 'People'].map((c) => ({ value: c, label: c === 'all' ? 'All' : c }))} />}>
        <O.Grid min={280} gap={3}>
          {prompts.map((p) => (
            <O.Card key={p.t}>
              <O.VStack gap={3}>
                <O.HStack justify="between"><O.Text weight="medium">{p.t}</O.Text><O.Badge>{p.c}</O.Badge></O.HStack>
                <O.Text size="sm" tone="muted" mono>{p.p}</O.Text>
                <O.HStack gap={2}><O.Button size="sm" variant="primary" onClick={() => open('ai-chat')}>Use</O.Button><O.Button size="sm" iconStart={<Copy />} onClick={() => copy(p.p)}>{copied ? 'Copied' : 'Copy'}</O.Button></O.HStack>
              </O.VStack>
            </O.Card>
          ))}
        </O.Grid>
      </Page>
    </Screen>
  );
}

// ───────── Usage
export function AiUsageScreen() {
  const days = Array.from({ length: 20 }, (_, i) => ({ label: `Nov ${i + 1}`, values: { chat: 300 + ((i * 47) % 260), agents: 120 + ((i * 31) % 140), files: 60 + ((i * 13) % 90), errors: 3 + (i % 6) } }));
  return (
    <Screen product={muse} active="usage" topbar={<O.Text weight="medium">Usage</O.Text>}>
      <Page title="Usage" subtitle="Workspace · November">
        <Cols template="minmax(0, 1fr) 380px" stretch>
          <O.Well title="Tokens per day" subtitle="Thousands · failed calls below the line" fill>
            <O.Card grow>
              <O.StackedBarChart label="Tokens per day" data={days} series={[{ key: 'chat', label: 'Chat', color: O.seriesColors.teal }, { key: 'agents', label: 'Agents', color: O.seriesColors.blue }, { key: 'files', label: 'Files', color: O.seriesColors.violet }]} negative={{ key: 'errors', label: 'Failed', color: O.seriesColors.pink }} />
            </O.Card>
          </O.Well>
          <O.UsageMeter title="Context" total={200_000} action={<O.Button size="sm">Compact</O.Button>} segments={[{ label: 'Chat', value: 92_000, color: O.seriesColors.teal }, { label: 'Files', value: 58_000, color: O.seriesColors.blue }, { label: 'Tools', value: 15_000, color: O.seriesColors.violet }, { label: 'System', value: 5_600, color: O.seriesColors.pink }, { label: 'Memory', value: 5_000, color: O.seriesColors.green }]} />
        </Cols>
        <O.KpiStrip items={[
          { icon: <Database size={14} />, label: 'Tokens', period: 'month', value: '14.8M', delta: 22, viz: <O.QuotaBar value={14.8} max={20} />, note: <><O.KpiStrong>74%</O.KpiStrong> of the plan</> },
          { icon: <Bot size={14} />, label: 'Agent runs', period: 'month', value: '1,286', delta: 31, viz: <O.SparkBars values={days.map((d) => d.values.agents)} />, note: 'Support triage leads' },
          { icon: <Wrench size={14} />, label: 'Tool success', period: 'month', value: '98.6%', delta: 1, viz: <O.WaffleGrid filled={986} total={1000} />, note: <><O.KpiStrong>18</O.KpiStrong> failed calls</> },
          { icon: <Library size={14} />, label: 'Answer time', period: 'median', value: '3.1s', delta: -12, good: 'down', viz: <O.RangeMarker min={0} max={10} value={3.1} previous={3.5} unit="s" />, note: 'Faster on Swift' },
        ]} />
      </Page>
    </Screen>
  );
}

// ───────── Models settings
export function AiModelsScreen() {
  const toast = O.useToast();
  const [def, setDef] = useState('compose');
  return (
    <Screen product={muse} active="models" topbar={<O.Text weight="medium">Models</O.Text>}>
      <Page title="Models" subtitle="Choose the default and what people may switch to." max={880}>
        <O.VStack gap={2}>
          {[['compose', 'Compose', 'Balanced quality and speed. Good default.', '$3 / M tokens'], ['swift', 'Swift', 'Fastest answers for short tasks.', '$0.8 / M tokens'], ['depth', 'Depth', 'Long, careful reasoning for hard problems.', '$15 / M tokens']].map(([id, t, d, p]) => (
            <O.SelectableCard key={id} selected={def === id} onSelect={() => setDef(id)} title={t} description={d} aside={p} icon={<Bot size={18} />} />
          ))}
        </O.VStack>
        <O.Card>
          <O.FormLayout sections={[
            { title: 'Data', description: 'What Muse may keep.', content: <><O.Switch label="Use chats to improve answers in this workspace" defaultChecked /><O.Switch label="Allow web search" defaultChecked /></> },
            { title: 'Limits', description: 'Per person, per day.', content: <O.Field label="Daily token limit"><O.Slider defaultValue={200} min={50} max={1000} step={50} format={(n) => `${n}k`} /></O.Field> },
          ]} />
        </O.Card>
        <O.HStack justify="end"><O.Button variant="primary" onClick={() => toast({ title: 'Model settings saved', tone: 'success' })}>Save</O.Button></O.HStack>
      </Page>
    </Screen>
  );
}

