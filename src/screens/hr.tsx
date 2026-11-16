import { useState } from 'react';
import { Briefcase, Building2, Calendar, CircleCheck, Download, FileText, Laptop, Mail, MapPin, Palmtree, Phone, Plus, Shield, Star, Users } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { crew } from './products';
import { Cols, Page, money, names } from './ui';

type Emp = { id: string; name: string; title: string; team: string; location: string; manager?: string; start: string; status: 'active' | 'leave' | 'onboarding' };
const teams = ['Design', 'Engineering', 'Sales', 'Support', 'Operations'];
export const employees: Emp[] = names.map((n, i) => ({
  id: `e${i}`,
  name: n,
  title: ['Design lead', 'Staff engineer', 'Account executive', 'Support lead', 'People partner', 'Product designer', 'Engineer', 'SDR', 'Support agent', 'Ops analyst', 'Engineer', 'Designer', 'Engineer', 'AE', 'Recruiter'][i],
  team: teams[i % 5],
  location: ['Lisbon', 'Berlin', 'London', 'Tokyo', 'Remote'][i % 5],
  manager: i < 5 ? undefined : names[i % 5],
  start: ['Mar 2022', 'Jan 2021', 'Aug 2023', 'May 2024', 'Oct 2020'][i % 5],
  status: i === 3 ? 'leave' : i === 12 ? 'onboarding' : 'active',
}));
const statusTone: Record<Emp['status'], O.Tone> = { active: 'success', leave: 'warning', onboarding: 'info' };

// ───────── Directory: grouped by team
export function HrDirectoryScreen() {
  const { open } = useScreenNav();
  const [q, setQ] = useState('');
  const [team, setTeam] = useState('all');
  const list = employees.filter((e) => (team === 'all' || e.team === team) && (e.name + e.title).toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen product={crew} active="directory" topbar={<O.Text weight="medium">Directory</O.Text>}>
      <Page title="People" subtitle={`${employees.length} people · ${teams.length} teams · 5 offices`} actions={<O.Button variant="primary" iconStart={<Plus />}>Add person</O.Button>}>
        <O.HStack gap={2} wrap>
          <div style={{ flex: '1 1 220px', maxWidth: 320 }}><O.SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search by name or role" /></div>
          <O.SegmentedControl size="sm" value={team} onChange={setTeam} options={[{ value: 'all', label: 'All' }, ...teams.map((t) => ({ value: t, label: t }))]} />
        </O.HStack>
        {list.length === 0 && <O.EmptyState icon={<Users size={18} />} title="Nobody matches" actions={<O.Button size="sm" onClick={() => (setQ(''), setTeam('all'))}>Reset</O.Button>} />}
        {teams.filter((t) => list.some((e) => e.team === t)).map((t) => (
          <O.Section key={t} title={t} subtitle={`${list.filter((e) => e.team === t).length} people`}>
            <O.Grid min={230} gap={2}>
              {list.filter((e) => e.team === t).map((e) => (
                <O.Card key={e.id} padding="sm" onClick={() => open('hr-employee', { id: e.id })}>
                  <O.HStack gap={3}>
                    <O.Avatar name={e.name} size="lg" status={e.status === 'leave' ? 'warning' : 'success'} />
                    <O.VStack gap={0} grow>
                      <O.Text size="sm" weight="medium">{e.name}</O.Text>
                      <O.Text size="xs" tone="muted">{e.title} · {e.location}</O.Text>
                    </O.VStack>
                  </O.HStack>
                </O.Card>
              ))}
            </O.Grid>
          </O.Section>
        ))}
      </Page>
    </Screen>
  );
}

