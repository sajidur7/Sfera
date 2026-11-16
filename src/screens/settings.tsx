import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Bell, Building2, CreditCard, KeyRound, Plug, Shield, Trash2, User, UserPlus, Users } from 'lucide-react';
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Dialog,
  EmptyState,
  Field,
  Grid,
  HStack,
  ProgressBar,
  RadioGroup,
  Select,
  SideNav,
  SideNavItem,
  SideNavSection,
  StatusChip,
  Switch,
  Table,
  Text,
  TextInput,
  VStack,
  Well,
  useToast,
  Icon,
  DropdownMenu,
  IconButton,
} from '../sfera';
import { Ellipsis } from 'lucide-react';
import { colors, font } from '../sfera/tokens.stylex';
import { Screen } from './kit';
import { system } from './products';

const s = stylex.create({
  layout: { display: 'grid', gridTemplateColumns: { default: '220px minmax(0, 1fr)', '@media (max-width: 860px)': 'minmax(0, 1fr)' }, gap: { default: 32, '@media (max-width: 860px)': 16 }, maxWidth: 1080, marginInline: 'auto' },
  menu: { position: { default: 'sticky', '@media (max-width: 860px)': 'static' }, top: 76, alignSelf: 'start', display: { default: 'block', '@media (max-width: 860px)': 'none' } },
  mobileMenu: { display: { default: 'none', '@media (max-width: 860px)': 'block' } },
  title: { margin: 0, fontSize: { default: 26, '@media (max-width: 640px)': 22 }, fontWeight: 500, letterSpacing: '-0.03em', color: colors.text },
  section: { display: 'flex', flexDirection: 'column', gap: 16 },
  rowSetting: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBlock: 12, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  rowLast: { borderBottomWidth: 0 },
  danger: { borderColor: `color-mix(in oklab, ${colors.danger} 35%, ${colors.border})` },
  mono: { fontFamily: font.mono, fontSize: 12 },
});

type Pane = 'profile' | 'notifications' | 'security' | 'general' | 'members' | 'billing' | 'integrations';
const menu: { title: string; items: { id: Pane; label: string; icon: typeof User }[] }[] = [
  { title: 'Account', items: [{ id: 'profile', label: 'Profile', icon: User }, { id: 'notifications', label: 'Notifications', icon: Bell }, { id: 'security', label: 'Security', icon: Shield }] },
  { title: 'Workspace', items: [{ id: 'general', label: 'General', icon: Building2 }, { id: 'members', label: 'Members', icon: Users }, { id: 'billing', label: 'Billing', icon: CreditCard }, { id: 'integrations', label: 'Integrations', icon: Plug }] },
];

function SettingRow({ title, desc, children, last }: { title: string; desc: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div {...stylex.props(s.rowSetting, last && s.rowLast)}>
      <VStack gap={0}>
        <Text size="sm" weight="medium">{title}</Text>
        <Text size="sm" tone="muted">{desc}</Text>
      </VStack>
      {children}
    </div>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <VStack gap={1}>
      <h1 {...stylex.props(s.title)}>{title}</h1>
      <Text size="sm" tone="muted">{sub}</Text>
    </VStack>
  );
}

function Profile() {
  const toast = useToast();
  const [name, setName] = useState('Mira Chen');
  const [dirty, setDirty] = useState(false);
  return (
    <div {...stylex.props(s.section)}>
      <Header title="Profile" sub="How you appear to people in this workspace." />
      <Well>
        <Card>
          <VStack gap={5}>
            <HStack gap={4} wrap>
              <Avatar name={name || '?'} size="xl" />
              <VStack gap={1}>
                <HStack gap={2}>
                  <Button size="sm" onClick={() => toast({ title: 'Photo upload is coming soon' })}>Upload photo</Button>
                  <Button size="sm" variant="ghost">Remove</Button>
                </HStack>
                <Text size="xs" tone="muted">PNG or JPG, at least 256 × 256.</Text>
              </VStack>
            </HStack>
            <Grid min={220} gap={4}>
              <Field label="Full name">
                <TextInput autoComplete="name" value={name} onChange={(e) => (setName(e.target.value), setDirty(true))} />
              </Field>
              <Field label="Email" help="Used to sign in. Changing it needs verification.">
                <TextInput type="email" autoComplete="email" defaultValue="mira@northwind.com" onChange={() => setDirty(true)} />
              </Field>
              <Field label="Role">
                <Select defaultValue="design" onChange={() => setDirty(true)} options={[{ value: 'design', label: 'Design lead' }, { value: 'eng', label: 'Engineer' }, { value: 'sales', label: 'Account executive' }]} />
              </Field>
              <Field label="Time zone">
                <Select defaultValue="lis" onChange={() => setDirty(true)} options={[{ value: 'lis', label: 'Lisbon (UTC+0)' }, { value: 'ber', label: 'Berlin (UTC+1)' }, { value: 'nyc', label: 'New York (UTC−5)' }]} />
              </Field>
            </Grid>
          </VStack>
        </Card>
        <HStack justify="end" gap={2}>
          <Button variant="ghost" disabled={!dirty} onClick={() => (setName('Mira Chen'), setDirty(false))}>Discard</Button>
          <Button variant="primary" disabled={!dirty} onClick={() => (setDirty(false), toast({ title: 'Profile saved', tone: 'success' }))}>Save changes</Button>
        </HStack>
      </Well>
    </div>
  );
}

