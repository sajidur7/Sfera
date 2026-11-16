import { useMemo, useState } from 'react';
import { Archive, Bell, BellOff, Building2, Calendar, Download, Ellipsis, Globe, Mail, MapPin, Phone, Plus, StickyNote, Trash2, UserPlus, Users, X } from 'lucide-react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  DropdownMenu,
  EmptyState,
  HStack,
  IconButton,
  Link,
  MetadataList,
  Pagination,
  SearchInput,
  SegmentedControl,
  Select,
  StatGroup,
  StatusChip,
  StatusSelect,
  Table,
  Tabs,
  Text,
  TextArea,
  ToggleButton,
  VStack,
  Well,
  useToast,
  type Column,
  type StatusOption,
} from '../sfera';
import { Screen, useScreenNav } from './kit';
import { relay } from './products';
import * as stylex from '@stylexjs/stylex';
import { colors, font } from '../sfera/tokens.stylex';

export const stages: StatusOption[] = [
  { value: 'lead', label: 'Lead', tone: 'neutral' },
  { value: 'qualified', label: 'Qualified', tone: 'info' },
  { value: 'negotiation', label: 'Negotiation', tone: 'warning' },
  { value: 'won', label: 'Won', tone: 'success' },
  { value: 'lost', label: 'Lost', tone: 'danger' },
];

export type Company = { id: string; name: string; domain: string; stage: string; owner: string; arr: number; employees: number; last: string; city: string; industry: string };
export const companies: Company[] = [
  { id: 'linear', name: 'Linear', domain: 'linear.app', stage: 'negotiation', owner: 'Mira Chen', arr: 84000, employees: 120, last: '2h ago', city: 'San Francisco', industry: 'Software' },
  { id: 'loom', name: 'Loomwork', domain: 'loomwork.io', stage: 'qualified', owner: 'Theo Park', arr: 36000, employees: 48, last: 'Yesterday', city: 'Berlin', industry: 'Media' },
  { id: 'fjord', name: 'Fjord Freight', domain: 'fjordfreight.no', stage: 'won', owner: 'Ana Ruiz', arr: 152000, employees: 640, last: '3 days ago', city: 'Oslo', industry: 'Logistics' },
  { id: 'cobalt', name: 'Cobalt Health', domain: 'cobalt.health', stage: 'lead', owner: 'Mira Chen', arr: 0, employees: 210, last: '1 week ago', city: 'Boston', industry: 'Healthcare' },
  { id: 'nimbus', name: 'Nimbus Labs', domain: 'nimbuslabs.ai', stage: 'negotiation', owner: 'Jonas Weber', arr: 61000, employees: 85, last: '5h ago', city: 'London', industry: 'AI' },
  { id: 'tandem', name: 'Tandem Bank', domain: 'tandem.bank', stage: 'lost', owner: 'Theo Park', arr: 0, employees: 1900, last: '2 weeks ago', city: 'Amsterdam', industry: 'Finance' },
  { id: 'paper', name: 'Paperhill', domain: 'paperhill.co', stage: 'qualified', owner: 'Ana Ruiz', arr: 22000, employees: 32, last: 'Today', city: 'Lisbon', industry: 'Retail' },
  { id: 'arc', name: 'Arcadia Studio', domain: 'arcadia.studio', stage: 'won', owner: 'Jonas Weber', arr: 48000, employees: 24, last: '4 days ago', city: 'Copenhagen', industry: 'Design' },
  { id: 'helio', name: 'Helio Energy', domain: 'helio.energy', stage: 'lead', owner: 'Lea Moss', arr: 0, employees: 370, last: '6 days ago', city: 'Madrid', industry: 'Energy' },
];
const money = (n: number) => (n ? '$' + n.toLocaleString('en-US') : '—');