// ───────── Employee profile
export function HrEmployeeScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const e = employees.find((x) => x.id === params.id) ?? employees[0];
  return (
    <Screen product={crew} active="directory" topbar={<O.Breadcrumbs items={[{ id: 'd', label: 'Directory' }, { id: e.id, label: e.name }]} onNavigate={() => open('hr-directory')} />}>
      <Page max={1120}>
        <O.Well>
          <O.Card>
            <O.HStack gap={4} wrap>
              <O.Avatar name={e.name} size="xl" status={e.status === 'leave' ? 'warning' : 'success'} />
              <O.VStack gap={1} grow>
                <O.Heading level={1} size="h2">{e.name}</O.Heading>
                <O.Text tone="muted">{e.title} · {e.team}</O.Text>
                <O.HStack gap={1}><O.StatusChip size="sm" tone={statusTone[e.status]}>{e.status === 'leave' ? 'On leave' : e.status === 'onboarding' ? 'Onboarding' : 'Active'}</O.StatusChip><O.Badge variant="outline">Since {e.start}</O.Badge></O.HStack>
              </O.VStack>
              <O.HStack gap={2}>
                <O.IconButton variant="secondary" label="Email" icon={<Mail />} onClick={() => toast({ title: 'Opening mail…' })} />
                <O.IconButton variant="secondary" label="Call" icon={<Phone />} onClick={() => toast({ title: 'Calling is coming soon' })} />
              </O.HStack>
            </O.HStack>
          </O.Card>
        </O.Well>
        <O.Tabs label="Profile" tabs={[{ id: 'about', label: 'About' }, { id: 'time', label: 'Time off' }, { id: 'docs', label: 'Documents', count: 4 }, { id: 'equip', label: 'Equipment' }]}>
          {(t) =>
            t === 'about' ? (
              <Cols template="minmax(0, 1fr) minmax(0, 1fr)">
                <O.Card padding="sm"><O.MetadataList items={[{ label: 'Email', value: `${e.name.split(' ')[0].toLowerCase()}@crew.hr` }, { label: 'Location', icon: <MapPin size={14} />, value: e.location }, { label: 'Manager', value: e.manager ?? '—' }, { label: 'Employment', value: 'Full-time' }]} /></O.Card>
                <O.Card padding="sm"><O.MetadataList items={[{ label: 'Team', icon: <Building2 size={14} />, value: e.team }, { label: 'Level', value: 'L4' }, { label: 'Start date', icon: <Calendar size={14} />, value: e.start }, { label: 'Birthday', value: '28 July' }]} /></O.Card>
              </Cols>
            ) : t === 'time' ? (
              <O.StatGroup stats={[{ label: 'Vacation left', value: '14 days' }, { label: 'Taken this year', value: '11 days' }, { label: 'Sick days', value: '2' }]} />
            ) : t === 'docs' ? (
              <O.List>
                {['Employment contract.pdf', 'NDA.pdf', 'Tax form 2026.pdf', 'Visa permit.pdf'].map((d, i) => (
                  <O.ListItem key={d} last={i === 3} leading={<FileText size={16} />} title={d} subtitle="Signed" trailing={<O.IconButton size="sm" label={`Download ${d}`} icon={<Download />} onClick={() => toast({ title: `Downloading ${d}` })} />} />
                ))}
              </O.List>
            ) : (
              <O.List>
                <O.ListItem leading={<Laptop size={16} />} title='MacBook Pro 14"' subtitle="Serial C02X… · issued Mar 2022" />
                <O.ListItem last leading={<Shield size={16} />} title="YubiKey 5C" subtitle="Issued Mar 2022" />
              </O.List>
            )
          }
        </O.Tabs>
      </Page>
    </Screen>
  );
}

