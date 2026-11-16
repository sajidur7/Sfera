import { useState } from 'react';
import { CheckCircle2, GitBranch, Mail, Send, Zap, IceCreamCone } from 'lucide-react';
import {
  ActivityFeed,
  AuthShell,
  Avatar,
  Button,
  EventCalendar,
  Field,
  FlowCanvas,
  GanttChart,
  HStack,
  KanbanBoard,
  LogViewer,
  OtpInput,
  PasswordInput,
  StatusChip,
  Text,
  TextInput,
  VStack,
  colors,
  fmtDate,
  useToast,
  type CalEvent,
  type FlowNode,
  type LogLine,
} from '../../sfera';

// #region KanbanExample
export function KanbanExample() {
  const [cards, setCards] = useState([
    { id: '1', t: 'Pricing page copy', col: 'todo', who: 'Mira Chen' },
    { id: '2', t: 'SSO for Okta', col: 'doing', who: 'Sam Ito' },
    { id: '3', t: 'Invoice PDF export', col: 'doing', who: 'Theo Park' },
    { id: '4', t: 'Fix toast focus', col: 'done', who: 'Ana Ruiz' },
  ]);
  const cols = [
    { id: 'todo', title: 'To do', tone: 'neutral' as const },
    { id: 'doing', title: 'In progress', tone: 'info' as const },
    { id: 'done', title: 'Done', tone: 'success' as const },
  ].map((c) => ({ ...c, items: cards.filter((x) => x.col === c.id) }));
  return (
    <KanbanBoard
      columns={cols}
      getId={(c) => c.id}
      onMove={(id, to) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: to } : c)))}
      onAdd={(col) => setCards((cs) => [...cs, { id: String(Date.now()), t: 'New task', col, who: 'Mira Chen' }])}
      renderCard={(c) => (
        <VStack gap={2}>
          <Text size="sm" weight="medium">{c.t}</Text>
          <HStack gap={2}>
            <Avatar name={c.who} size="xs" />
            <Text size="xs" tone="muted">{c.who}</Text>
          </HStack>
        </VStack>
      )}
    />
  );
}
// #endregion

// #region ActivityExample
export function ActivityExample() {
  return (
    <ActivityFeed
      items={[
        { id: 'a', who: 'Ana Ruiz', action: 'won Fjord Freight', detail: '$152,000 ARR · 3-year term', when: '3h' },
        { id: 'b', who: 'Theo Park', action: 'sent an email', icon: <Mail size={14} />, when: '5h' },
        { id: 'c', who: 'System', action: 'closed the SSO checklist', icon: <CheckCircle2 size={14} />, when: 'Yesterday' },
      ]}
    />
  );
}
// #endregion

// #region GanttExample
export function GanttExample() {
  return (
    <GanttChart
      columns={['Nov 3', 'Nov 10', 'Nov 17', 'Nov 24', 'Dec 1', 'Dec 8', 'Dec 15', 'Dec 22']}
      today={2.4}
      tasks={[
        { id: 'a', label: 'Research', start: 0, end: 2, tone: 'success', owner: 'Mira', progress: 100 },
        { id: 'b', label: 'Design system', start: 1, end: 4, owner: 'Sam', progress: 60 },
        { id: 'c', label: 'Billing API', start: 2, end: 6, tone: 'warning', owner: 'Kofi', progress: 30 },
        { id: 'd', label: 'Beta launch', start: 6, end: 7, tone: 'danger', owner: 'Ana' },
      ]}
    />
  );
}
// #endregion

// #region EventCalendarExample
export function EventCalendarExample() {
  const toast = useToast();
  const [events, setEvents] = useState<CalEvent[]>([
    { id: '1', date: new Date(2026, 10, 3), title: 'Newsletter #42', tone: 'accent', time: '09:00' },
    { id: '2', date: new Date(2026, 10, 11), title: 'Webinar: StyleX', tone: 'success', time: '17:00' },
    { id: '3', date: new Date(2026, 10, 18), title: 'Black Friday prep', tone: 'warning' },
    { id: '4', date: new Date(2026, 10, 27), title: 'Black Friday', tone: 'danger' },
    { id: '5', date: new Date(2026, 10, 27), title: 'Ads go live', tone: 'accent', time: '06:00' },
    { id: '6', date: new Date(2026, 10, 27), title: 'Inventory check', tone: 'neutral' },
  ]);
  return (
    <EventCalendar
      events={events}
      onDayClick={(d) => (setEvents((e) => [...e, { id: String(Date.now()), date: d, title: 'New post', tone: 'accent' }]), toast({ title: `Added a post on ${fmtDate(d)}` }))}
      onEventClick={(e) => toast({ title: e.title, description: fmtDate(e.date) })}
    />
  );
}
// #endregion