const s = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1280, marginInline: 'auto' },
  head: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  title: { margin: 0, fontSize: { default: 28, '@media (max-width: 640px)': 22 }, fontWeight: 500, letterSpacing: '-0.03em', color: colors.text },
  filters: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  search: { width: { default: 260, '@media (max-width: 640px)': '100%' } },
  selbar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 8px 8px 14px', borderRadius: 12, backgroundColor: colors.text, color: colors.page },
  co: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  coText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  coName: { fontWeight: 500, color: colors.text },
  coDomain: { fontSize: font.xs, color: colors.textMuted },
  foot: { padding: '10px 12px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border },
});

// ───────── Companies (records table)
export function CompaniesScreen() {
  const { open } = useScreenNav();
  const toast = useToast();
  const [rows, setRows] = useState(companies);
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState('all');
  const [view, setView] = useState('all');
  const [sel, setSel] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (r.name + r.domain).toLowerCase().includes(q.toLowerCase()) &&
          (owner === 'all' || r.owner === owner) &&
          (view === 'all' || (view === 'mine' && r.owner === 'Mira Chen') || (view === 'hot' && (r.stage === 'negotiation' || r.stage === 'qualified'))),
      ),
    [rows, q, owner, view],
  );
  const cols: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company',
      sortValue: (r) => r.name,
      render: (r) => (
        <span {...stylex.props(s.co)}>
          <Avatar name={r.name} size="sm" square />
          <span {...stylex.props(s.coText)}>
            <span {...stylex.props(s.coName)}>{r.name}</span>
            <span {...stylex.props(s.coDomain)}>{r.domain}</span>
          </span>
        </span>
      ),
    },
    { key: 'stage', header: 'Stage', render: (r) => <StatusSelect label="Stage" options={stages} value={r.stage} onChange={(v) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, stage: v } : x)))} /> },
    { key: 'owner', header: 'Owner', hideBelow: 'sm', sortValue: (r) => r.owner, render: (r) => <HStack gap={2}><Avatar name={r.owner} size="xs" /><span>{r.owner}</span></HStack> },
    { key: 'arr', header: 'ARR', align: 'right', sortValue: (r) => r.arr, render: (r) => money(r.arr) },
    { key: 'emp', header: 'Employees', align: 'right', hideBelow: 'md', sortValue: (r) => r.employees, render: (r) => r.employees.toLocaleString('en-US') },
    { key: 'last', header: 'Last activity', hideBelow: 'md', render: (r) => <Text as="span" size="sm" tone="muted">{r.last}</Text> },
  ];
  return (
    <Screen
      product={relay}
      active="companies"
      topbar={<Breadcrumbs items={[{ id: 'records', label: 'Records' }, { id: 'companies', label: 'Companies' }]} onNavigate={() => toast({ title: 'Records home is coming soon' })} />}
    >
      <div {...stylex.props(s.stack)}>
        <div {...stylex.props(s.head)}>
          <VStack gap={1}>
            <h1 {...stylex.props(s.title)}>Companies</h1>
            <Text size="sm" tone="muted">{rows.length.toLocaleString('en-US')} of 1,204 records · synced 2 minutes ago</Text>
          </VStack>
          <HStack gap={2}>
            <Button iconStart={<Download size={15} />} onClick={() => toast({ title: 'Export started', description: 'We will email the CSV to you.', tone: 'success' })}>
              Export
            </Button>
            <Button
              variant="primary"
              iconStart={<Plus size={15} />}
              onClick={() => {
                const n: Company = { id: 'new' + Date.now(), name: 'Untitled company', domain: 'example.com', stage: 'lead', owner: 'Mira Chen', arr: 0, employees: 1, last: 'Just now', city: '—', industry: '—' };
                setRows((r) => [n, ...r]);
                toast({ title: 'Company added', tone: 'success' });
              }}
            >
              New company
            </Button>
          </HStack>
        </div>
        <div {...stylex.props(s.filters)}>
          <SegmentedControl label="Saved views" value={view} onChange={setView} options={[{ value: 'all', label: 'All companies' }, { value: 'mine', label: 'My companies' }, { value: 'hot', label: 'In play' }]} />
          <span style={{ flex: 1 }} />
          <div {...stylex.props(s.search)}>
            <SearchInput value={q} onValueChange={setQ} placeholder="Search companies" size="sm" />
          </div>
          <Select size="sm" width="auto" label="Owner" value={owner} onChange={setOwner} options={[{ value: 'all', label: 'Any owner' }, ...['Mira Chen', 'Theo Park', 'Ana Ruiz', 'Jonas Weber', 'Lea Moss'].map((n) => ({ value: n, label: n }))]} />
        </div>
        {sel.length > 0 && (
          <div {...stylex.props(s.selbar)} role="toolbar" aria-label="Selection">
            <span style={{ fontSize: 13, fontWeight: 500 }}>{sel.length} selected</span>
            <span style={{ flex: 1 }} />
            <Button size="sm" variant="soft" iconStart={<UserPlus size={14} />} onClick={() => toast({ title: `Assigned ${sel.length} companies to you`, tone: 'success' })}>
              Assign to me
            </Button>
            <Button
              size="sm"
              variant="soft"
              iconStart={<Archive size={14} />}
              onClick={() => {
                const gone = rows.filter((r) => sel.includes(r.id));
                setRows((r) => r.filter((x) => !sel.includes(x.id)));
                setSel([]);
                toast({ title: `${gone.length} archived`, action: { label: 'Undo', onClick: () => setRows((r) => [...gone, ...r]) } });
              }}
            >
              Archive
            </Button>
            <IconButton size="sm" variant="soft" label="Clear selection" icon={<X size={14} />} onClick={() => setSel([])} />
          </div>
        )}
        <Card padding="none">
          {shown.length ? (
            <Table label="Companies" columns={cols} rows={shown} rowKey={(r) => r.id} selectable selected={sel} onSelectedChange={setSel} onRowClick={(r) => open('crm-company', { id: r.id })} />
          ) : (
            <div style={{ padding: 16 }}>
              <EmptyState icon={<Building2 size={18} />} title="No companies match" description="Try another search or clear the owner filter." actions={<Button size="sm" onClick={() => (setQ(''), setOwner('all'), setView('all'))}>Clear filters</Button>} />
            </div>
          )}
          <div {...stylex.props(s.foot)}>
            <Pagination page={page} total={134} onChange={setPage} />
          </div>
        </Card>
      </div>
    </Screen>
  );
}

