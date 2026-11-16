import { useMemo, useState } from 'react';
import { ArrowRight, Building2, Calendar, CheckCircle2, Clock, Download, FileSpreadsheet, GitBranch, Mail, Phone, Plus, Send, Timer as TimerIcon, Upload, UserPlus, Users, Workflow, Zap } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { relay } from './products';
import { Cols, Page, Row, money, names } from './ui';
import { companies, stages } from './crm';

// ───────── Home: a personal briefing, not a wall of cards
export function CrmHomeScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Send order form to Linear', due: 'Today', done: false },
    { id: 't2', text: 'Prep QBR deck for Fjord Freight', due: 'Tomorrow', done: false },
    { id: 't3', text: 'Follow up with Nimbus legal', due: 'Fri', done: true },
  ]);
  return (
    <Screen product={relay} active="home" topbar={<O.Text weight="medium">Home</O.Text>}>
      <Page title="Good morning, Mira" subtitle="Saturday 15 November · 3 meetings · 2 deals closing this week" max={1180}>
        <Cols template="minmax(0, 1.6fr) minmax(0, 1fr)">
          <O.VStack gap={3}>
            <O.StatGroup stats={[{ label: 'Pipeline', value: '$412k', delta: 8 }, { label: 'Won this month', value: '$96k', delta: 21 }, { label: 'Win rate', value: '36%', delta: -2 }]} />
            <O.Well title="Today" subtitle="From your calendar">
              <O.Card padding="none">
                <O.List boxed={false}>
                  {[
                    ['09:30', 'Linear · pricing call', 'Karri Saarinen, Tuomas Artman'],
                    ['13:00', 'Fjord Freight · QBR', '6 attendees'],
                    ['16:15', 'Pipeline review', 'Sales team'],
                  ].map(([t, a, b], i) => (
                    <O.ListItem key={t} last={i === 2} leading={<O.Badge mono variant="outline">{t}</O.Badge>} title={a} subtitle={b} trailing={<O.Button size="sm" variant="ghost" onClick={() => toast({ title: 'Meeting notes are coming soon' })}>Prep</O.Button>} />
                  ))}
                </O.List>
              </O.Card>
            </O.Well>
            <O.Well title="Deals closing soon" actions={<O.Button size="sm" variant="ghost" iconEnd={<ArrowRight size={14} />} onClick={() => open('crm-deals')}>Board</O.Button>}>
              <O.Card padding="none">
                <O.Table
                  label="Closing soon"
                  compact
                  rowKey={(r) => r.id}
                  rows={companies.filter((c) => c.arr > 0).slice(0, 4)}
                  onRowClick={(r) => open('crm-deal', { id: r.id })}
                  columns={[
                    { key: 'n', header: 'Deal', render: (r) => <O.HStack gap={2}><O.Avatar name={r.name} size="xs" square />{r.name} rollout</O.HStack> },
                    { key: 's', header: 'Stage', hideBelow: 'sm', render: (r) => <O.StatusChip size="sm" tone={stages.find((s) => s.value === r.stage)!.tone}>{stages.find((s) => s.value === r.stage)!.label}</O.StatusChip> },
                    { key: 'v', header: 'Value', align: 'right', render: (r) => money(r.arr) },
                  ]}
                />
              </O.Card>
            </O.Well>
          </O.VStack>
          <O.VStack gap={3}>
            <O.Well title="My tasks" subtitle={`${tasks.filter((t) => !t.done).length} open`}>
              <O.Card padding="sm">
                <O.VStack gap={3}>
                  {tasks.map((t) => (
                    <O.HStack key={t.id} justify="between" align="start">
                      <O.Checkbox label={<span style={{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>{t.text}</span>} checked={t.done} onChange={(v) => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: v } : x)))} />
                      <O.Text size="xs" tone="subtle">{t.due}</O.Text>
                    </O.HStack>
                  ))}
                </O.VStack>
              </O.Card>
            </O.Well>
            <O.Well title="Recent activity">
              <O.Card>
                <O.ActivityFeed
                  items={[
                    { id: 'a', who: 'Theo Park', action: 'moved Nimbus Labs to Negotiation', when: '1h' },
                    { id: 'b', who: 'Ana Ruiz', action: 'won Fjord Freight', detail: '$152,000 ARR · 3-year term', when: '3h' },
                    { id: 'c', who: 'Mira Chen', action: 'logged a call with Paperhill', when: 'Yesterday' },
                  ]}
                />
              </O.Card>
            </O.Well>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── People list: card grid (different from the companies table)