function Notifications() {
  const [email, setEmail] = useState({ mentions: true, assigned: true, digest: false, product: false });
  const [push, setPush] = useState('mentions');
  return (
    <div {...stylex.props(s.section)}>
      <Header title="Notifications" sub="Choose what reaches you and where." />
      <Well title="Email">
        <Card padding="sm">
          <SettingRow title="Mentions" desc="Someone @mentions you in a note or reply.">
            <Switch aria-label="Mentions" checked={email.mentions} onChange={(v) => setEmail({ ...email, mentions: v })} />
          </SettingRow>
          <SettingRow title="Assigned to you" desc="A record or ticket is assigned to you.">
            <Switch aria-label="Assigned to you" checked={email.assigned} onChange={(v) => setEmail({ ...email, assigned: v })} />
          </SettingRow>
          <SettingRow title="Weekly digest" desc="Monday summary of your pipeline.">
            <Switch aria-label="Weekly digest" checked={email.digest} onChange={(v) => setEmail({ ...email, digest: v })} />
          </SettingRow>
          <SettingRow title="Product updates" desc="New features, once a month." last>
            <Switch aria-label="Product updates" checked={email.product} onChange={(v) => setEmail({ ...email, product: v })} />
          </SettingRow>
        </Card>
      </Well>
      <Well title="Push" subtitle="On your phone and desktop app">
        <Card>
          <RadioGroup
            value={push}
            onChange={setPush}
            options={[
              { value: 'all', label: 'Everything', description: 'Every update in records you follow' },
              { value: 'mentions', label: 'Mentions and assignments', description: 'Recommended' },
              { value: 'none', label: 'Nothing', description: 'Email only' },
            ]}
          />
        </Card>
      </Well>
    </div>
  );
}

function Security() {
  const toast = useToast();
  const [twofa, setTwofa] = useState(true);
  return (
    <div {...stylex.props(s.section)}>
      <Header title="Security" sub="Sign-in methods and active sessions." />
      <Well>
        <Card padding="sm">
          <SettingRow title="Two-factor authentication" desc={twofa ? 'On · authenticator app' : 'Off — we recommend turning it on'}>
            <Switch aria-label="Two-factor authentication" checked={twofa} onChange={(v) => (setTwofa(v), toast({ title: v ? '2FA turned on' : '2FA turned off', tone: v ? 'success' : 'danger' }))} />
          </SettingRow>
          <SettingRow title="Password" desc="Last changed 3 months ago" last>
            <Button size="sm" iconStart={<KeyRound size={14} />} onClick={() => toast({ title: 'Password reset email sent', tone: 'success' })}>Change</Button>
          </SettingRow>
        </Card>
      </Well>
      <Well title="Sessions">
        <Card padding="none">
          <Table
            label="Sessions"
            rowKey={(r) => r[0]}
            rows={[['MacBook Pro · Safari', 'Lisbon', 'Now'], ['iPhone 17 · App', 'Lisbon', '2h ago'], ['Windows · Chrome', 'Porto', '6 days ago']]}
            columns={[
              { key: 'd', header: 'Device', render: (r) => <HStack gap={2}><Text as="span" size="sm" weight="medium">{r[0]}</Text>{r[2] === 'Now' && <StatusChip size="sm" tone="success">This device</StatusChip>}</HStack> },
              { key: 'l', header: 'Location', hideBelow: 'sm', render: (r) => r[1] },
              { key: 't', header: 'Last active', align: 'right', render: (r) => r[2] },
            ]}
          />
        </Card>
      </Well>
    </div>
  );
}

