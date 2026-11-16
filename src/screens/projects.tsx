import { useState } from 'react';
import { AtSign, Bell, Bug, CircleCheck, CircleDot, FileText, GitPullRequest, MessageSquare, Plus, Rocket, Target } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { stack } from './products';
import { Cols, Page, names } from './ui';


type Issue = { id: string; title: string; status: string; priority: string; assignee: string; points: number; label: string; due: string };
const statuses: O.StatusOption[] = [
  { value: 'backlog', label: 'Backlog', tone: 'neutral' },
  { value: 'todo', label: 'To do', tone: 'info' },
  { value: 'doing', label: 'In progress', tone: 'warning' },
  { value: 'review', label: 'In review', tone: 'accent' },
  { value: 'done', label: 'Done', tone: 'success' },
];
const titles = ['Billing page redesign', 'SSO with Okta', 'Invoice PDF export', 'Fix toast focus order', 'Rate limit dashboard', 'Onboarding checklist', 'Dark mode charts', 'Webhook retries', 'Search indexing', 'Mobile nav polish', 'API keys rotation', 'Audit log export'];
export const issues: Issue[] = titles.map((t, i) => ({
  id: `STK-${210 + i}`,
  title: t,
  status: statuses[i % 5].value,
  priority: ['urgent', 'high', 'normal', 'low'][i % 4],
  assignee: names[i % 6],
  points: [1, 2, 3, 5, 8][i % 5],
  label: ['Feature', 'Bug', 'Chore'][i % 3],
  due: ['Nov 18', 'Nov 20', 'Nov 22', 'Nov 26', 'Dec 2'][i % 5],
}));
const prioTone: Record<string, O.Tone> = { urgent: 'danger', high: 'warning', normal: 'info', low: 'neutral' };

// ───────── Home: my work
export function PmHomeScreen() {
  const { open } = useScreenNav();
  const mine = issues.filter((i) => i.assignee === 'Sam Ito' || i.assignee === names[0]).slice(0, 5);
  return (
    <Screen product={stack} active="home" topbar={<O.Text weight="medium">Home</O.Text>}>
      <Page title="My work" subtitle="Launch v2 · sprint 14 ends Friday" max={1180}>
        <O.KpiStrip items={[
          { icon: <Target size={14} />, label: 'Sprint', period: '14', value: '64%', delta: 8, viz: <O.QuotaBar value={32} max={50} />, note: <><O.KpiStrong>32</O.KpiStrong> of 50 points done</> },
          { icon: <CircleCheck size={14} />, label: 'Closed', period: '14 days', value: '41', delta: 12, viz: <O.SparkBars values={[2, 4, 3, 1, 5, 6, 2, 3, 7, 4, 2, 5, 3, 4]} />, note: <>Best day <O.KpiStrong>7</O.KpiStrong> · Nov 11</> },
          { icon: <Bug size={14} />, label: 'Bugs', period: 'open', value: '9', delta: -18, good: 'down', viz: <O.WaffleGrid filled={9} total={60} />, note: <><O.KpiStrong>2</O.KpiStrong> urgent</> },
          { icon: <Rocket size={14} />, label: 'Cycle time', period: 'median', value: '3.4d', delta: -9, good: 'down', viz: <O.RangeMarker min={0} max={10} value={3.4} previous={4.1} />, note: 'Faster than last sprint' },
        ]} />
        <Cols template="minmax(0, 1.4fr) minmax(0, 1fr)">
          <O.Well title="Assigned to me" actions={<O.Button size="sm" variant="ghost" onClick={() => open('pm-list')}>All issues</O.Button>}>
            <O.Card padding="none">
              <O.List boxed={false}>
                {mine.map((i, k) => (
                  <O.ListItem key={i.id} last={k === mine.length - 1} leading={<CircleDot size={16} />} title={i.title} subtitle={`${i.id} · due ${i.due}`} trailing={<O.StatusChip size="sm" tone={statuses.find((s) => s.value === i.status)!.tone}>{statuses.find((s) => s.value === i.status)!.label}</O.StatusChip>} onClick={() => open('pm-issue', { id: i.id })} />
                ))}
              </O.List>
            </O.Card>
          </O.Well>
          <O.Well title="Burndown" subtitle="Points remaining">
            <O.Card>
              <O.LineChart label="Burndown" labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} series={[{ name: 'Remaining', values: [50, 47, 44, 40, 38, 33, 28, 24, 18, 18] }, { name: 'Ideal', values: [50, 45, 40, 35, 30, 25, 20, 15, 10, 5], color: O.colors.borderStrong, dashed: true }]} height={180} />
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Board
export function PmBoardScreen() {
  const { open } = useScreenNav();
  const [items, setItems] = useState(issues);
  return (
    <Screen product={stack} active="board" topbar={<O.Breadcrumbs items={[{ id: 'p', label: 'Launch v2' }, { id: 'b', label: 'Board' }]} />}>
      <Page title="Board" subtitle="Drag cards between columns, or use a card’s menu." actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => setItems((x) => [...x, { ...issues[0], id: `STK-${300 + x.length}`, title: 'New issue', status: 'backlog' }])}>New issue</O.Button>} max={1600}>
        <O.KanbanBoard
          columns={statuses.map((s) => ({ id: s.value, title: s.label, tone: s.tone, items: items.filter((i) => i.status === s.value) }))}
          getId={(i) => i.id}
          onMove={(id, to) => setItems((xs) => xs.map((i) => (i.id === id ? { ...i, status: to } : i)))}
          renderCard={(i) => (
            <button type="button" onClick={() => open('pm-issue', { id: i.id })} style={{ all: 'unset', display: 'flex', flexDirection: 'column', gap: 8, width: 'calc(100% - 28px)', cursor: 'pointer' }}>
              <O.Text size="xs" tone="subtle" mono>{i.id}</O.Text>
              <O.Text size="sm" weight="medium">{i.title}</O.Text>
              <O.HStack gap={1} wrap><O.Badge tone={prioTone[i.priority]}>{i.priority}</O.Badge><O.Badge variant="outline">{i.label}</O.Badge><O.Badge mono variant="outline">{i.points} pt</O.Badge></O.HStack>
              <O.HStack justify="between"><O.Avatar name={i.assignee} size="xs" /><O.Text size="xs" tone="subtle">{i.due}</O.Text></O.HStack>
            </button>
          )}
        />
      </Page>
    </Screen>
  );
}