type Person = { id: string; name: string; title: string; company: string; email: string; tags: string[] };
export const people: Person[] = [
  ['Karri Saarinen', 'CEO', 'Linear', ['Champion']],
  ['Tuomas Artman', 'CTO', 'Linear', ['Technical']],
  ['Ingrid Dahl', 'COO', 'Fjord Freight', ['Signer']],
  ['Ravi Shah', 'Head of Ops', 'Nimbus Labs', ['Champion']],
  ['Maya Brooks', 'VP Finance', 'Cobalt Health', ['Budget']],
  ['Leo Martins', 'Founder', 'Paperhill', []],
  ['Anya Volkova', 'Design Lead', 'Arcadia Studio', ['Champion']],
  ['Diego Alvarez', 'IT Manager', 'Helio Energy', ['Technical']],
].map(([name, title, company, tags], i) => ({ id: `p${i}`, name: name as string, title: title as string, company: company as string, email: `${(name as string).split(' ')[0].toLowerCase()}@${(company as string).split(' ')[0].toLowerCase()}.com`, tags: tags as string[] }));

export function CrmPeopleScreen() {
  const { open } = useScreenNav();
  const [q, setQ] = useState('');
  const [view, setView] = useState('grid');
  const list = people.filter((p) => (p.name + p.company + p.title).toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen product={relay} active="people" topbar={<O.Breadcrumbs items={[{ id: 'r', label: 'Records' }, { id: 'p', label: 'People' }]} />}>
      <Page title="People" subtitle={`${people.length} of 3,412 contacts`} actions={<O.Button variant="primary" iconStart={<UserPlus size={15} />}>Add person</O.Button>}>
        <Row>
          <div style={{ flex: '1 1 220px', maxWidth: 320 }}>
            <O.SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search people" />
          </div>
          <span style={{ flex: 1 }} />
          <O.SegmentedControl size="sm" value={view} onChange={setView} label="View" options={[{ value: 'grid', label: 'Cards' }, { value: 'list', label: 'List' }]} />
        </Row>
        {list.length === 0 ? (
          <O.EmptyState icon={<Users size={18} />} title="No people match" description="Try a name, company or job title." actions={<O.Button size="sm" onClick={() => setQ('')}>Clear search</O.Button>} />
        ) : view === 'grid' ? (
          <O.Grid min={240} gap={3}>
            {list.map((p) => (
              <O.Card key={p.id} onClick={() => open('crm-person', { id: p.id })}>
                <O.VStack gap={3}>
                  <O.HStack gap={3}>
                    <O.Avatar name={p.name} size="lg" />
                    <O.VStack gap={0}>
                      <O.Text weight="medium">{p.name}</O.Text>
                      <O.Text size="sm" tone="muted">{p.title} · {p.company}</O.Text>
                    </O.VStack>
                  </O.HStack>
                  <O.HStack gap={1} wrap>
                    {p.tags.length ? p.tags.map((t) => <O.Badge key={t} tone="accent">{t}</O.Badge>) : <O.Badge variant="outline">No tags</O.Badge>}
                  </O.HStack>
                </O.VStack>
              </O.Card>
            ))}
          </O.Grid>
        ) : (
          <O.List label="People">
            {list.map((p, i) => (
              <O.ListItem key={p.id} last={i === list.length - 1} leading={<O.Avatar name={p.name} />} title={p.name} subtitle={`${p.title} · ${p.company}`} trailing={p.email} onClick={() => open('crm-person', { id: p.id })} />
            ))}
          </O.List>
        )}
      </Page>
    </Screen>
  );
}