function General() {
  const toast = useToast();
  const [del, setDel] = useState(false);
  return (
    <div {...stylex.props(s.section)}>
      <Header title="General" sub="Workspace name, URL and data region." />
      <Well>
        <Card>
          <Grid min={240} gap={4}>
            <Field label="Workspace name">
              <TextInput defaultValue="Northwind" />
            </Field>
            <Field label="Workspace URL" help="Changing it breaks old links.">
              <TextInput defaultValue="northwind" end={<span {...stylex.props(s.mono)}>.sfera.app</span>} />
            </Field>
            <Field label="Data region">
              <Select defaultValue="eu" options={[{ value: 'eu', label: 'Europe', description: 'Frankfurt' }, { value: 'us', label: 'United States', description: 'Virginia' }]} />
            </Field>
          </Grid>
        </Card>
        <HStack justify="end">
          <Button variant="primary" onClick={() => toast({ title: 'Workspace saved', tone: 'success' })}>Save</Button>
        </HStack>
      </Well>
      <Card>
        <CardHeader title="Delete workspace" subtitle="Removes all records, files and members. You have 30 days to undo." actions={<Button variant="danger" iconStart={<Trash2 size={15} />} onClick={() => setDel(true)}>Delete</Button>} />
      </Card>
      <AlertDialog open={del} onClose={() => setDel(false)} onConfirm={() => toast({ title: 'Workspace scheduled for deletion', tone: 'danger', action: { label: 'Undo', onClick: () => toast({ title: 'Deletion cancelled', tone: 'success' }) } })} destructive title="Delete Northwind?" description="All 1,204 records go with it. You can restore it for 30 days." confirmLabel="Delete workspace" />
    </div>
  );
}