// ───────── List view with expandable rows
export function PmListScreen() {
  const { open } = useScreenNav();
  const [rows, setRows] = useState(issues);
  const [group, setGroup] = useState('status');
  return (
    <Screen product={stack} active="list" topbar={<O.Breadcrumbs items={[{ id: 'p', label: 'Launch v2' }, { id: 'l', label: 'List' }]} />}>
      <Page title="Issues" actions={<O.SegmentedControl size="sm" value={group} onChange={setGroup} options={[{ value: 'status', label: 'By status' }, { value: 'none', label: 'Flat' }]} />}>
        {(group === 'status' ? statuses : [{ value: 'all', label: 'All issues', tone: 'neutral' as O.Tone }]).map((s) => {
          const list = rows.filter((r) => s.value === 'all' || r.status === s.value);
          if (!list.length) return null;
          return (
            <O.Section key={s.value} title={<O.HStack gap={2}><O.StatusDot tone={s.tone} />{s.label}<O.Badge>{list.length}</O.Badge></O.HStack>}>
              <O.Card padding="none">
                <O.Table label={s.label} compact rows={list} rowKey={(r) => r.id} renderExpanded={(r) => <O.Text size="sm" tone="muted">{r.label} · {r.points} points · assigned to {r.assignee} · due {r.due}</O.Text>} onRowClick={(r) => open('pm-issue', { id: r.id })} columns={[
                  { key: 'id', header: 'ID', render: (r) => <O.Text as="span" size="sm" mono tone="muted">{r.id}</O.Text> },
                  { key: 't', header: 'Title', render: (r) => r.title },
                  { key: 's', header: 'Status', hideBelow: 'sm', render: (r) => <O.StatusSelect options={statuses} value={r.status} onChange={(v) => setRows((x) => x.map((i) => (i.id === r.id ? { ...i, status: v } : i)))} /> },
                  { key: 'a', header: 'Assignee', hideBelow: 'md', render: (r) => <O.Avatar name={r.assignee} size="xs" /> },
                ]} />
              </O.Card>
            </O.Section>
          );
        })}
      </Page>
    </Screen>
  );
}