// ───────── Person record: profile column + tabs
export function CrmPersonScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const p = people.find((x) => x.id === params.id) ?? people[0];
  return (
    <Screen product={relay} active="people" topbar={<O.Breadcrumbs items={[{ id: 'p', label: 'People' }, { id: p.id, label: p.name }]} onNavigate={() => open('crm-people')} />}>
      <Page max={1180}>
        <Cols template="320px minmax(0, 1fr)">
          <O.Well>
            <O.Card>
              <O.VStack gap={4} align="center">
                <O.Avatar name={p.name} size="xl" presence="online" />
                <O.VStack gap={0} align="center">
                  <O.Heading level={1} size="h3">{p.name}</O.Heading>
                  <O.Text size="sm" tone="muted">{p.title} at {p.company}</O.Text>
                </O.VStack>
                <O.HStack gap={2}>
                  <O.IconButton variant="secondary" label="Email" icon={<Mail size={15} />} onClick={() => toast({ title: `Draft to ${p.email}` })} />
                  <O.IconButton variant="secondary" label="Call" icon={<Phone size={15} />} onClick={() => toast({ title: 'Calling is coming soon' })} />
                  <O.IconButton variant="secondary" label="Schedule" icon={<Calendar size={15} />} onClick={() => toast({ title: 'Scheduling is coming soon' })} />
                </O.HStack>
              </O.VStack>
            </O.Card>
            <O.Card padding="sm">
              <O.MetadataList items={[{ label: 'Email', value: p.email }, { label: 'Company', value: <O.Link href="#screens-crm-company" onClick={(e) => (e.preventDefault(), open('crm-company', { id: companies.find((c) => c.name === p.company)?.id ?? 'linear' }))}>{p.company}</O.Link> }, { label: 'Owner', value: 'Mira Chen' }, { label: 'Timezone', value: 'UTC−8 · 06:41' }]} />
            </O.Card>
          </O.Well>
          <O.VStack gap={4}>
            <O.Tabs label="Person" tabs={[{ id: 'a', label: 'Activity' }, { id: 'e', label: 'Emails', count: 12 }, { id: 'd', label: 'Deals', count: 1 }]}>
              {(t) =>
                t === 'a' ? (
                  <O.ActivityFeed
                    items={[
                      { id: '1', who: 'Mira Chen', action: 'sent “Updated order form”', icon: <Mail size={14} />, when: '2h' },
                      { id: '2', who: p.name, action: 'opened the email 3 times', icon: <CheckCircle2 size={14} />, when: '1h' },
                      { id: '3', who: 'Theo Park', action: 'logged a call', detail: 'Wants SSO before signing. Legal review next week.', icon: <Phone size={14} />, when: 'Mon' },
                    ]}
                  />
                ) : t === 'e' ? (
                  <O.List>
                    {['Updated order form', 'Re: SSO requirements', 'Intro: Relay × ' + p.company].map((s, i) => (
                      <O.ListItem key={s} last={i === 2} leading={<Mail size={16} />} title={s} subtitle="mira@northwind.com" trailing={['2h', 'Mon', 'Oct 28'][i]} />
                    ))}
                  </O.List>
                ) : (
                  <O.Card onClick={() => open('crm-deal', { id: 'linear' })}>
                    <O.CardHeader title={`${p.company} rollout`} subtitle="$84,000 · closes 30 Nov" actions={<O.StatusChip tone="warning">Negotiation</O.StatusChip>} />
                  </O.Card>
                )
              }
            </O.Tabs>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Deals: kanban board
type Deal = { id: string; name: string; value: number; owner: string; stage: string; due: string };
export function CrmDealsScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [deals, setDeals] = useState<Deal[]>(
    companies.map((c, i) => ({ id: c.id, name: `${c.name}`, value: c.arr || 18000 + i * 7000, owner: c.owner, stage: c.stage, due: ['Nov 30', 'Dec 4', 'Dec 12', 'Jan 9'][i % 4] })),
  );
  const cols = stages.map((s) => ({ id: s.value, title: s.label, tone: s.tone, items: deals.filter((d) => d.stage === s.value) }));
  const total = (st: string) => money(deals.filter((d) => d.stage === st).reduce((a, d) => a + d.value, 0));
  return (
    <Screen product={relay} active="deals" topbar={<O.Text weight="medium">Deals</O.Text>}>
      <Page title="Pipeline" subtitle={`${deals.length} open deals · ${money(deals.reduce((a, d) => a + d.value, 0))} total`} actions={<O.Button variant="primary" iconStart={<Plus size={15} />} onClick={() => (setDeals((d) => [...d, { id: 'n' + Date.now(), name: 'New deal', value: 10000, owner: 'Mira Chen', stage: 'lead', due: 'Dec 20' }]), toast({ title: 'Deal added to Lead' }))}>New deal</O.Button>}>
        <O.KanbanBoard
          columns={cols}
          getId={(d) => d.id}
          onMove={(id, to) => setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, stage: to } : d)))}
          onAdd={(c) => setDeals((d) => [...d, { id: 'n' + Date.now(), name: 'New deal', value: 10000, owner: 'Mira Chen', stage: c, due: 'Dec 20' }])}
          renderCard={(d) => (
            <button type="button" onClick={() => open('crm-deal', { id: d.id })} style={{ all: 'unset', display: 'flex', flexDirection: 'column', gap: 8, width: 'calc(100% - 28px)', cursor: 'pointer' }}>
              <O.Text size="sm" weight="medium">{d.name}</O.Text>
              <O.Text size="sm" numeric>{money(d.value)}</O.Text>
              <O.HStack justify="between">
                <O.Avatar name={d.owner} size="xs" />
                <O.Text size="xs" tone="subtle">{d.due}</O.Text>
              </O.HStack>
            </button>
          )}
        />
        <O.Text size="xs" tone="subtle">Column totals: {stages.map((s) => `${s.label} ${total(s.value)}`).join(' · ')}</O.Text>
      </Page>
    </Screen>
  );
}