// ───────── Org chart (tree)
export function HrOrgScreen() {
  const [sel, setSel] = useState('ceo');
  const nodes: O.TreeNode[] = [
    {
      id: 'ceo',
      label: 'Nadia Karim · CEO',
      icon: <O.Avatar name="Nadia Karim" size="xs" />,
      children: teams.map((t, i) => ({ id: t, label: `${names[i]} · ${t}`, icon: <O.Avatar name={names[i]} size="xs" />, meta: `${employees.filter((e) => e.team === t).length}`, children: employees.filter((e) => e.team === t && e.manager).map((e) => ({ id: e.id, label: `${e.name} · ${e.title}`, icon: <O.Avatar name={e.name} size="xs" /> })) })),
    },
  ];
  const e = employees.find((x) => x.id === sel);
  return (
    <Screen product={crew} active="org" topbar={<O.Text weight="medium">Org chart</O.Text>}>
      <Page title="Org chart" subtitle="Reporting lines, updated from the directory." max={1080}>
        <Cols template="minmax(0, 1fr) 300px">
          <O.Card>
            <O.TreeList label="Organisation" nodes={nodes} selected={sel} onSelect={setSel} defaultExpanded={['ceo', 'Design', 'Engineering']} />
          </O.Card>
          <O.Well title="Selected">
            <O.Card>
              {e ? (
                <O.VStack gap={3} align="center">
                  <O.Avatar name={e.name} size="xl" />
                  <O.Text weight="medium">{e.name}</O.Text>
                  <O.Text size="sm" tone="muted">{e.title}</O.Text>
                  <O.Badge>{e.team}</O.Badge>
                </O.VStack>
              ) : (
                <O.VStack gap={3} align="center">
                  <O.Avatar name={sel === 'ceo' ? 'Nadia Karim' : names[teams.indexOf(sel)] ?? sel} size="xl" />
                  <O.Text weight="medium">{sel === 'ceo' ? 'Nadia Karim' : `${sel} team`}</O.Text>
                  <O.Text size="sm" tone="muted">{sel === 'ceo' ? 'Chief executive' : `Led by ${names[teams.indexOf(sel)] ?? '—'}`}</O.Text>
                  <div style={{ alignSelf: 'stretch' }}>
                    <O.MetadataList alignValues="right" items={sel === 'ceo' ? [{ label: 'Direct reports', value: teams.length }, { label: 'Organisation', value: employees.length }] : [{ label: 'People', value: employees.filter((e) => e.team === sel).length }, { label: 'Open roles', value: 1 }]} />
                  </div>
                </O.VStack>
              )}
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Time off: calendar + requests
export function HrTimeOffScreen() {
  const toast = O.useToast();
  const [req, setReq] = useState([
    { id: 'r1', who: 'Lea Moss', range: '24–28 Nov', days: 5, kind: 'Vacation', state: 'pending' },
    { id: 'r2', who: 'Owen Hale', range: '2 Dec', days: 1, kind: 'Personal', state: 'pending' },
    { id: 'r3', who: 'Sam Ito', range: '18–19 Nov', days: 2, kind: 'Sick', state: 'pending' },
  ]);
  const [open, setOpen] = useState(false);
  const decide = (id: string, state: string) => (setReq((r) => r.map((x) => (x.id === id ? { ...x, state } : x))), toast({ title: state === 'approved' ? 'Request approved' : 'Request declined', tone: state === 'approved' ? 'success' : 'neutral' }));
  return (
    <Screen product={crew} active="timeoff" topbar={<O.Text weight="medium">Time off</O.Text>}>
      <Page title="Time off" actions={<O.Button variant="primary" iconStart={<Palmtree />} onClick={() => setOpen(true)}>Request time off</O.Button>}>
        <Cols template="minmax(0, 1.5fr) minmax(0, 1fr)">
          <O.EventCalendar events={[
            { id: 'a', date: new Date(2026, 10, 18), title: 'Sam · sick', tone: 'danger' },
            { id: 'b', date: new Date(2026, 10, 19), title: 'Sam · sick', tone: 'danger' },
            ...[24, 25, 26, 27, 28].map((d) => ({ id: 'l' + d, date: new Date(2026, 10, d), title: 'Lea · vacation', tone: 'success' as const })),
            { id: 'h', date: new Date(2026, 11, 1), title: 'Public holiday', tone: 'neutral' },
          ]} />
          <O.Well title="Requests" subtitle={`${req.filter((r) => r.state === 'pending').length} waiting for you`}>
            <O.VStack gap={2}>
              {req.map((r) => (
                <O.Card key={r.id} padding="sm">
                  <O.VStack gap={2}>
                    <O.HStack gap={2}><O.Avatar name={r.who} size="sm" /><O.VStack gap={0} grow><O.Text size="sm" weight="medium">{r.who}</O.Text><O.Text size="xs" tone="muted">{r.kind} · {r.range} · {r.days}d</O.Text></O.VStack></O.HStack>
                    {r.state === 'pending' ? (
                      <O.HStack gap={2} justify="end"><O.Button size="sm" variant="ghost" onClick={() => decide(r.id, 'declined')}>Decline</O.Button><O.Button size="sm" variant="primary" onClick={() => decide(r.id, 'approved')}>Approve</O.Button></O.HStack>
                    ) : (
                      <O.StatusChip size="sm" tone={r.state === 'approved' ? 'success' : 'neutral'}>{r.state}</O.StatusChip>
                    )}
                  </O.VStack>
                </O.Card>
              ))}
            </O.VStack>
          </O.Well>
        </Cols>
      </Page>
      <O.Dialog open={open} onClose={() => setOpen(false)} title="Request time off" footer={<><O.Button onClick={() => setOpen(false)}>Cancel</O.Button><O.Button variant="primary" onClick={() => (setOpen(false), toast({ title: 'Request sent to your manager', tone: 'success' }))}>Send request</O.Button></>}>
        <O.VStack gap={4}>
          <O.Field label="Type"><O.Select defaultValue="vac" options={[{ value: 'vac', label: 'Vacation · 14 days left' }, { value: 'sick', label: 'Sick' }, { value: 'pers', label: 'Personal' }]} /></O.Field>
          <O.Field label="Dates"><O.DateRangeInput /></O.Field>
          <O.Field label="Note" optional><O.TextArea rows={3} /></O.Field>
        </O.VStack>
      </O.Dialog>
    </Screen>
  );
}

// ───────── Hiring pipeline: kanban
type Cand = { id: string; name: string; role: string; stage: string; score: number; source: string };
export function HrHiringScreen() {
  const { open } = useScreenNav();
  const [cands, setCands] = useState<Cand[]>(['Kai Nakamura', 'Ines Duarte', 'Ben Okafor', 'Lina Berg', 'Marco Vidal', 'Hana Kim', 'Rafael Costa', 'Zoe Adler'].map((n, i) => ({ id: 'k' + i, name: n, role: ['Product designer', 'Staff engineer', 'Support lead'][i % 3], stage: ['applied', 'screen', 'interview', 'offer', 'applied', 'interview', 'screen', 'applied'][i], score: 3 + (i % 3), source: ['LinkedIn', 'Referral', 'Careers page'][i % 3] })));
  const stages = [{ id: 'applied', title: 'Applied', tone: 'neutral' as const }, { id: 'screen', title: 'Phone screen', tone: 'info' as const }, { id: 'interview', title: 'Interview', tone: 'warning' as const }, { id: 'offer', title: 'Offer', tone: 'success' as const }];
  return (
    <Screen product={crew} active="hiring" topbar={<O.Text weight="medium">Hiring</O.Text>}>
      <Page title="Hiring pipeline" subtitle="3 open roles · 8 candidates" actions={<O.Button variant="primary" iconStart={<Briefcase />}>New role</O.Button>}>
        <O.KanbanBoard
          columns={stages.map((s) => ({ ...s, items: cands.filter((c) => c.stage === s.id) }))}
          getId={(c) => c.id}
          onMove={(id, to) => setCands((cs) => cs.map((c) => (c.id === id ? { ...c, stage: to } : c)))}
          renderCard={(c) => (
            <button type="button" onClick={() => open('hr-candidate', { id: c.id })} style={{ all: 'unset', display: 'flex', flexDirection: 'column', gap: 8, width: 'calc(100% - 28px)', cursor: 'pointer' }}>
              <O.HStack gap={2}><O.Avatar name={c.name} size="sm" /><O.Text size="sm" weight="medium">{c.name}</O.Text></O.HStack>
              <O.Text size="xs" tone="muted">{c.role} · {c.source}</O.Text>
              <O.HStack gap={0}>{Array.from({ length: 5 }, (_, k) => <Star key={k} size={13} fill={k < c.score ? 'currentColor' : 'none'} style={{ opacity: k < c.score ? 1 : 0.3 }} />)}</O.HStack>
            </button>
          )}
        />
      </Page>
    </Screen>
  );
}

// ───────── Candidate
export function HrCandidateScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [step, setStep] = useState(2);
  const [rating, setRating] = useState('yes');
  return (
    <Screen product={crew} active="hiring" topbar={<O.Breadcrumbs items={[{ id: 'h', label: 'Hiring' }, { id: 'c', label: 'Ines Duarte' }]} onNavigate={() => open('hr-hiring')} />}>
      <Page title="Ines Duarte" subtitle="Staff engineer · referred by Theo Park" actions={<><O.Button variant="ghost" onClick={() => toast({ title: 'Candidate rejected with a kind email' })}>Reject</O.Button><O.Button variant="primary" onClick={() => (setStep(3), toast({ title: 'Moved to Offer', tone: 'success' }))}>Advance</O.Button></>} max={1100}>
        <O.Card><O.Stepper current={step} onStepClick={setStep} steps={[{ label: 'Applied' }, { label: 'Phone screen' }, { label: 'Interview' }, { label: 'Offer' }]} /></O.Card>
        <Cols template="minmax(0, 1fr) 320px">
          <O.Well title="Scorecard" subtitle="Your interview · system design">
            <O.Card>
              <O.VStack gap={4}>
                <O.RadioGroup label="Overall" direction="row" value={rating} onChange={setRating} options={[{ value: 'strong', label: 'Strong yes' }, { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
                {['Problem solving', 'Communication', 'Systems depth'].map((s, i) => (
                  <O.Field key={s} label={s}><O.Slider defaultValue={[4, 3, 4][i]} min={1} max={5} format={(n) => `${n} / 5`} /></O.Field>
                ))}
                <O.Field label="Notes"><O.TextArea rows={4} defaultValue="Clear trade-offs on caching. Asked good questions about on-call." /></O.Field>
                <O.HStack justify="end"><O.Button variant="primary" onClick={() => toast({ title: 'Scorecard submitted', tone: 'success' })}>Submit scorecard</O.Button></O.HStack>
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.VStack gap={3}>
            <O.Card padding="sm"><O.MetadataList items={[{ label: 'Email', value: 'ines@duarte.dev' }, { label: 'Location', value: 'Porto' }, { label: 'Expected', value: '€95k' }, { label: 'Notice', value: '1 month' }]} /></O.Card>
            <O.Card padding="sm">
              <O.ActivityFeed items={[{ id: '1', who: 'Theo Park', action: 'referred Ines', when: 'Nov 2' }, { id: '2', who: 'Lea Moss', action: 'passed the phone screen', when: 'Nov 8', icon: <CircleCheck size={14} /> }, { id: '3', who: 'You', action: 'interview today 15:00', when: 'Today', icon: <Calendar size={14} /> }]} />
            </O.Card>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Onboarding checklist
export function HrOnboardingScreen() {
  const [done, setDone] = useState<string[]>(['contract', 'laptop']);
  const groups = [
    { id: 'before', title: 'Before day one', items: [['contract', 'Contract signed'], ['laptop', 'Laptop shipped'], ['accounts', 'Accounts created']] },
    { id: 'week1', title: 'First week', items: [['buddy', 'Meet onboarding buddy'], ['security', 'Security training'], ['1on1', 'First 1:1 with manager']] },
    { id: 'month1', title: 'First month', items: [['goals', '30-day goals agreed'], ['ship', 'First change shipped']] },
  ];
  const total = groups.reduce((a, g) => a + g.items.length, 0);
  return (
    <Screen product={crew} active="onboarding" topbar={<O.Text weight="medium">Onboarding</O.Text>}>
      <Page title="Onboarding · Yuki Tanaka" subtitle="Engineer · starts Monday 17 November" max={880}>
        <O.Card><O.ProgressBar label={`${done.length} of ${total} done`} value={(done.length / total) * 100} thick /></O.Card>
        <O.CollapsibleGroup
          single={false}
          defaultOpen={['before', 'week1']}
          items={groups.map((g) => ({
            id: g.id,
            title: <O.HStack gap={2}>{g.title}<O.Badge>{g.items.filter(([id]) => done.includes(id)).length}/{g.items.length}</O.Badge></O.HStack>,
            content: (
              <O.VStack gap={3}>
                {g.items.map(([id, l]) => (
                  <O.Checkbox key={id} label={l} checked={done.includes(id)} onChange={(v) => setDone((d) => (v ? [...d, id] : d.filter((x) => x !== id)))} />
                ))}
              </O.VStack>
            ),
          }))}
        />
      </Page>
    </Screen>
  );
}

// ───────── Payroll run
export function HrPayrollScreen() {
  const toast = O.useToast();
  const [step, setStep] = useState(1);
  const rows = employees.slice(0, 8).map((e, i) => ({ ...e, gross: 4200 + i * 380, tax: 0 }));
  const total = rows.reduce((a, r) => a + r.gross, 0);
  return (
    <Screen product={crew} active="payroll" topbar={<O.Text weight="medium">Payroll</O.Text>}>
      <Page title="November payroll" subtitle="Pay date 28 November · 15 people" max={1080}>
        <O.Card><O.Stepper current={step} onStepClick={setStep} steps={[{ label: 'Hours' }, { label: 'Review' }, { label: 'Approve' }, { label: 'Paid' }]} /></O.Card>
        <O.KpiStrip items={[{ label: 'Gross pay', value: money(total), delta: 2, viz: <O.SparkBars values={rows.map((r) => r.gross)} />, note: '8 people shown' }, { label: 'Employer tax', value: money(total * 0.23), viz: <O.QuotaBar value={23} max={40} />, note: '23% of gross' }, { label: 'Net pay', value: money(total * 0.71), delta: 2, viz: <O.WaffleGrid filled={71} total={100} />, note: 'After deductions' }, { label: 'Cut-off', value: '3 days', viz: <O.RangeMarker min={0} max={10} value={3} unit="d" />, note: 'Approve by 25 Nov' }]} />
        <O.Card padding="none">
          <O.Table label="Payroll" rows={rows} rowKey={(r) => r.id} columns={[{ key: 'n', header: 'Person', render: (r) => <O.HStack gap={2}><O.Avatar name={r.name} size="sm" />{r.name}</O.HStack> }, { key: 't', header: 'Team', hideBelow: 'sm', render: (r) => r.team }, { key: 'g', header: 'Gross', align: 'right', render: (r) => money(r.gross) }, { key: 'n2', header: 'Net', align: 'right', render: (r) => money(r.gross * 0.71) }]} />
        </O.Card>
        <O.HStack justify="end"><O.Button variant="primary" onClick={() => (setStep(3), toast({ title: 'Payroll approved', description: 'Payments go out on 28 November.', tone: 'success' }))}>Approve payroll</O.Button></O.HStack>
      </Page>
    </Screen>
  );
}

// ───────── Performance reviews
export function HrReviewsScreen() {
  const [cycle, setCycle] = useState('h2');
  return (
    <Screen product={crew} active="reviews" topbar={<O.Text weight="medium">Reviews</O.Text>}>
      <Page title="Performance reviews" actions={<O.Select size="sm" width="auto" label="Cycle" value={cycle} onChange={setCycle} options={[{ value: 'h2', label: 'H2 2026' }, { value: 'h1', label: 'H1 2026' }]} />}>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)" stretch>
          {[['Self reviews', 12, 15], ['Peer reviews', 31, 45], ['Manager reviews', 4, 15]].map(([l, d, t]) => (
            <O.Well key={l as string} title={l as string} fill>
              <O.Card grow><O.VStack gap={2} align="center"><O.RingScore value={Math.round(((d as number) / (t as number)) * 100)} size={104} caption={`${d} of ${t}`} /></O.VStack></O.Card>
            </O.Well>
          ))}
        </Cols>
        <O.Card padding="none">
          <O.Table label="Reviews" rows={employees.slice(0, 8)} rowKey={(e) => e.id} columns={[
            { key: 'n', header: 'Person', render: (e) => <O.HStack gap={2}><O.Avatar name={e.name} size="sm" />{e.name}</O.HStack> },
            { key: 's', header: 'Self', render: (e) => <O.StatusChip size="sm" tone={e.name.length % 2 ? 'success' : 'warning'}>{e.name.length % 2 ? 'Done' : 'Due Nov 21'}</O.StatusChip> },
            { key: 'p', header: 'Peers', hideBelow: 'sm', render: (e) => `${e.name.length % 4}/3` },
            { key: 'm', header: 'Manager', hideBelow: 'md', render: (e) => <O.StatusChip size="sm" tone="neutral">Not started</O.StatusChip> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Policies: handbook with outline
export function HrPoliciesScreen() {
  const items = [
    { id: 'pol-leave', label: 'Time off' },
    { id: 'pol-remote', label: 'Remote work' },
    { id: 'pol-equip', label: 'Equipment', depth: 2 as const },
    { id: 'pol-expenses', label: 'Expenses' },
    { id: 'pol-conduct', label: 'Code of conduct' },
  ];
  const body: Record<string, string> = {
    'pol-leave': '## Time off\nEveryone gets **25 days** of paid vacation plus public holidays in their country. Request time off in Crew at least two weeks ahead for anything over three days.',
    'pol-remote': '## Remote work\nYou can work from anywhere in your country of employment. Working abroad for more than **30 days** a year needs approval from People.',
    'pol-equip': '### Equipment\nNew joiners choose a laptop and get a €600 home-office budget, renewed every three years.',
    'pol-expenses': '## Expenses\nSubmit receipts in Ledger within 30 days. Meals while travelling are covered up to €45 a day.',
    'pol-conduct': '## Code of conduct\nBe kind, assume good intent, and speak up. Report concerns to People or anonymously through the form.',
  };
  return (
    <Screen product={crew} active="policies" topbar={<O.Text weight="medium">Policies</O.Text>}>
      <Page title="Handbook" subtitle="Last updated 3 November 2026" max={1040}>
        <Cols template="minmax(0, 1fr) 200px">
          <O.Card>
            <O.VStack gap={8}>
              {items.map((i) => (
                <section key={i.id} id={i.id} style={{ scrollMarginTop: 80 }}>
                  <O.Markdown source={body[i.id]} />
                </section>
              ))}
            </O.VStack>
          </O.Card>
          <div style={{ position: 'sticky', top: 80 }}><O.Outline items={items} /></div>
        </Cols>
      </Page>
    </Screen>
  );
}