// ───────── Company record
const r = stylex.create({
  layout: { display: 'grid', gridTemplateColumns: { default: 'minmax(0, 1fr) 340px', '@media (max-width: 1100px)': 'minmax(0, 1fr)' }, gap: 16, maxWidth: 1280, marginInline: 'auto', alignItems: 'start' },
  hero: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 },
  heroText: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flexGrow: 1 },
  name: { margin: 0, fontSize: { default: 30, '@media (max-width: 640px)': 24 }, fontWeight: 500, letterSpacing: '-0.03em', color: colors.text },
  timeline: { display: 'flex', flexDirection: 'column', margin: 0, padding: 0, listStyle: 'none' },
  item: { display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr) auto', gap: 12, paddingBlock: 12, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border, alignItems: 'start' },
  last: { borderBottomWidth: 0 },
  icon: { width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.well, color: colors.textMuted },
  time: { fontSize: font.xs, color: colors.textSubtle, whiteSpace: 'nowrap' },
  side: { display: 'flex', flexDirection: 'column', gap: 12 },
  person: { display: 'flex', alignItems: 'center', gap: 10, paddingBlock: 8, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
});
type Act = { id: number; icon: typeof Mail; who: string; what: string; detail?: string; when: string };
export function CompanyScreen() {
  const { params, open } = useScreenNav();
  const toast = useToast();
  const c = companies.find((x) => x.id === params.id) ?? companies[0];
  const [stage, setStage] = useState(c.stage);
  const [follow, setFollow] = useState(false);
  const [note, setNote] = useState('');
  const [acts, setActs] = useState<Act[]>([
    { id: 1, icon: Mail, who: 'Mira Chen', what: 'emailed Karri Saarinen', detail: 'Re: pricing for 140 seats — sending the updated order form.', when: '2h ago' },
    { id: 2, icon: Calendar, who: 'Theo Park', what: 'logged a meeting', detail: 'Security review with IT. SSO and audit log confirmed.', when: 'Yesterday' },
    { id: 3, icon: Phone, who: 'Mira Chen', what: 'called Tuomas', detail: '12 min · Next step: legal redlines.', when: '3 days ago' },
    { id: 4, icon: Building2, who: 'System', what: 'moved stage to Negotiation', when: '1 week ago' },
  ]);
  return (
    <Screen
      product={relay}
      active="companies"
      topbar={<Breadcrumbs items={[{ id: 'companies', label: 'Companies' }, { id: c.id, label: c.name }]} onNavigate={() => open('crm-companies')} />}
    >
      <div {...stylex.props(r.layout)}>
        <div>
          <div {...stylex.props(r.hero)}>
            <Avatar name={c.name} size="xl" square />
            <div {...stylex.props(r.heroText)}>
              <h1 {...stylex.props(r.name)}>{c.name}</h1>
              <HStack gap={2} wrap>
                <Link href={`#screens-crm-company`} onClick={(e) => e.preventDefault()} external>
                  {c.domain}
                </Link>
                <StatusChip tone="neutral" size="sm">{c.industry}</StatusChip>
                <StatusChip tone={stages.find((x) => x.value === stage)!.tone} size="sm">{stages.find((x) => x.value === stage)!.label}</StatusChip>
              </HStack>
            </div>
            <HStack gap={2}>
              <ToggleButton pressed={follow} onPressedChange={(v) => (setFollow(v), toast({ title: v ? `Following ${c.name}` : 'Unfollowed' }))} iconStart={follow ? <Bell size={15} /> : <BellOff size={15} />}>
                {follow ? 'Following' : 'Follow'}
              </ToggleButton>
              <Button variant="primary" iconStart={<Mail size={15} />} onClick={() => toast({ title: 'Composer is coming soon' })}>
                Email
              </Button>
              <DropdownMenu
                label="Record actions"
                placement="bottom-end"
                trigger={<IconButton label="More actions" variant="secondary" icon={<Ellipsis size={16} />} />}
                items={[
                  { label: 'Add person', icon: <UserPlus size={15} />, onSelect: () => toast({ title: 'Add person is coming soon' }) },
                  { label: 'Archive', icon: <Archive size={15} />, onSelect: () => toast({ title: `${c.name} archived`, action: { label: 'Undo', onClick: () => {} } }) },
                  { type: 'divider' },
                  { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onSelect: () => toast({ title: 'Deleting needs admin rights', tone: 'danger' }) },
                ]}
              />
            </HStack>
          </div>
          <VStack gap={4}>
            <StatGroup
              stats={[
                { label: 'ARR', value: money(c.arr), delta: c.arr ? 18 : undefined },
                { label: 'Open deals', value: 2 },
                { label: 'People', value: 7 },
                { label: 'Last contact', value: c.last },
              ]}
            />
            <Tabs
              label="Record sections"
              tabs={[
                { id: 'activity', label: 'Activity', count: acts.length },
                { id: 'emails', label: 'Emails', count: 6 },
                { id: 'notes', label: 'Notes', count: acts.filter((a) => a.icon === StickyNote).length },
              ]}
            >
              {(t) =>
                t === 'activity' ? (
                  <VStack gap={3}>
                    <Card padding="sm">
                      <VStack gap={2}>
                        <TextArea aria-label="New note" rows={2} placeholder={`Add a note about ${c.name}…`} value={note} onChange={(e) => setNote(e.target.value)} />
                        <HStack justify="between">
                          <Text size="xs" tone="subtle">Visible to your workspace</Text>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={!note.trim()}
                            onClick={() => {
                              setActs((a) => [{ id: Date.now(), icon: StickyNote, who: 'Mira Chen', what: 'added a note', detail: note.trim(), when: 'Just now' }, ...a]);
                              setNote('');
                            }}
                          >
                            Add note
                          </Button>
                        </HStack>
                      </VStack>
                    </Card>
                    <ul {...stylex.props(r.timeline)}>
                      {acts.map((a, i) => (
                        <li key={a.id} {...stylex.props(r.item, i === acts.length - 1 && r.last)}>
                          <span {...stylex.props(r.icon)}>
                            <a.icon size={15} />
                          </span>
                          <VStack gap={1}>
                            <Text size="sm">
                              <strong style={{ fontWeight: 500 }}>{a.who}</strong> {a.what}
                            </Text>
                            {a.detail && <Text size="sm" tone="muted">{a.detail}</Text>}
                          </VStack>
                          <span {...stylex.props(r.time)}>{a.when}</span>
                        </li>
                      ))}
                    </ul>
                  </VStack>
                ) : t === 'emails' ? (
                  <EmptyState icon={<Mail size={18} />} title="Connect your inbox to see emails" description="Relay syncs threads with anyone at this company." actions={<Button size="sm" variant="primary" onClick={() => toast({ title: 'Mail sync is coming soon' })}>Connect Gmail</Button>} />
                ) : (
                  <EmptyState icon={<StickyNote size={18} />} title={acts.some((a) => a.icon === StickyNote) ? 'Notes appear in Activity' : 'No notes yet'} description="Add one from the Activity tab." />
                )
              }
            </Tabs>
          </VStack>
        </div>
        <aside {...stylex.props(r.side)}>
          <Well title="Details" subtitle="Synced from Clearbit">
            <Card padding="sm">
              <MetadataList
                items={[
                  { label: 'Stage', value: <StatusSelect label="Stage" options={stages} value={stage} onChange={(v) => (setStage(v), toast({ title: `Stage set to ${stages.find((x) => x.value === v)!.label}` }))} /> },
                  { label: 'Owner', icon: undefined, value: <HStack gap={2}><Avatar name={c.owner} size="xs" />{c.owner}</HStack> },
                  { label: 'Domain', icon: <Globe size={14} />, value: c.domain },
                  { label: 'Location', icon: <MapPin size={14} />, value: c.city },
                  { label: 'Employees', icon: <Users size={14} />, value: c.employees.toLocaleString('en-US') },
                ]}
              />
            </Card>
          </Well>
          <Well title="People" subtitle="7 contacts" actions={<IconButton size="sm" label="Add person" icon={<Plus size={15} />} onClick={() => toast({ title: 'Add person is coming soon' })} />}>
            <Card padding="sm">
              {['Karri Saarinen', 'Tuomas Artman', 'Nan Yu'].map((p, i) => (
                <div key={p} {...stylex.props(r.person)} style={i === 2 ? { borderBottom: 0 } : undefined}>
                  <Avatar name={p} size="sm" />
                  <VStack gap={0} grow>
                    <Text size="sm" weight="medium">{p}</Text>
                    <Text size="xs" tone="muted">{['CEO', 'CTO', 'Head of Product'][i]}</Text>
                  </VStack>
                  {i === 0 && <Badge tone="accent">Champion</Badge>}
                </div>
              ))}
              <HStack justify="between">
                <AvatarGroup names={['Karri Saarinen', 'Tuomas Artman', 'Nan Yu', 'Cristina Cordova', 'Andreas Eldh', 'Julian Lee', 'Sabin Roman']} size="xs" max={4} />
                <Button size="sm" variant="ghost" onClick={() => toast({ title: 'People list is coming soon' })}>View all</Button>
              </HStack>
            </Card>
          </Well>
          <Well title="Deals">
            <Card padding="sm">
              <CardHeader title="Enterprise rollout" subtitle="$84,000 · closes 30 Nov" actions={<StatusChip tone="warning" size="sm">Negotiation</StatusChip>} />
              <CardHeader title="Design add-on" subtitle="$12,000 · closes 15 Dec" actions={<StatusChip tone="info" size="sm">Qualified</StatusChip>} />
            </Card>
          </Well>
        </aside>
      </div>
    </Screen>
  );
}