// ───────── Deal record: stepper + checklist
export function CrmDealScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const c = companies.find((x) => x.id === params.id) ?? companies[0];
  const order = ['lead', 'qualified', 'negotiation', 'won'];
  const [stage, setStage] = useState(Math.max(0, order.indexOf(c.stage)));
  const [items, setItems] = useState([
    { id: 'a', t: 'Security questionnaire', done: true },
    { id: 'b', t: 'SSO configured in sandbox', done: true },
    { id: 'c', t: 'Legal redlines returned', done: false },
    { id: 'd', t: 'Order form signed', done: false },
  ]);
  return (
    <Screen product={relay} active="deals" topbar={<O.Breadcrumbs items={[{ id: 'd', label: 'Deals' }, { id: c.id, label: `${c.name} rollout` }]} onNavigate={() => open('crm-deals')} />}>
      <Page title={`${c.name} rollout`} subtitle={`${money(c.arr || 48000)} ARR · owner ${c.owner} · expected close 30 Nov`} actions={<><O.Button onClick={() => toast({ title: 'Marked as lost', tone: 'danger' })}>Mark lost</O.Button><O.Button variant="primary" onClick={() => (setStage(3), toast({ title: 'Deal won', tone: 'success' }))}>Mark won</O.Button></>} max={1100}>
        <O.Card>
          <O.Stepper steps={[{ label: 'Lead' }, { label: 'Qualified' }, { label: 'Negotiation' }, { label: 'Won' }]} current={stage} onStepClick={setStage} />
        </O.Card>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)" stretch>
          <O.Well title="Close plan" subtitle={`${items.filter((i) => i.done).length} of ${items.length} done`} fill>
            <O.Card grow>
              <O.VStack gap={3}>
                <O.ProgressBar value={(items.filter((i) => i.done).length / items.length) * 100} showValue={false} />
                {items.map((i) => (
                  <O.Checkbox key={i.id} label={i.t} checked={i.done} onChange={(v) => setItems((xs) => xs.map((x) => (x.id === i.id ? { ...x, done: v } : x)))} />
                ))}
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.Well title="Buying committee" fill>
            <O.Card padding="none" grow>
              <O.List boxed={false}>
                {people.slice(0, 3).map((p, i) => (
                  <O.ListItem key={p.id} last={i === 2} leading={<O.Avatar name={p.name} size="sm" />} title={p.name} subtitle={p.title} trailing={<O.Badge tone={i === 0 ? 'accent' : 'neutral'}>{['Champion', 'Technical', 'Signer'][i]}</O.Badge>} />
                ))}
              </O.List>
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Workflows list
export function CrmWorkflowsScreen() {
  const { open } = useScreenNav();
  const [on, setOn] = useState<Record<string, boolean>>({ w1: true, w2: true, w3: false, w4: true });
  const flows = [
    { id: 'w1', name: 'New lead → assign owner', trigger: 'Company created', runs: 1240 },
    { id: 'w2', name: 'Deal won → notify #wins', trigger: 'Stage changed', runs: 86 },
    { id: 'w3', name: 'Stale deal reminder', trigger: 'Every Monday 9:00', runs: 0 },
    { id: 'w4', name: 'Enrich new contacts', trigger: 'Person created', runs: 3112 },
  ];
  return (
    <Screen product={relay} active="workflows" topbar={<O.Text weight="medium">Workflows</O.Text>}>
      <Page title="Workflows" subtitle="Automations that run on record changes and schedules." actions={<O.Button variant="primary" iconStart={<Plus size={15} />} onClick={() => open('crm-workflow')}>New workflow</O.Button>} max={980}>
        <O.VStack gap={2}>
          {flows.map((f) => (
            <O.Card key={f.id} padding="sm">
              <O.HStack gap={3}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Workflow size={16} />
                </span>
                <O.VStack gap={0} grow>
                  <O.Text weight="medium">{f.name}</O.Text>
                  <O.Text size="sm" tone="muted">
                    <Zap size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {f.trigger} · {f.runs.toLocaleString('en-US')} runs
                  </O.Text>
                </O.VStack>
                <O.Switch aria-label={`Turn ${f.name} ${on[f.id] ? 'off' : 'on'}`} checked={on[f.id]} onChange={(v) => setOn({ ...on, [f.id]: v })} />
                <O.Button size="sm" variant="ghost" onClick={() => open('crm-workflow')}>Edit</O.Button>
              </O.HStack>
            </O.Card>
          ))}
        </O.VStack>
      </Page>
    </Screen>
  );
}

