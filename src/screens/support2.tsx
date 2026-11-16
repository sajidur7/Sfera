import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CircleCheck, Clock, Eye, FileText, Mail, MessageSquare, Plus, Search, Star, ThumbsDown, ThumbsUp, Timer as TimerIcon, Trash2, Zap } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { harbor } from './products';
import { Cols, Page, Row, names, rand } from './ui';

const priority: O.StatusOption[] = [
  { value: 'urgent', label: 'Urgent', tone: 'danger' },
  { value: 'high', label: 'High', tone: 'warning' },
  { value: 'normal', label: 'Normal', tone: 'info' },
  { value: 'low', label: 'Low', tone: 'neutral' },
];
const ticketStatus: O.StatusOption[] = [
  { value: 'open', label: 'Open', tone: 'info' },
  { value: 'pending', label: 'Pending', tone: 'warning' },
  { value: 'solved', label: 'Solved', tone: 'success' },
];
type Ticket = { id: string; subject: string; requester: string; priority: string; status: string; assignee: string; updated: string; sla: number; channel: string };
const subjects = ['Refund for duplicate charge', 'SSO setup with Okta', 'Export stuck at 80%', 'Add a teammate', 'API rate limits', 'Invoice address change', 'Cannot reset password', 'Webhook retries', 'Delete my account', 'Custom domain SSL'];
export const tickets: Ticket[] = subjects.map((s, i) => ({
  id: `T-${4820 + i}`,
  subject: s,
  requester: names[(i + 4) % names.length],
  priority: priority[i % 4].value,
  status: ticketStatus[i % 3].value,
  assignee: names[i % 3],
  updated: ['4m', '12m', '1h', '2h', '5h', 'Yesterday', 'Yesterday', 'Mon', 'Mon', 'Sun'][i],
  sla: [92, 64, 30, 12, 80, 55, 8, 70, 40, 100][i],
  channel: ['Email', 'Chat', 'Email', 'Chat', 'API', 'Email', 'Phone', 'API', 'Email', 'Chat'][i],
}));