// ───────── Timeline (gantt)
export function PmTimelineScreen() {
  return (
    <Screen product={stack} active="timeline" topbar={<O.Breadcrumbs items={[{ id: 'p', label: 'Launch v2' }, { id: 't', label: 'Timeline' }]} />}>
      <Page title="Timeline" subtitle="Weeks of November – December">
        <O.GanttChart
          columns={['Nov 3', 'Nov 10', 'Nov 17', 'Nov 24', 'Dec 1', 'Dec 8', 'Dec 15', 'Dec 22', 'Dec 29']}
          today={2.3}
          tasks={[
            { id: 'a', label: 'Discovery', start: 0, end: 1.5, tone: 'success', owner: 'Mira', progress: 100 },
            { id: 'b', label: 'Billing redesign', start: 1, end: 4, owner: 'Sam', progress: 55 },
            { id: 'c', label: 'SSO with Okta', start: 1.5, end: 3.5, tone: 'warning', owner: 'Kofi', progress: 40 },
            { id: 'd', label: 'Invoice export', start: 2, end: 5, owner: 'Theo', progress: 20 },
            { id: 'e', label: 'Docs and help', start: 4, end: 6.5, tone: 'neutral', owner: 'Lea' },
            { id: 'f', label: 'Beta', start: 6, end: 7, tone: 'danger', owner: 'Ana' },
            { id: 'g', label: 'GA launch', start: 8, end: 9, tone: 'success', owner: 'All' },
          ]}
        />
        <O.HStack gap={4} wrap>
          {[['On track', 'accent'], ['At risk', 'warning'], ['Blocked', 'danger'], ['Done', 'success']].map(([l, t]) => (
            <O.HStack key={l} gap={2}><O.StatusDot tone={t as O.Tone} /><O.Text size="sm" tone="muted">{l}</O.Text></O.HStack>
          ))}
        </O.HStack>
      </Page>
    </Screen>
  );
}