// ───────── Workflow builder: canvas + inspector
export function CrmWorkflowScreen() {
  const toast = O.useToast();
  const [nodes, setNodes] = useState<O.FlowNode[]>([
    { id: 'n1', x: 40, y: 30, title: 'Company created', subtitle: 'Trigger', icon: <Zap size={15} />, kind: 'trigger' },
    { id: 'n2', x: 40, y: 150, title: 'Employees > 100?', subtitle: 'Condition', icon: <GitBranch size={15} />, kind: 'condition' },
    { id: 'n3', x: 0, y: 290, title: 'Assign to Mira', subtitle: 'Enterprise team', icon: <UserPlus size={15} /> },
    { id: 'n4', x: 260, y: 290, title: 'Add to nurture', subtitle: 'Email sequence', icon: <Send size={15} /> },
    { id: 'n5', x: 130, y: 410, title: 'Done', subtitle: 'End', icon: <CheckCircle2 size={15} />, kind: 'end' },
  ]);
  const [sel, setSel] = useState<string | null>('n2');
  const cur = nodes.find((n) => n.id === sel);
  return (
    <Screen product={relay} active="workflows" topbar={<O.HStack gap={2}><O.Text weight="medium">New lead → assign owner</O.Text><O.StatusChip size="sm" tone="success" variant="dot">Live</O.StatusChip></O.HStack>}>
      <Page max={1320}>
        <Cols template="minmax(0, 1fr) 300px">
          <O.FlowCanvas
            nodes={nodes}
            onNodesChange={setNodes}
            selected={sel}
            onSelect={setSel}
            edges={[{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3', label: 'yes' }, { from: 'n2', to: 'n4', label: 'no' }, { from: 'n3', to: 'n5' }, { from: 'n4', to: 'n5' }]}
            height={520}
          />
          <O.Well title="Step" subtitle={cur?.subtitle ?? 'Select a step'}>
            <O.Card>
              {cur ? (
                <O.VStack gap={4}>
                  <O.Field label="Name">
                    <O.TextInput value={cur.title} onChange={(e) => setNodes((ns) => ns.map((n) => (n.id === cur.id ? { ...n, title: e.target.value } : n)))} />
                  </O.Field>
                  {cur.kind === 'condition' && (
                    <O.Field label="Rule" help="Records that match go down the “yes” path.">
                      <O.Select defaultValue="gt100" options={[{ value: 'gt100', label: 'Employees greater than 100' }, { value: 'eu', label: 'Region is Europe' }]} />
                    </O.Field>
                  )}
                  <O.Field label="Run delay">
                    <O.Select defaultValue="0" options={[{ value: '0', label: 'Immediately' }, { value: '1h', label: 'After 1 hour' }, { value: '1d', label: 'After 1 day' }]} />
                  </O.Field>
                  <O.Text size="xs" tone="subtle">Drag steps on the canvas, or focus one and use the arrow keys.</O.Text>
                </O.VStack>
              ) : (
                <O.EmptyState bordered={false} title="No step selected" description="Click a step on the canvas." />
              )}
            </O.Card>
            <O.HStack justify="end" gap={2}>
              <O.Button onClick={() => toast({ title: 'Test run passed', description: '3 records matched', tone: 'success' })} iconStart={<TimerIcon size={15} />}>Test</O.Button>
              <O.Button variant="primary" onClick={() => toast({ title: 'Workflow published', tone: 'success' })}>Publish</O.Button>
            </O.HStack>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Pipeline report
export function CrmReportsScreen() {
  const [range, setRange] = useState('q4');
  const bars = useMemo(() => stages.slice(0, 4).map((s, i) => ({ label: s.label, value: [412, 268, 144, 96][i] * (range === 'q4' ? 1 : 0.8) })), [range]);
  return (
    <Screen product={relay} active="r-pipeline" topbar={<O.Breadcrumbs items={[{ id: 'r', label: 'Reports' }, { id: 'p', label: 'Pipeline' }]} />}>
      <Page title="Pipeline report" subtitle="Value by stage and rep, in thousands of dollars." actions={<><O.SegmentedControl size="sm" value={range} onChange={setRange} options={[{ value: 'q3', label: 'Q3' }, { value: 'q4', label: 'Q4' }]} /><O.Button iconStart={<Download size={15} />}>Export</O.Button></>}>
        <O.StatGroup stats={[{ label: 'Created', value: range === 'q4' ? 148 : 121, delta: 22 }, { label: 'Won', value: range === 'q4' ? 31 : 26, delta: 19 }, { label: 'Avg. cycle', value: '41 days', delta: -6 }, { label: 'Avg. deal', value: '$31k', delta: 4 }]} />
        <Cols template="minmax(0, 1.4fr) minmax(0, 1fr)" stretch>
          <O.Well title="Funnel" subtitle="$k by stage" fill>
            <O.Card grow>
              <O.BarChart data={bars} height={220} format={(n) => `$${Math.round(n)}k`} highlight={3} />
            </O.Card>
          </O.Well>
          <O.Well title="By rep" fill>
            <O.Card grow>
              <O.VStack gap={4}>
                {names.slice(0, 5).map((n, i) => (
                  <O.ProgressBar key={n} label={n} value={[92, 74, 61, 48, 33][i]} tone={i === 0 ? 'accent' : 'neutral'} />
                ))}
              </O.VStack>
            </O.Card>
          </O.Well>
        </Cols>
        <O.Well title="Won deals over time">
          <O.Card>
            <O.LineChart label="Won deals" labels={['W40', 'W41', 'W42', 'W43', 'W44', 'W45', 'W46']} series={[{ name: 'Won', values: [3, 5, 4, 6, 4, 7, 8] }, { name: 'Lost', values: [2, 1, 3, 2, 2, 1, 2], color: O.colors.danger, dashed: true }]} />
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Import wizard
export function CrmImportScreen() {
  const toast = O.useToast();
  const { open } = useScreenNav();
  const [step, setStep] = useState(0);
  const [obj, setObj] = useState('companies');
  const [files, setFiles] = useState(0);
  const [map, setMap] = useState<Record<string, string>>({ 'Company name': 'name', Website: 'domain', Employees: 'employees', 'Account owner': 'owner' });
  return (
    <Screen product={relay} active="import" topbar={<O.Text weight="medium">Import</O.Text>}>
      <Page title="Import records" subtitle="Bring data in from a CSV file." max={760}>
        <O.Card>
          <O.Stepper current={step} onStepClick={setStep} steps={[{ label: 'Object' }, { label: 'Upload' }, { label: 'Map fields' }, { label: 'Review' }]} />
        </O.Card>
        <O.Well>
          <O.Card>
            {step === 0 && (
              <O.VStack gap={2}>
                {[
                  ['companies', 'Companies', 'Organisations you sell to', <Building2 key="b" size={18} />],
                  ['people', 'People', 'Contacts and their emails', <Users key="u" size={18} />],
                  ['deals', 'Deals', 'Opportunities with value and stage', <FileSpreadsheet key="f" size={18} />],
                ].map(([id, t, d, ic]) => (
                  <O.SelectableCard key={id as string} icon={ic} selected={obj === id} onSelect={() => setObj(id as string)} title={t} description={d} />
                ))}
              </O.VStack>
            )}
            {step === 1 && (
              <O.Field label="CSV file" help={files ? `${files} file ready` : 'First row must be column names'}>
                <O.FileInput accept=".csv" multiple={false} onChange={(f) => setFiles(f.length)} hint="CSV up to 50 MB" />
              </O.Field>
            )}
            {step === 2 && (
              <O.VStack gap={3}>
                {Object.keys(map).map((col) => (
                  <O.HStack key={col} gap={3}>
                    <span style={{ flex: '1 1 0', minWidth: 0 }}><O.Text size="sm" mono>{col}</O.Text></span>
                    <ArrowRight size={14} />
                    <span style={{ flex: '1 1 0', minWidth: 0 }}>
                      <O.Select size="sm" label={`Map ${col}`} value={map[col]} onChange={(v) => setMap({ ...map, [col]: v })} options={['name', 'domain', 'employees', 'owner', 'skip'].map((v) => ({ value: v, label: v === 'skip' ? 'Do not import' : v }))} />
                    </span>
                  </O.HStack>
                ))}
              </O.VStack>
            )}
            {step === 3 && (
              <O.VStack gap={3}>
                <O.Banner tone="success" title="1,180 rows ready">24 rows have no website and will be imported without one.</O.Banner>
                <O.MetadataList items={[{ label: 'Object', value: obj }, { label: 'Mapped fields', value: Object.values(map).filter((v) => v !== 'skip').length }, { label: 'Duplicates', value: 'Merge by domain' }]} />
              </O.VStack>
            )}
          </O.Card>
          <O.HStack justify="between">
            <O.Button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</O.Button>
            {step < 3 ? (
              <O.Button variant="primary" disabled={step === 1 && !files} onClick={() => setStep(step + 1)}>Continue</O.Button>
            ) : (
              <O.Button variant="primary" iconStart={<Upload size={15} />} onClick={() => (toast({ title: 'Import started', description: 'We will notify you when it finishes.', tone: 'success' }), open('crm-companies'))}>Import 1,180 rows</O.Button>
            )}
          </O.HStack>
        </O.Well>
        <O.Text size="xs" tone="subtle"><Clock size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Last import: 2 days ago by Theo Park</O.Text>
      </Page>
    </Screen>
  );
}