// #region FlowExample
export function FlowExample() {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: 't', x: 60, y: 40, title: 'New order created', subtitle: 'When an order is placed', icon: <IceCreamCone size={15} />, kind: 'trigger', tag: 'Trigger' },
    { id: 'c', x: 60, y: 170, title: 'Glaze is Ash Grey?', subtitle: 'If / Else', icon: <GitBranch size={15} />, kind: 'condition', tag: 'If / Else' },
    { id: 'y', x: 0, y: 310, title: 'Notify studio', subtitle: 'Slack #kiln', icon: <Send size={15} /> },
    { id: 'n', x: 250, y: 310, title: 'Ship as usual', subtitle: 'No change', icon: <Zap size={15} />, kind: 'end' },
  ]);
  const [sel, setSel] = useState<string | null>('c');
  return <FlowCanvas nodes={nodes} onNodesChange={setNodes} selected={sel} onSelect={setSel} edges={[{ from: 't', to: 'c' }, { from: 'c', to: 'y', label: 'yes' }, { from: 'c', to: 'n', label: 'no' }]} height={420} />;
}
// #endregion

// #region LogExample
export function LogExample() {
  const base: LogLine[] = [
    { t: '12:04:01.12', level: 'info', msg: 'Build started · commit 8f3c2a1 “Fix toast focus”' },
    { t: '12:04:03.40', level: 'debug', msg: 'Restored cache (412 MB) in 1.8s' },
    { t: '12:04:19.77', level: 'info', msg: 'vite v8.3.8 building for production…' },
    { t: '12:04:24.02', level: 'warn', msg: 'Chunk index.js is 812 kB after minification' },
    { t: '12:04:24.90', level: 'info', msg: '✓ built in 5.1s' },
  ];
  const [lines, setLines] = useState(base);
  return (
    <VStack gap={2}>
      <LogViewer lines={lines} maxHeight={220} />
      <HStack gap={2}>
        <Button size="sm" onClick={() => setLines((l) => [...l, { t: new Date().toTimeString().slice(0, 8) + '.00', level: 'error', msg: 'Health check failed: GET /api/health → 503' }])}>Append error</Button>
        <Button size="sm" variant="ghost" onClick={() => setLines(base)}>Reset</Button>
      </HStack>
    </VStack>
  );
}
// #endregion

// #region AuthInputsExample
export function AuthInputsExample() {
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  return (
    <VStack gap={5}>
      <Field label="New password">
        <PasswordInput value={pw} onChange={setPw} showStrength autoComplete="new-password" />
      </Field>
      <VStack gap={2} align="center">
        <Text size="sm" tone="muted">Enter the 6-digit code (try pasting 123456)</Text>
        <OtpInput onComplete={setCode} />
        <StatusChip tone={code ? 'success' : 'neutral'}>{code ? `Code ${code} entered` : 'Waiting for code'}</StatusChip>
      </VStack>
    </VStack>
  );
}
// #endregion

// #region AuthShellExample
export function AuthShellExample() {
  return (
    <div style={{ width: '100%', height: 460, overflow: 'hidden', borderRadius: 16, border: `1px solid ${colors.border}` }}>
      <div inert style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '166.6%' }}>
        <AuthShell
          brand={<Text weight="medium">Northwind</Text>}
          aside={<Text size="lg" tone="muted"><span style={{ display: 'block', padding: 32 }}>Showcase panel</span></Text>}
        >
          <Text size="lg" weight="medium">Sign in</Text>
          <Field label="Email">
            <TextInput type="email" autoComplete="email" />
          </Field>
          <Button variant="primary" fullWidth>Continue</Button>
        </AuthShell>
      </div>
    </div>
  );
}
// #endregion