// ───────── Tickets: dense table + saved views + bulk
export function SupportTicketsScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [rows, setRows] = useState(tickets);
  const [view, setView] = useState('all');
  const [filters, setFilters] = useState<O.PowerFilter[]>([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const shown = rows.filter((t) => (view === 'all' || (view === 'mine' && t.assignee === 'Theo Park') || (view === 'breach' && t.sla < 35)) && filters.every((f) => (f.op === 'is') === ((t as Record<string, string | number>)[f.field] === f.value.toLowerCase())) && t.subject.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen product={harbor} active="tickets" topbar={<O.Text weight="medium">Tickets</O.Text>}>
      <Page title="Tickets" subtitle={`${shown.length} shown · ${rows.filter((r) => r.status === 'open').length} open`} actions={<O.Button variant="primary" iconStart={<Plus />}>New ticket</O.Button>}>
        <O.Tabs label="Views" value={view} onChange={setView} tabs={[{ id: 'all', label: 'All tickets', count: rows.length }, { id: 'mine', label: 'Assigned to me', count: rows.filter((t) => t.assignee === 'Theo Park').length }, { id: 'breach', label: 'Near SLA breach', count: rows.filter((t) => t.sla < 35).length }]} />
        <O.PowerSearch
          query={q}
          onQueryChange={setQ}
          filters={filters}
          onFiltersChange={setFilters}
          fields={[
            { id: 'priority', label: 'Priority', options: ['Urgent', 'High', 'Normal', 'Low'] },
            { id: 'status', label: 'Status', options: ['Open', 'Pending', 'Solved'] },
          ]}
        />
        {sel.length > 0 && (
          <O.Banner tone="neutral" title={`${sel.length} selected`} action={<><O.Button size="sm" onClick={() => (setRows((r) => r.map((t) => (sel.includes(t.id) ? { ...t, status: 'solved' } : t))), setSel([]), toast({ title: 'Marked solved', tone: 'success' }))}>Mark solved</O.Button><O.Button size="sm" variant="ghost" onClick={() => setSel([])}>Clear</O.Button></>} />
        )}
        <O.Card padding="none">
          <O.Table
            label="Tickets"
            selectable
            selected={sel}
            onSelectedChange={setSel}
            rows={shown}
            rowKey={(t) => t.id}
            onRowClick={(t) => open('support-ticket', { id: t.id })}
            columns={[
              { key: 'id', header: 'ID', render: (t) => <O.Text as="span" size="sm" mono tone="muted">{t.id}</O.Text> },
              { key: 's', header: 'Subject', sortValue: (t) => t.subject, render: (t) => <O.VStack gap={0}><O.Text as="span" size="sm" weight="medium">{t.subject}</O.Text><O.Text as="span" size="xs" tone="muted">{t.requester} · {t.channel}</O.Text></O.VStack> },
              { key: 'p', header: 'Priority', render: (t) => <O.StatusSelect label="Priority" options={priority} value={t.priority} onChange={(v) => setRows((r) => r.map((x) => (x.id === t.id ? { ...x, priority: v } : x)))} /> },
              { key: 'st', header: 'Status', hideBelow: 'sm', render: (t) => <O.StatusChip size="sm" tone={ticketStatus.find((s) => s.value === t.status)!.tone}>{ticketStatus.find((s) => s.value === t.status)!.label}</O.StatusChip> },
              { key: 'sla', header: 'SLA', hideBelow: 'md', sortValue: (t) => t.sla, render: (t) => <div style={{ width: 90 }}><O.ProgressBar value={t.sla} showValue={false} tone={t.sla < 20 ? 'danger' : t.sla < 50 ? 'warning' : 'success'} /></div> },
              { key: 'a', header: 'Assignee', hideBelow: 'md', render: (t) => <O.Avatar name={t.assignee} size="sm" /> },
              { key: 'u', header: 'Updated', align: 'right', render: (t) => <O.Text as="span" size="sm" tone="muted">{t.updated}</O.Text> },
            ]}
          />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Ticket detail: conversation + properties rail
export function SupportTicketScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const t = tickets.find((x) => x.id === params.id) ?? tickets[0];
  const [status, setStatus] = useState(t.status);
  const [prio, setPrio] = useState(t.priority);
  const [mode, setMode] = useState('reply');
  const [thread, setThread] = useState([
    { who: t.requester, text: `Hi team — ${t.subject.toLowerCase()}. Can you help?`, at: '09:12', note: false },
    { who: 'Theo Park', text: 'Looking into this now. Could you share the workspace URL?', at: '09:20', note: false },
    { who: t.requester, text: 'Sure, it is acme.harbor.help', at: '09:31', note: false },
  ]);
  return (
    <Screen product={harbor} active="tickets" topbar={<O.HStack gap={2}><O.IconButton size="sm" label="Back to tickets" icon={<ArrowLeft />} onClick={() => open('support-tickets')} /><O.Text weight="medium">{t.id}</O.Text></O.HStack>}>
      <Page max={1240}>
        <Cols template="minmax(0, 1fr) 300px">
          <O.VStack gap={4}>
            <O.VStack gap={1}>
              <O.Heading level={1} size="h2">{t.subject}</O.Heading>
              <O.Text size="sm" tone="muted">Opened by {t.requester} via {t.channel} · SLA {t.sla}% remaining</O.Text>
            </O.VStack>
            <O.ActivityFeed items={thread.map((m, i) => ({ id: String(i), who: m.who, action: m.note ? 'added an internal note' : 'wrote', detail: m.text, when: m.at, icon: m.note ? <FileText size={14} /> : undefined }))} />
            <O.Well>
              <O.Card padding="sm">
                <O.VStack gap={2}>
                  <O.SegmentedControl size="sm" value={mode} onChange={setMode} options={[{ value: 'reply', label: 'Reply' }, { value: 'note', label: 'Internal note' }]} />
                  <O.RichTextEditor key={mode} label={mode === 'reply' ? 'Reply' : 'Internal note'} placeholder={mode === 'reply' ? `Reply to ${t.requester.split(' ')[0]}…` : 'Only your team sees this'} onChange={() => {}} />
                  <O.HStack justify="between">
                    <O.DropdownMenu label="Insert macro" trigger={<O.Button size="sm" variant="ghost" iconStart={<Zap />}>Macros</O.Button>} items={['Ask for workspace URL', 'Refund issued', 'Escalated to engineering'].map((m) => ({ label: m, onSelect: () => toast({ title: `Inserted “${m}”` }) }))} />
                    <O.Button size="sm" variant="primary" onClick={() => (setThread((x) => [...x, { who: 'Theo Park', text: mode === 'reply' ? 'Thanks! I have applied the fix — let me know if it works.' : 'Checked logs, looks like a cache issue.', at: 'now', note: mode === 'note' }]), toast({ title: mode === 'reply' ? 'Reply sent' : 'Note added', tone: 'success' }))}>
                      {mode === 'reply' ? 'Send reply' : 'Add note'}
                    </O.Button>
                  </O.HStack>
                </O.VStack>
              </O.Card>
            </O.Well>
          </O.VStack>
          <O.Well title="Properties">
            <O.Card padding="sm">
              <O.MetadataList
                items={[
                  { label: 'Status', value: <O.StatusSelect label="Status" options={ticketStatus} value={status} onChange={(v) => (setStatus(v), toast({ title: `Status: ${v}` }))} /> },
                  { label: 'Priority', value: <O.StatusSelect label="Priority" options={priority} value={prio} onChange={setPrio} /> },
                  { label: 'Assignee', value: <O.HStack gap={2}><O.Avatar name={t.assignee} size="xs" />{t.assignee}</O.HStack> },
                  { label: 'Channel', value: t.channel },
                ]}
              />
            </O.Card>
            <O.Card padding="sm">
              <O.VStack gap={2}>
                <O.Text size="sm" weight="medium">SLA</O.Text>
                <O.ProgressBar label="First response" value={t.sla} tone={t.sla < 35 ? 'danger' : 'success'} />
                <O.HStack gap={2}><Clock size={14} /><O.Text size="xs" tone="muted">Due in 2h 14m</O.Text></O.HStack>
              </O.VStack>
            </O.Card>
            <O.Card padding="sm">
              <O.HStack gap={3}>
                <O.Avatar name={t.requester} />
                <O.VStack gap={0}>
                  <O.Text size="sm" weight="medium">{t.requester}</O.Text>
                  <O.Text size="xs" tone="muted">4 tickets · Team plan</O.Text>
                </O.VStack>
              </O.HStack>
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Contacts: split list + profile
export function SupportContactsScreen() {
  const [sel, setSel] = useState(names[4]);
  const [q, setQ] = useState('');
  const list = names.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  const r = rand(sel.length);
  return (
    <Screen product={harbor} active="contacts" topbar={<O.Text weight="medium">Contacts</O.Text>}>
      <Page max={1180}>
        <Cols template="320px minmax(0, 1fr)">
          <O.VStack gap={2}>
            <O.SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search contacts" />
            <O.ScrollableArea maxHeight={560} label="Contacts">
              <O.List>
                {list.map((n, i) => (
                  <O.ListItem key={n} last={i === list.length - 1} leading={<O.Avatar name={n} size="sm" />} title={n} subtitle={`${n.split(' ')[0].toLowerCase()}@${['acme', 'globex', 'initech'][i % 3]}.com`} trailing={sel === n ? <O.StatusDot tone="accent" /> : null} onClick={() => setSel(n)} />
                ))}
              </O.List>
            </O.ScrollableArea>
          </O.VStack>
          <O.VStack gap={3}>
            <O.Card>
              <O.HStack gap={4} wrap>
                <O.Avatar name={sel} size="xl" />
                <O.VStack gap={1} grow>
                  <O.Heading level={1} size="h3">{sel}</O.Heading>
                  <O.Text size="sm" tone="muted">Customer since March 2024 · Lisbon</O.Text>
                  <O.HStack gap={1}><O.Badge tone="accent">Team plan</O.Badge><O.Badge>12 seats</O.Badge></O.HStack>
                </O.VStack>
                <O.Button iconStart={<Mail />}>Email</O.Button>
              </O.HStack>
            </O.Card>
            <O.StatGroup stats={[{ label: 'Tickets', value: Math.round(r() * 12) + 2 }, { label: 'Avg. CSAT', value: `${(4 + r()).toFixed(1)}` }, { label: 'Last contact', value: '2 days ago' }]} />
            <O.Well title="Recent tickets">
              <O.Card padding="none">
                <O.Table label="Tickets" compact rows={tickets.slice(0, 4)} rowKey={(t) => t.id} columns={[{ key: 's', header: 'Subject', render: (t) => t.subject }, { key: 'st', header: 'Status', render: (t) => <O.StatusChip size="sm" tone={ticketStatus.find((s) => s.value === t.status)!.tone}>{t.status}</O.StatusChip> }, { key: 'u', header: 'Updated', align: 'right', hideBelow: 'sm', render: (t) => t.updated }]} />
              </O.Card>
            </O.Well>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Help center: article library
const articles = [
  { id: 'a1', title: 'Set up SSO with Okta', cat: 'Security', views: 4210, helpful: 92, updated: '2d' },
  { id: 'a2', title: 'Invite teammates', cat: 'Getting started', views: 9180, helpful: 97, updated: '1w' },
  { id: 'a3', title: 'Export your data', cat: 'Data', views: 2210, helpful: 81, updated: '3d' },
  { id: 'a4', title: 'Understand API rate limits', cat: 'Developers', views: 3120, helpful: 74, updated: '5d' },
  { id: 'a5', title: 'Change billing details', cat: 'Billing', views: 1890, helpful: 88, updated: '2w' },
  { id: 'a6', title: 'Two-factor authentication', cat: 'Security', views: 2730, helpful: 90, updated: '1mo' },
];
export function SupportKbScreen() {
  const { open } = useScreenNav();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const cats = ['All', ...new Set(articles.map((a) => a.cat))];
  const list = articles.filter((a) => (cat === 'All' || a.cat === cat) && a.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen product={harbor} active="kb" topbar={<O.Text weight="medium">Help center</O.Text>}>
      <Page title="Help center" subtitle="Public articles your customers search before they write in." actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => open('support-article')}>New article</O.Button>}>
        <Cols template="220px minmax(0, 1fr)">
          <O.SideNav label="Categories">
            <O.SideNavSection title="Categories">
              {cats.map((c) => (
                <O.SideNavItem key={c} soft item={{ id: c, label: c, count: c === 'All' ? articles.length : articles.filter((a) => a.cat === c).length }} active={cat} onSelect={setCat} />
              ))}
            </O.SideNavSection>
          </O.SideNav>
          <O.VStack gap={3}>
            <O.SearchInput value={q} onValueChange={setQ} placeholder="Search articles" />
            {list.length ? (
              <O.Grid min={260} gap={3}>
                {list.map((a) => (
                  <O.Card key={a.id} onClick={() => open('support-article')}>
                    <O.VStack gap={3}>
                      <O.HStack justify="between"><O.Badge>{a.cat}</O.Badge><O.Text size="xs" tone="subtle">Updated {a.updated}</O.Text></O.HStack>
                      <O.Text weight="medium">{a.title}</O.Text>
                      <O.HStack gap={4}>
                        <O.HStack gap={1}><Eye size={14} /><O.Text size="xs" tone="muted">{a.views.toLocaleString('en-US')}</O.Text></O.HStack>
                        <O.HStack gap={1}><ThumbsUp size={14} /><O.Text size="xs" tone="muted">{a.helpful}%</O.Text></O.HStack>
                      </O.HStack>
                    </O.VStack>
                  </O.Card>
                ))}
              </O.Grid>
            ) : (
              <O.EmptyState icon={<BookOpen size={18} />} title="No articles found" description="Try another word, or write the article customers are looking for." actions={<O.Button size="sm" variant="primary" onClick={() => open('support-article')}>Write article</O.Button>} />
            )}
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Article editor
export function SupportArticleScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [title, setTitle] = useState('Set up SSO with Okta');
  const [published, setPublished] = useState(false);
  return (
    <Screen product={harbor} active="kb" topbar={<O.Breadcrumbs items={[{ id: 'kb', label: 'Help center' }, { id: 'a', label: title || 'Untitled' }]} onNavigate={() => open('support-kb')} />}>
      <Page max={1160}>
        <Cols template="minmax(0, 1fr) 280px">
          <O.VStack gap={3}>
            <O.TextInput size="lg" aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
            <O.RichTextEditor label="Article body" defaultValue="<h2>Before you start</h2><p>You need admin rights in Okta and Harbor.</p><ol><li>Open Okta → Applications</li><li>Add <b>Harbor</b> from the catalogue</li><li>Copy the metadata URL into Harbor → Settings → Security</li></ol>" />
          </O.VStack>
          <O.Well title="Publishing">
            <O.Card padding="sm">
              <O.VStack gap={3}>
                <O.HStack justify="between"><O.Text size="sm">Status</O.Text><O.StatusChip size="sm" tone={published ? 'success' : 'neutral'}>{published ? 'Published' : 'Draft'}</O.StatusChip></O.HStack>
                <O.Field label="Category"><O.Select size="sm" defaultValue="Security" options={['Getting started', 'Security', 'Billing', 'Data', 'Developers'].map((c) => ({ value: c, label: c }))} /></O.Field>
                <O.Field label="Tags"><O.MultiSelect allowCreate defaultValue={['sso', 'okta']} options={['sso', 'okta', 'saml', 'security'].map((t) => ({ value: t, label: t }))} /></O.Field>
                <O.Switch size="sm" label="Show in widget" defaultChecked />
              </O.VStack>
            </O.Card>
            <O.Button variant="primary" fullWidth onClick={() => (setPublished(true), toast({ title: 'Article published', tone: 'success' }))}>{published ? 'Update' : 'Publish'}</O.Button>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Support analytics
export function SupportAnalyticsScreen() {
  const [range, setRange] = useState('30d');
  const days = range === '7d' ? 7 : 20;
  const data = Array.from({ length: days }, (_, i) => ({ label: `Nov ${i + 1}`, values: { email: 40 + ((i * 7) % 23), chat: 30 + ((i * 11) % 19), phone: 8 + (i % 5), reopened: 2 + (i % 4) } }));
  return (
    <Screen product={harbor} active="analytics" topbar={<O.Text weight="medium">Analytics</O.Text>}>
      <Page title="Support analytics" actions={<O.SegmentedControl size="sm" value={range} onChange={setRange} options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '20 days' }]} />}>
        <O.KpiStrip
          items={[
            { label: 'First response', period: 'median', value: '14m', delta: -18, good: 'down', viz: <O.RangeMarker min={0} max={60} value={14} previous={17} unit="m" />, note: <><O.KpiStrong>3 min</O.KpiStrong> faster than target</> },
            { label: 'Solved', period: range, value: '1,284', delta: 9, viz: <O.SparkBars values={data.map((d) => d.values.email + d.values.chat)} />, note: <>Peak <O.KpiStrong>81</O.KpiStrong> on Nov 12</> },
            { label: 'CSAT', period: range, value: '94%', delta: 2, viz: <O.WaffleGrid filled={94} total={100} />, note: <><O.KpiStrong>412</O.KpiStrong> ratings</> },
            { label: 'Backlog', period: 'now', value: '38', delta: -12, good: 'down', viz: <O.QuotaBar value={38} max={120} />, note: <>Capacity <O.KpiStrong>120</O.KpiStrong> tickets</> },
          ]}
        />
        <O.Well title="Volume by channel" subtitle="Reopened tickets below the line">
          <O.Card>
            <O.StackedBarChart label="Tickets by channel" data={data} series={[{ key: 'email', label: 'Email', color: O.seriesColors.blue }, { key: 'chat', label: 'Chat', color: O.seriesColors.teal }, { key: 'phone', label: 'Phone', color: O.seriesColors.violet }]} negative={{ key: 'reopened', label: 'Reopened', color: O.seriesColors.pink }} />
          </O.Card>
        </O.Well>
        <Cols template="minmax(0, 1fr)">
          <O.Well title="By agent">
            <O.Card padding="none">
              <O.Table label="Agents" compact rows={names.slice(0, 5)} rowKey={(n) => n} columns={[{ key: 'n', header: 'Agent', render: (n) => <O.HStack gap={2}><O.Avatar name={n} size="xs" />{n}</O.HStack> }, { key: 's', header: 'Solved', align: 'right', render: (n) => 120 + n.length * 9 }, { key: 'c', header: 'CSAT', align: 'right', render: (n) => `${90 + (n.length % 9)}%` }]} />
            </O.Card>
          </O.Well>
          <O.Well title="Busiest hours">
            <O.Card>
              <O.VStack gap={3}>
                <O.Heatmap values={Array.from({ length: 24 * 7 }, (_, i) => Math.min(4, Math.round((Math.sin(i / 4) + 1) * 2)))} label="Tickets by hour" unit="tickets" />
                <O.Text size="sm" tone="muted">Peak: Tuesday 10:00–12:00. Staff two more agents then.</O.Text>
              </O.VStack>
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── SLA policies: form layout
export function SupportSlaScreen() {
  const toast = O.useToast();
  return (
    <Screen product={harbor} active="sla" topbar={<O.Text weight="medium">SLA policies</O.Text>}>
      <Page title="SLA policies" subtitle="Targets per priority. Breaches notify the assignee and their lead." max={960}>
        <O.Card>
          <O.FormLayout
            sections={priority.map((p) => ({
              title: <O.HStack gap={2}><O.StatusDot tone={p.tone} />{p.label}</O.HStack>,
              description: `Applies to ${p.label.toLowerCase()} tickets on every channel.`,
              content: (
                <O.Grid min={160} gap={3}>
                  <O.Field label="First response"><O.Select size="sm" defaultValue={p.value === 'urgent' ? '15m' : '1h'} options={['15m', '1h', '4h', '1d'].map((v) => ({ value: v, label: v }))} /></O.Field>
                  <O.Field label="Resolution"><O.Select size="sm" defaultValue={p.value === 'urgent' ? '4h' : '1d'} options={['4h', '1d', '3d', '1w'].map((v) => ({ value: v, label: v }))} /></O.Field>
                </O.Grid>
              ),
            }))}
          />
        </O.Card>
        <O.HStack justify="end"><O.Button variant="primary" onClick={() => toast({ title: 'SLA policies saved', tone: 'success' })}>Save policies</O.Button></O.HStack>
      </Page>
    </Screen>
  );
}

// ───────── Macros: list + preview
export function SupportMacrosScreen() {
  const toast = O.useToast();
  const [macros, setMacros] = useState([
    { id: 'm1', name: 'Ask for workspace URL', body: 'Could you share your workspace URL so I can take a look?', uses: 412 },
    { id: 'm2', name: 'Refund issued', body: 'I have issued a refund. It will reach your card in 5–10 days.', uses: 188 },
    { id: 'm3', name: 'Escalated to engineering', body: 'I have passed this to our engineers and will update you within a day.', uses: 96 },
  ]);
  const [sel, setSel] = useState('m1');
  const cur = macros.find((m) => m.id === sel) ?? macros[0];
  return (
    <Screen product={harbor} active="macros" topbar={<O.Text weight="medium">Macros</O.Text>}>
      <Page title="Macros" subtitle="Saved replies agents insert with one click." actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => { const id = 'm' + Date.now(); setMacros((m) => [...m, { id, name: 'New macro', body: '', uses: 0 }]); setSel(id); }}>New macro</O.Button>} max={1080}>
        <O.Resizable
          defaultSize={36}
          start={
            <O.List boxed={false}>
              {macros.map((m, i) => (
                <O.ListItem key={m.id} last={i === macros.length - 1} leading={<Zap size={16} />} title={m.name} subtitle={`${m.uses} uses`} onClick={() => setSel(m.id)} trailing={m.id === sel ? <O.StatusDot tone="accent" /> : null} />
              ))}
            </O.List>
          }
          end={
            cur ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <O.Field label="Name"><O.TextInput value={cur.name} onChange={(e) => setMacros((ms) => ms.map((m) => (m.id === cur.id ? { ...m, name: e.target.value } : m)))} /></O.Field>
                <O.Field label="Reply"><O.TextArea rows={5} value={cur.body} onChange={(e) => setMacros((ms) => ms.map((m) => (m.id === cur.id ? { ...m, body: e.target.value } : m)))} /></O.Field>
                <O.HStack justify="between">
                  <O.Button variant="ghost" iconStart={<Trash2 />} onClick={() => (setMacros((ms) => ms.filter((m) => m.id !== cur.id)), toast({ title: 'Macro deleted' }))}>Delete</O.Button>
                  <O.Button variant="primary" onClick={() => toast({ title: 'Macro saved', tone: 'success' })}>Save</O.Button>
                </O.HStack>
              </div>
            ) : (
              <O.EmptyState bordered={false} title="No macros" />
            )
          }
        />
      </Page>
    </Screen>
  );
}