function Members() {
  const toast = useToast();
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [rows, setRows] = useState([
    { id: '1', name: 'Mira Chen', email: 'mira@northwind.com', role: 'Owner' },
    { id: '2', name: 'Theo Park', email: 'theo@northwind.com', role: 'Admin' },
    { id: '3', name: 'Ana Ruiz', email: 'ana@northwind.com', role: 'Member' },
    { id: '4', name: 'Jonas Weber', email: 'jonas@northwind.com', role: 'Member' },
  ]);
  const valid = /^\S+@\S+\.\S+$/.test(email);
  return (
    <div {...stylex.props(s.section)}>
      <HStack justify="between" align="end" wrap>
        <Header title="Members" sub={`${rows.length} of 25 seats used.`} />
        <Button variant="primary" iconStart={<UserPlus size={15} />} onClick={() => setInvite(true)}>Invite</Button>
      </HStack>
      <Card padding="none">
        <Table
          label="Members"
          rowKey={(r) => r.id}
          rows={rows}
          columns={[
            { key: 'n', header: 'Name', sortValue: (r) => r.name, render: (r) => <HStack gap={2}><Avatar name={r.name} size="sm" /><VStack gap={0}><Text as="span" size="sm" weight="medium">{r.name}</Text><Text as="span" size="xs" tone="muted">{r.email}</Text></VStack></HStack> },
            { key: 'r', header: 'Role', render: (r) => <Badge tone={r.role === 'Owner' ? 'accent' : r.role === 'Admin' ? 'info' : 'neutral'}>{r.role}</Badge> },
            {
              key: 'a',
              header: '',
              align: 'right',
              render: (r) =>
                r.role === 'Owner' ? null : (
                  <DropdownMenu
                    placement="bottom-end"
                    label={`Actions for ${r.name}`}
                    trigger={<IconButton size="sm" label={`Actions for ${r.name}`} icon={<Ellipsis size={15} />} />}
                    items={[
                      { label: 'Make admin', onSelect: () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, role: 'Admin' } : x))) },
                      { label: 'Make member', onSelect: () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, role: 'Member' } : x))) },
                      { type: 'divider' },
                      { label: 'Remove', danger: true, onSelect: () => (setRows((rs) => rs.filter((x) => x.id !== r.id)), toast({ title: `${r.name} removed`, action: { label: 'Undo', onClick: () => setRows((rs) => [...rs, r]) } })) },
                    ]}
                  />
                ),
            },
          ]}
        />
      </Card>
      <Dialog
        open={invite}
        onClose={() => setInvite(false)}
        title="Invite to Northwind"
        description="They get an email with a link that expires in 7 days."
        footer={
          <>
            <Button onClick={() => setInvite(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!valid}
              onClick={() => {
                setRows((rs) => [...rs, { id: String(Date.now()), name: email.split('@')[0], email, role: role === 'admin' ? 'Admin' : 'Member' }]);
                setInvite(false);
                setEmail('');
                toast({ title: `Invite sent to ${email}`, tone: 'success' });
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <VStack gap={4}>
          <Field label="Email" error={email && !valid ? 'Enter a full email like name@company.com' : undefined}>
            <TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" data-autofocus />
          </Field>
          <RadioGroup label="Role" value={role} onChange={setRole} options={[{ value: 'member', label: 'Member', description: 'Can view and edit records' }, { value: 'admin', label: 'Admin', description: 'Also manages billing and members' }]} />
        </VStack>
      </Dialog>
    </div>
  );
}

function Billing() {
  const toast = useToast();
  const [annual, setAnnual] = useState(true);
  return (
    <div {...stylex.props(s.section)}>
      <Header title="Billing" sub="Plan, usage and invoices." />
      <Grid min={260} gap={3}>
        <Well title="Plan" fill>
          <Card grow>
            <CardHeader eyebrow="Team" value={annual ? '$480' : '$48'} unit={annual ? '/ seat / year' : '/ seat / month'} actions={<StatusChip tone="success">Active</StatusChip>} />
            <VStack gap={3}>
              <Switch size="sm" label="Annual billing (2 months free)" checked={annual} onChange={setAnnual} />
              <Button variant="primary" onClick={() => toast({ title: 'Plan change is coming soon' })}>Change plan</Button>
            </VStack>
          </Card>
        </Well>
        <Well title="Usage" subtitle="Resets 1 Dec" fill>
          <Card grow>
            <VStack gap={4}>
              <ProgressBar label="Seats" value={16} max={25} />
              <ProgressBar label="Records" value={84} tone="warning" />
              <ProgressBar label="Storage" value={31} />
            </VStack>
          </Card>
        </Well>
      </Grid>
      <Well title="Invoices">
        <Card padding="none">
          <Table
            label="Invoices"
            rowKey={(r) => r[0]}
            rows={[['INV-2026-11', 'Nov 1, 2026', '$768.00'], ['INV-2026-10', 'Oct 1, 2026', '$768.00'], ['INV-2026-09', 'Sep 1, 2026', '$720.00']]}
            columns={[
              { key: 'i', header: 'Invoice', render: (r) => <span {...stylex.props(s.mono)}>{r[0]}</span> },
              { key: 'd', header: 'Date', hideBelow: 'sm', render: (r) => r[1] },
              { key: 's', header: 'Status', render: () => <StatusChip size="sm" tone="success">Paid</StatusChip> },
              { key: 'a', header: 'Amount', align: 'right', render: (r) => r[2] },
            ]}
          />
        </Card>
      </Well>
    </div>
  );
}

function Integrations() {
  const toast = useToast();
  const [on, setOn] = useState<Record<string, boolean>>({ slack: true, github: false, calendar: true });
  const list: [string, string, string][] = [
    ['slack', 'Slack', 'Post record updates to a channel'],
    ['github', 'GitHub', 'Link issues to deals'],
    ['calendar', 'Google Calendar', 'Log meetings automatically'],
  ];
  return (
    <div {...stylex.props(s.section)}>
      <Header title="Integrations" sub="Connect the tools your team already uses." />
      <Grid min={240} gap={3}>
        {list.map(([id, n, d]) => (
          <Card key={id}>
            <VStack gap={3}>
              <HStack justify="between">
                <Avatar name={n} square size="md" />
                <Switch aria-label={`Connect ${n}`} checked={on[id]} onChange={(v) => (setOn({ ...on, [id]: v }), toast({ title: v ? `${n} connected` : `${n} disconnected`, tone: v ? 'success' : 'neutral' }))} />
              </HStack>
              <VStack gap={0}>
                <Text weight="medium">{n}</Text>
                <Text size="sm" tone="muted">{d}</Text>
              </VStack>
            </VStack>
          </Card>
        ))}
      </Grid>
      <EmptyState icon={<Plug size={18} />} title="Need another integration?" description="Webhooks and the REST API are on the roadmap." actions={<Checkbox label="Notify me when it ships" />} />
    </div>
  );
}

export function SettingsScreen() {
  const [pane, setPane] = useState<Pane>('profile');
  const panes: Record<Pane, React.ReactNode> = { profile: <Profile />, notifications: <Notifications />, security: <Security />, general: <General />, members: <Members />, billing: <Billing />, integrations: <Integrations /> };
  return (
    <Screen product={system} active="settings" topbar={<Text weight="medium">Settings</Text>}>
      <div {...stylex.props(s.layout)}>
        <div {...stylex.props(s.menu)}>
          <SideNav label="Settings">
            {menu.map((g) => (
              <SideNavSection key={g.title} title={g.title}>
                {g.items.map((it) => (
                  <SideNavItem key={it.id} soft item={{ id: it.id, label: it.label, icon: <Icon as={it.icon} /> }} active={pane} onSelect={(id) => setPane(id as Pane)} />
                ))}
              </SideNavSection>
            ))}
          </SideNav>
        </div>
        <div {...stylex.props(s.mobileMenu)}>
          <Select label="Settings section" value={pane} onChange={(v) => setPane(v as Pane)} options={menu.flatMap((g) => g.items.map((i) => ({ value: i.id, label: `${g.title} · ${i.label}`, icon: <Icon as={i.icon} size="sm" /> })))} />
        </div>
        <div key={pane}>{panes[pane]}</div>
      </div>
    </Screen>
  );
}