// ───────── Issue detail
export function PmIssueScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const it = issues.find((i) => i.id === params.id) ?? issues[0];
  const [status, setStatus] = useState(it.status);
  const [subs, setSubs] = useState([{ t: 'Design review', d: true }, { t: 'API contract', d: true }, { t: 'Front-end', d: false }, { t: 'QA pass', d: false }]);
  return (
    <Screen product={stack} active="board" topbar={<O.Breadcrumbs items={[{ id: 'b', label: 'Board' }, { id: it.id, label: it.id }]} onNavigate={() => open('pm-board')} />}>
      <Page max={1180}>
        <Cols template="minmax(0, 1fr) 280px">
          <O.VStack gap={4}>
            <O.Heading level={1} size="h2">{it.title}</O.Heading>
            <O.RichTextEditor label="Description" defaultValue="<p>Customers on the Team plan need to download invoices as PDF from the billing page.</p><ul><li>Match the brand template</li><li>Include VAT number</li></ul>" />
            <O.Well title="Sub-issues" subtitle={`${subs.filter((s) => s.d).length} of ${subs.length}`}>
              <O.Card padding="sm">
                <O.VStack gap={3}>
                  {subs.map((s, i) => <O.Checkbox key={s.t} label={s.t} checked={s.d} onChange={(v) => setSubs((x) => x.map((y, k) => (k === i ? { ...y, d: v } : y)))} />)}
                </O.VStack>
              </O.Card>
            </O.Well>
            <O.Section title="Activity">
              <O.ActivityFeed items={[{ id: '1', who: 'Sam Ito', action: 'opened a pull request', detail: '#412 Invoice PDF renderer', icon: <GitPullRequest size={14} />, when: '2h' }, { id: '2', who: 'Mira Chen', action: 'commented', detail: 'Can we keep the VAT line optional for US customers?', icon: <MessageSquare size={14} />, when: '1h' }]} />
            </O.Section>
          </O.VStack>
          <O.Well title="Details">
            <O.Card padding="sm">
              <O.MetadataList items={[
                { label: 'Status', value: <O.StatusSelect options={statuses} value={status} onChange={(v) => (setStatus(v), toast({ title: `Moved to ${statuses.find((s) => s.value === v)!.label}` }))} /> },
                { label: 'Priority', value: <O.Badge tone={prioTone[it.priority]}>{it.priority}</O.Badge> },
                { label: 'Assignee', value: <O.HStack gap={2}><O.Avatar name={it.assignee} size="xs" />{it.assignee}</O.HStack> },
                { label: 'Estimate', value: `${it.points} points` },
                { label: 'Due', value: it.due },
                { label: 'Labels', value: <O.MultiSelect defaultValue={[it.label.toLowerCase()]} options={['feature', 'bug', 'chore', 'billing'].map((l) => ({ value: l, label: l }))} /> },
              ]} />
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Sprint planning: backlog ↔ sprint with capacity meter
export function PmSprintScreen() {
  const toast = O.useToast();
  const [inSprint, setIn] = useState<string[]>(issues.slice(0, 6).map((i) => i.id));
  const cap = 34;
  const used = issues.filter((i) => inSprint.includes(i.id)).reduce((a, i) => a + i.points, 0);
  const col = (ids: Issue[], add: boolean) => (
    <O.List>
      {ids.map((i, k) => (
        <O.ListItem key={i.id} last={k === ids.length - 1} leading={<O.Avatar name={i.assignee} size="sm" />} title={i.title} subtitle={`${i.id} · ${i.points} pt`} trailing={<O.Button size="xs" variant="soft" onClick={() => setIn((s) => (add ? [...s, i.id] : s.filter((x) => x !== i.id)))}>{add ? 'Add' : 'Remove'}</O.Button>} />
      ))}
    </O.List>
  );
  return (
    <Screen product={stack} active="sprint" topbar={<O.Text weight="medium">Sprint 15</O.Text>}>
      <Page title="Plan sprint 15" subtitle="24 Nov – 5 Dec · 6 people" actions={<O.Button variant="primary" iconStart={<Rocket />} onClick={() => toast({ title: 'Sprint 15 started', tone: 'success' })}>Start sprint</O.Button>}>
        <O.UsageMeter title="Capacity" total={cap} format={(n) => `${Math.round(n)} pt`} segments={['Feature', 'Bug', 'Chore'].map((l, i) => ({ label: l, value: issues.filter((x) => inSprint.includes(x.id) && x.label === l).reduce((a, x) => a + x.points, 0), color: [O.seriesColors.blue, O.seriesColors.pink, O.seriesColors.slate][i] }))} />
        {used > cap && <O.Banner tone="warning" title={`Over capacity by ${used - cap} points`}>Move something back to the backlog.</O.Banner>}
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)">
          <O.Section title="Sprint" subtitle={`${inSprint.length} issues · ${used} pt`}>{col(issues.filter((i) => inSprint.includes(i.id)), false)}</O.Section>
          <O.Section title="Backlog" subtitle={`${issues.length - inSprint.length} issues`}>{col(issues.filter((i) => !inSprint.includes(i.id)), true)}</O.Section>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Roadmap (quarters as columns)
export function PmRoadmapScreen() {
  const quarters = [
    { q: 'Q4 2026', items: [['Launch v2', 'success', 'Shipping'], ['SSO everywhere', 'warning', 'At risk'], ['Invoice PDF export', 'success', 'Shipping']] },
    { q: 'Q1 2027', items: [['Mobile app', 'accent', 'Planned'], ['Usage-based billing', 'accent', 'Planned'], ['Audit log', 'neutral', 'Idea']] },
    { q: 'Q2 2027', items: [['AI summaries', 'neutral', 'Idea'], ['Marketplace', 'neutral', 'Idea'], ['Public API v2', 'neutral', 'Idea']] },
  ];
  return (
    <Screen product={stack} active="roadmap" topbar={<O.Text weight="medium">Roadmap</O.Text>}>
      <Page title="Roadmap" subtitle="What we are building next, by quarter.">
        <O.Grid columns={3} gap={3}>
          {quarters.map((q) => (
            <O.Well key={q.q} title={q.q} subtitle={`${q.items.length} initiatives`} fill>
              {q.items.map(([t, tone, l]) => (
                <O.Card key={t} padding="sm">
                  <O.VStack gap={2}>
                    <O.Text size="sm" weight="medium">{t}</O.Text>
                    <O.StatusChip size="sm" variant="dot" tone={tone as O.Tone}>{l}</O.StatusChip>
                  </O.VStack>
                </O.Card>
              ))}
            </O.Well>
          ))}
        </O.Grid>
      </Page>
    </Screen>
  );
}

// ───────── Docs: tree + page
export function PmDocsScreen() {
  const [sel, setSel] = useState('spec');
  const pages: Record<string, string> = {
    spec: '<h2>Invoice export · spec</h2><p>Team admins can download any invoice as PDF.</p><ul><li>Brand template</li><li>VAT number when present</li></ul>',
    notes: '<h2>Kick-off notes</h2><p>Owners: <b>Sam</b> (eng), <b>Mira</b> (design). Target: beta on Dec 1.</p>',
    retro: '<h2>Sprint 13 retro</h2><p>Went well: fewer review cycles. To improve: earlier QA.</p>',
  };
  return (
    <Screen product={stack} active="docs" topbar={<O.Text weight="medium">Docs</O.Text>}>
      <Page max={1180}>
        <O.Resizable
          defaultSize={26}
          min={18}
          max={45}
          start={
            <div style={{ padding: 8 }}>
              <O.TreeList label="Docs" selected={sel} onSelect={(id) => pages[id] && setSel(id)} defaultExpanded={['launch', 'rituals']} nodes={[{ id: 'launch', label: 'Launch v2', icon: <Rocket size={14} />, children: [{ id: 'spec', label: 'Invoice export spec', icon: <FileText size={14} /> }, { id: 'notes', label: 'Kick-off notes', icon: <FileText size={14} /> }] }, { id: 'rituals', label: 'Rituals', icon: <Target size={14} />, children: [{ id: 'retro', label: 'Sprint 13 retro', icon: <FileText size={14} /> }] }]} />
            </div>
          }
          end={
            <div style={{ padding: 16 }}>
              <O.RichTextEditor key={sel} label="Document" defaultValue={pages[sel]} />
            </div>
          }
        />
      </Page>
    </Screen>
  );
}

// ───────── Workload: people × weeks heat
export function PmWorkloadScreen() {
  const ppl = names.slice(0, 6);
  return (
    <Screen product={stack} active="workload" topbar={<O.Text weight="medium">Workload</O.Text>}>
      <Page title="Workload" subtitle="Points assigned per person, next four weeks. Capacity is 10 a week.">
        <O.Card padding="none">
          <O.Table label="Workload" rows={ppl} rowKey={(n) => n} columns={[
            { key: 'n', header: 'Person', render: (n) => <O.HStack gap={2}><O.Avatar name={n} size="sm" />{n}</O.HStack> },
            ...['W48', 'W49', 'W50', 'W51'].map((w, k) => ({
              key: w,
              header: w,
              render: (n: string) => {
                const v = ((n.length * (k + 3)) % 13) + 2;
                return <div style={{ width: 110 }}><O.ProgressBar value={v} max={10} label={`${v} pt`} showValue={false} tone={v > 10 ? 'danger' : v > 8 ? 'warning' : 'accent'} /></div>;
              },
            })),
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Inbox: notifications
export function PmInboxScreen() {
  const { open } = useScreenNav();
  const [items, setItems] = useState([
    { id: 'n1', icon: <AtSign size={15} />, who: 'Mira Chen', text: 'mentioned you in STK-212', at: '5m', unread: true, issue: 'STK-212' },
    { id: 'n2', icon: <GitPullRequest size={15} />, who: 'Kofi Mensah', text: 'requested your review on #412', at: '1h', unread: true, issue: 'STK-210' },
    { id: 'n3', icon: <CircleCheck size={15} />, who: 'Theo Park', text: 'closed STK-215 Fix toast focus order', at: '3h', unread: false, issue: 'STK-215' },
    { id: 'n4', icon: <Bell size={15} />, who: 'Stack', text: 'STK-213 is due tomorrow', at: 'Yesterday', unread: false, issue: 'STK-213' },
  ]);
  const [tab, setTab] = useState('all');
  const list = items.filter((i) => tab === 'all' || i.unread);
  return (
    <Screen product={stack} active="inbox" topbar={<O.Text weight="medium">Inbox</O.Text>}>
      <Page title="Inbox" actions={<O.Button size="sm" onClick={() => setItems((x) => x.map((i) => ({ ...i, unread: false })))}>Mark all read</O.Button>} max={820}>
        <O.Tabs label="Inbox" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread', count: items.filter((i) => i.unread).length }]} />
        {list.length ? (
          <O.List>
            {list.map((n, k) => (
              <O.ListItem key={n.id} last={k === list.length - 1} leading={<O.Avatar name={n.who} size="md" />} title={<>{n.who} <span style={{ fontWeight: 400 }}>{n.text}</span></>} subtitle={n.at} trailing={n.unread ? <O.StatusDot tone="accent" label="Unread" /> : null} onClick={() => (setItems((x) => x.map((i) => (i.id === n.id ? { ...i, unread: false } : i))), open('pm-issue', { id: n.issue }))} />
            ))}
          </O.List>
        ) : (
          <O.EmptyState icon={<Bell size={18} />} title="You are all caught up" description="New mentions and reviews show up here." />
        )}
      </Page>
    </Screen>
  );
}
