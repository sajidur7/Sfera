import { useEffect, useMemo, useState } from 'react';
import { CircleAlert, CircleCheck, Copy, Eye, EyeOff, GitBranch, GitCommit, Globe, KeyRound, Pause, Play, Plus, RefreshCw, Rocket, RotateCcw, Server, Trash2, Webhook } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { forge } from './products';
import { Cols, Page, money } from './ui';

const depTone: Record<string, O.Tone> = { Ready: 'success', Building: 'info', Failed: 'danger', Canceled: 'neutral' };
const deployments = [
  { id: 'dpl_8f3c2a1', branch: 'main', msg: 'Fix toast focus order', who: 'Kofi Mensah', status: 'Ready', dur: '48s', env: 'Production', at: '4m' },
  { id: 'dpl_77ae10b', branch: 'billing-pdf', msg: 'Invoice PDF renderer', who: 'Sam Ito', status: 'Building', dur: '—', env: 'Preview', at: '1m' },
  { id: 'dpl_1d0e9f2', branch: 'main', msg: 'Bump vite to 8.3.8', who: 'Kofi Mensah', status: 'Failed', dur: '31s', env: 'Production', at: '2h' },
  { id: 'dpl_c41b3e8', branch: 'sso-okta', msg: 'SAML metadata endpoint', who: 'Theo Park', status: 'Ready', dur: '52s', env: 'Preview', at: '5h' },
  { id: 'dpl_90af5d3', branch: 'main', msg: 'Rate limit headers', who: 'Ana Ruiz', status: 'Canceled', dur: '12s', env: 'Production', at: 'Yesterday' },
];
const logLines = (fail: boolean): O.LogLine[] => [
  { t: '12:04:01.12', level: 'info', msg: 'Cloning github.com/forge/web (branch main, commit 8f3c2a1)' },
  { t: '12:04:03.40', level: 'debug', msg: 'Restored build cache (412 MB)' },
  { t: '12:04:05.91', level: 'info', msg: 'Running "npm ci"' },
  { t: '12:04:18.02', level: 'info', msg: 'added 412 packages in 12s' },
  { t: '12:04:18.40', level: 'info', msg: 'Running "npm run build"' },
  { t: '12:04:24.02', level: 'warn', msg: 'Chunk index.js is 812 kB after minification' },
  ...(fail ? [{ t: '12:04:25.10', level: 'error' as const, msg: "TypeError: Cannot read properties of undefined (reading 'map') at src/pages/billing.tsx:41" }, { t: '12:04:25.11', level: 'error' as const, msg: 'Build failed with exit code 1' }] : [{ t: '12:04:29.88', level: 'info' as const, msg: '✓ built in 11.5s' }, { t: '12:04:31.20', level: 'info' as const, msg: 'Deployed to forge-web.forge.run' }]),
];

// ───────── Projects grid
export function DevProjectsScreen() {
  const { open } = useScreenNav();
  const projects = [
    { n: 'forge-web', d: 'forge.run', fw: 'Vite', st: 'Ready', commit: 'Fix toast focus order', at: '4m', req: [4, 6, 5, 8, 9, 7, 10, 12] },
    { n: 'api', d: 'api.forge.run', fw: 'Node', st: 'Ready', commit: 'Rate limit headers', at: '1h', req: [9, 9, 10, 11, 9, 12, 13, 12] },
    { n: 'docs', d: 'docs.forge.run', fw: 'Vite', st: 'Failed', commit: 'Bump vite', at: '2h', req: [2, 3, 2, 3, 4, 3, 2, 3] },
    { n: 'status', d: 'status.forge.run', fw: 'Static', st: 'Ready', commit: 'Incident template', at: '3d', req: [1, 1, 2, 1, 6, 9, 3, 1] },
  ];
  return (
    <Screen product={forge} active="projects" topbar={<O.Text weight="medium">Projects</O.Text>}>
      <Page title="Projects" actions={<O.Button variant="primary" iconStart={<Plus />}>New project</O.Button>}>
        <O.Grid min={280} gap={3}>
          {projects.map((p) => (
            <O.Well key={p.n}>
              <O.Card onClick={() => open('dev-deployments')}>
                <O.VStack gap={3}>
                  <O.HStack gap={3}>
                    <O.Avatar name={p.n} square />
                    <O.VStack gap={0} grow><O.Text weight="medium">{p.n}</O.Text><O.Text size="xs" tone="muted">{p.d}</O.Text></O.VStack>
                    <O.StatusChip size="sm" variant="dot" tone={depTone[p.st]}>{p.st}</O.StatusChip>
                  </O.HStack>
                  <O.SparkBars values={p.req} />
                </O.VStack>
              </O.Card>
              <O.HStack gap={2}><GitCommit size={14} /><O.Text size="xs" tone="muted">{p.commit} · {p.at} · {p.fw}</O.Text></O.HStack>
            </O.Well>
          ))}
        </O.Grid>
      </Page>
    </Screen>
  );
}

// ───────── Deployments list
export function DevDeploymentsScreen() {
  const { open } = useScreenNav();
  const [env, setEnv] = useState('all');
  const rows = deployments.filter((d) => env === 'all' || d.env === env);
  return (
    <Screen product={forge} active="deployments" topbar={<O.Breadcrumbs items={[{ id: 'p', label: 'forge-web' }, { id: 'd', label: 'Deployments' }]} />}>
      <Page title="Deployments" actions={<O.SegmentedControl size="sm" value={env} onChange={setEnv} options={[{ value: 'all', label: 'All' }, { value: 'Production', label: 'Production' }, { value: 'Preview', label: 'Preview' }]} />}>
        <O.Card padding="none">
          <O.Table label="Deployments" rows={rows} rowKey={(d) => d.id} onRowClick={(d) => open('dev-deployment', { id: d.id })} columns={[
            { key: 's', header: 'Status', render: (d) => <O.StatusChip size="sm" variant="dot" tone={depTone[d.status]}>{d.status}</O.StatusChip> },
            { key: 'm', header: 'Commit', render: (d) => <O.VStack gap={0}><O.Text as="span" size="sm" weight="medium">{d.msg}</O.Text><O.Text as="span" size="xs" tone="muted" mono>{d.id}</O.Text></O.VStack> },
            { key: 'b', header: 'Branch', hideBelow: 'sm', render: (d) => <O.HStack gap={1}><GitBranch size={13} /><O.Text as="span" size="sm" mono>{d.branch}</O.Text></O.HStack> },
            { key: 'e', header: 'Env', hideBelow: 'md', render: (d) => <O.Badge variant={d.env === 'Production' ? 'solid' : 'outline'}>{d.env}</O.Badge> },
            { key: 'w', header: 'By', hideBelow: 'md', render: (d) => <O.Avatar name={d.who} size="xs" /> },
            { key: 'a', header: 'Age', align: 'right', render: (d) => <O.Text as="span" size="sm" tone="muted">{d.at}</O.Text> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Deployment detail with build log
export function DevDeploymentScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const d = deployments.find((x) => x.id === params.id) ?? deployments[2];
  const fail = d.status === 'Failed';
  return (
    <Screen product={forge} active="deployments" topbar={<O.Breadcrumbs items={[{ id: 'd', label: 'Deployments' }, { id: d.id, label: d.id }]} onNavigate={() => open('dev-deployments')} />}>
      <Page title={d.msg} subtitle={`${d.branch} · ${d.who} · ${d.at} ago`} actions={<><O.Button iconStart={<RotateCcw />} onClick={() => toast({ title: 'Redeploy queued' })}>Redeploy</O.Button>{!fail && <O.Button variant="primary" iconStart={<Rocket />} onClick={() => toast({ title: 'Promoted to production', tone: 'success' })}>Promote</O.Button>}</>}>
        {fail && <O.Banner tone="danger" title="Build failed in src/pages/billing.tsx:41">A value read before it was loaded. The previous deployment is still live.</O.Banner>}
        <O.StatGroup stats={[{ label: 'Status', value: <O.StatusChip tone={depTone[d.status]}>{d.status}</O.StatusChip> }, { label: 'Duration', value: d.dur }, { label: 'Environment', value: d.env }, { label: 'Region', value: 'fra1' }]} />
        <O.Well title="Build log">
          <O.LogViewer lines={logLines(fail)} maxHeight={320} label="Build log" />
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Live logs explorer
export function DevLogsScreen() {
  const [live, setLive] = useState(true);
  const [level, setLevel] = useState('all');
  const [lines, setLines] = useState<O.LogLine[]>(logLines(false));
  useEffect(() => {
    if (!live) return;
    const msgs: [O.LogLine['level'], string][] = [['info', 'GET /api/orders 200 · 41ms'], ['info', 'POST /api/checkout 201 · 212ms'], ['warn', 'GET /api/search 200 · 1,204ms (slow)'], ['error', 'GET /api/health 503 · upstream timeout'], ['debug', 'cache hit orders:list:42']];
    const t = setInterval(() => {
      const [lv, m] = msgs[Math.floor(Math.random() * msgs.length)];
      setLines((l) => [...l.slice(-80), { t: new Date().toTimeString().slice(0, 8) + '.' + String(Date.now() % 1000).padStart(3, '0').slice(0, 2), level: lv, msg: m }]);
    }, 900);
    return () => clearInterval(t);
  }, [live]);
  const shown = lines.filter((l) => level === 'all' || l.level === level);
  return (
    <Screen product={forge} active="logs" topbar={<O.Text weight="medium">Logs</O.Text>}>
      <Page title="Logs" subtitle="forge-web · production · fra1" actions={<O.Button iconStart={live ? <Pause /> : <Play />} onClick={() => setLive(!live)}>{live ? 'Pause' : 'Resume'}</O.Button>}>
        <O.HStack gap={2} wrap>
          <O.SegmentedControl size="sm" value={level} onChange={setLevel} options={[{ value: 'all', label: 'All' }, { value: 'info', label: 'Info' }, { value: 'warn', label: 'Warn' }, { value: 'error', label: 'Error' }]} />
          {live && <O.HStack gap={2}><O.StatusDot tone="success" live /><O.Text size="sm" tone="muted">Streaming</O.Text></O.HStack>}
        </O.HStack>
        <O.LogViewer lines={shown} maxHeight={520} label="Runtime logs" />
      </Page>
    </Screen>
  );
}

// ───────── Metrics
export function DevMetricsScreen() {
  const [range, setRange] = useState('24h');
  const n = range === '24h' ? 24 : 14;
  const series = useMemo(() => Array.from({ length: n }, (_, i) => ({ label: range === '24h' ? `${i}:00` : `Nov ${i + 1}`, values: { ok: Math.round(900 + Math.sin(i / 3) * 300 + i * 10), c4: Math.round(40 + (i % 5) * 9), c5: 2 + (i % 7 === 3 ? 30 : i % 3) } })), [n, range]);
  return (
    <Screen product={forge} active="metrics" topbar={<O.Text weight="medium">Metrics</O.Text>}>
      <Page title="Metrics" actions={<O.SegmentedControl size="sm" value={range} onChange={setRange} options={[{ value: '24h', label: '24 hours' }, { value: '14d', label: '14 days' }]} />}>
        <O.KpiStrip items={[
          { icon: <Globe size={14} />, label: 'Requests', period: range, value: '2.1M', delta: 9, viz: <O.SparkBars values={series.map((s) => s.values.ok)} />, note: <>Peak <O.KpiStrong>1.4k/min</O.KpiStrong></> },
          { icon: <CircleAlert size={14} />, label: 'Error rate', period: range, value: '0.4%', delta: -22, good: 'down', viz: <O.WaffleGrid filled={4} total={1000} />, note: 'SLO 1%' },
          { icon: <Server size={14} />, label: 'p95 latency', period: range, value: '182ms', delta: -6, good: 'down', viz: <O.RangeMarker min={0} max={500} value={182} previous={194} unit="ms" />, note: <>Target <O.KpiStrong>250ms</O.KpiStrong></> },
          { icon: <CircleCheck size={14} />, label: 'Uptime', period: '30 days', value: '99.97%', viz: <O.QuotaBar value={29.99} max={30} />, note: '13 min downtime' },
        ]} />
        <O.Well title="Responses" subtitle="2xx and 4xx stacked · 5xx below the line">
          <O.Card>
            <O.StackedBarChart label="Responses" data={series} series={[{ key: 'ok', label: '2xx', color: O.seriesColors.green }, { key: 'c4', label: '4xx', color: O.seriesColors.amber }]} negative={{ key: 'c5', label: '5xx', color: O.seriesColors.pink }} />
          </O.Card>
        </O.Well>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)" stretch>
          <O.Well title="Latency" fill><O.Card grow><O.LineChart label="Latency" labels={series.map((s) => s.label)} series={[{ name: 'p50', values: series.map((s, i) => 60 + (i % 5) * 4) }, { name: 'p95', values: series.map((s, i) => 170 + (i % 6) * 9), color: O.seriesColors.violet }]} /></O.Card></O.Well>
          <O.Well title="Slowest routes" fill>
            <O.Card padding="none" grow>
              <O.Table label="Routes" compact rows={[['/api/search', 1204], ['/api/checkout', 212], ['/api/customers', 96], ['/api/login', 64], ['/api/orders', 41]]} rowKey={(r) => r[0] as string} columns={[{ key: 'r', header: 'Route', render: (r) => <O.Text as="span" mono size="sm">{r[0]}</O.Text> }, { key: 'p', header: 'p95', align: 'right', render: (r) => `${(r[1] as number).toLocaleString('en-US')}ms` }]} />
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Incidents list + detail
const incidents = [
  { id: 'INC-31', title: 'Elevated 5xx on /api/health', sev: 'SEV2', status: 'Investigating', started: '12:04', who: 'Kofi Mensah' },
  { id: 'INC-30', title: 'Slow search queries', sev: 'SEV3', status: 'Resolved', started: 'Nov 12', who: 'Ana Ruiz' },
  { id: 'INC-29', title: 'Deploy pipeline stuck', sev: 'SEV3', status: 'Resolved', started: 'Nov 8', who: 'Sam Ito' },
];
export function DevIncidentsScreen() {
  const { open } = useScreenNav();
  return (
    <Screen product={forge} active="incidents" topbar={<O.Text weight="medium">Incidents</O.Text>}>
      <Page title="Incidents" actions={<O.Button variant="danger" iconStart={<CircleAlert />} onClick={() => open('dev-incident')}>Declare incident</O.Button>} max={980}>
        <O.VStack gap={2}>
          {incidents.map((i) => (
            <O.Card key={i.id} onClick={() => open('dev-incident')}>
              <O.HStack gap={3} wrap>
                <O.Badge tone={i.sev === 'SEV2' ? 'danger' : 'warning'}>{i.sev}</O.Badge>
                <O.VStack gap={0} grow><O.Text weight="medium">{i.title}</O.Text><O.Text size="xs" tone="muted">{i.id} · started {i.started} · lead {i.who}</O.Text></O.VStack>
                <O.StatusChip variant="dot" tone={i.status === 'Resolved' ? 'success' : 'danger'}>{i.status}</O.StatusChip>
              </O.HStack>
            </O.Card>
          ))}
        </O.VStack>
      </Page>
    </Screen>
  );
}

export function DevIncidentScreen() {
  const toast = O.useToast();
  const { open } = useScreenNav();
  const [status, setStatus] = useState('investigating');
  const [note, setNote] = useState('');
  const [timeline, setTimeline] = useState<O.Activity[]>([
    { id: '1', who: 'Forge monitor', action: 'detected 5xx above 2%', when: '12:04', icon: <CircleAlert size={14} /> },
    { id: '2', who: 'Kofi Mensah', action: 'declared SEV2 and took lead', when: '12:06' },
    { id: '3', who: 'Kofi Mensah', action: 'rolled back dpl_1d0e9f2', when: '12:11', icon: <RotateCcw size={14} /> },
  ]);
  return (
    <Screen product={forge} active="incidents" topbar={<O.Breadcrumbs items={[{ id: 'i', label: 'Incidents' }, { id: 'n', label: 'INC-31' }]} onNavigate={() => open('dev-incidents')} />}>
      <Page title="Elevated 5xx on /api/health" subtitle="SEV2 · started 12:04 · 18 min" max={1140}>
        <O.Card><O.Stepper current={['investigating', 'identified', 'monitoring', 'resolved'].indexOf(status)} onStepClick={(i) => setStatus(['investigating', 'identified', 'monitoring', 'resolved'][i])} steps={[{ label: 'Investigating' }, { label: 'Identified' }, { label: 'Monitoring' }, { label: 'Resolved' }]} /></O.Card>
        <Cols template="minmax(0, 1fr) 320px">
          <O.Well title="Timeline">
            <O.Card>
              <O.VStack gap={4}>
                <O.ActivityFeed items={timeline} />
                <O.HStack gap={2}>
                  <div style={{ flex: 1, minWidth: 0 }}><O.TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an update…" aria-label="Update" /></div>
                  <O.Button variant="primary" disabled={!note.trim()} onClick={() => (setTimeline((t) => [...t, { id: String(Date.now()), who: 'You', action: note, when: 'now' }]), setNote(''))}>Post</O.Button>
                </O.HStack>
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.VStack gap={3}>
            <O.Card padding="sm"><O.MetadataList items={[{ label: 'Lead', value: 'Kofi Mensah' }, { label: 'Impact', value: '~4% of API calls' }, { label: 'Status page', value: <O.Switch size="sm" aria-label="Show on status page" defaultChecked /> }]} /></O.Card>
            <O.Button variant="primary" fullWidth iconStart={<CircleCheck />} onClick={() => (setStatus('resolved'), toast({ title: 'Incident resolved', description: 'Post-mortem draft created.', tone: 'success' }))}>Resolve</O.Button>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Environment variables
export function DevEnvScreen() {
  const toast = O.useToast();
  const [vars, setVars] = useState([
    { k: 'DATABASE_URL', v: 'postgres://forge:••••@db.fra1/forge', env: ['Production', 'Preview'], secret: true },
    { k: 'STRIPE_KEY', v: 'sk_live_••••••••4a1c', env: ['Production'], secret: true },
    { k: 'PUBLIC_API_BASE', v: 'https://api.forge.run', env: ['Production', 'Preview', 'Development'], secret: false },
  ]);
  const [show, setShow] = useState<string[]>([]);
  const [k, setK] = useState('');
  const [v, setV] = useState('');
  return (
    <Screen product={forge} active="env" topbar={<O.Text weight="medium">Environment</O.Text>}>
      <Page title="Environment variables" subtitle="Changes apply to the next deployment." max={1040}>
        <O.Well title="Add variable">
          <O.Card>
            <O.Grid min={200} gap={3}>
              <O.Field label="Key"><O.TextInput value={k} onChange={(e) => setK(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))} placeholder="API_TOKEN" /></O.Field>
              <O.Field label="Value"><O.TextInput value={v} onChange={(e) => setV(e.target.value)} /></O.Field>
            </O.Grid>
            <O.HStack justify="end"><O.Button variant="primary" disabled={!k || !v} onClick={() => (setVars((x) => [...x, { k, v, env: ['Production'], secret: true }]), setK(''), setV(''), toast({ title: `${k} added`, tone: 'success' }))}>Add</O.Button></O.HStack>
          </O.Card>
        </O.Well>
        <O.Card padding="none">
          <O.Table label="Variables" rows={vars} rowKey={(r) => r.k} columns={[
            { key: 'k', header: 'Key', render: (r) => <O.Text as="span" mono size="sm">{r.k}</O.Text> },
            { key: 'v', header: 'Value', render: (r) => <O.HStack gap={1}><O.Text as="span" mono size="sm" tone="muted">{r.secret && !show.includes(r.k) ? '••••••••••••' : r.v}</O.Text>{r.secret && <O.IconButton size="xs" label={show.includes(r.k) ? 'Hide value' : 'Show value'} icon={show.includes(r.k) ? <EyeOff /> : <Eye />} onClick={() => setShow((s) => (s.includes(r.k) ? s.filter((x) => x !== r.k) : [...s, r.k]))} />}</O.HStack> },
            { key: 'e', header: 'Environments', hideBelow: 'md', render: (r) => <O.HStack gap={1}>{r.env.map((e) => <O.Badge key={e} variant="outline">{e}</O.Badge>)}</O.HStack> },
            { key: 'x', header: '', align: 'right', render: (r) => <O.MoreMenu size="sm" items={[{ label: 'Copy key', icon: <Copy size={15} />, onSelect: () => toast({ title: 'Copied' }) }, { type: 'divider' }, { label: 'Delete', danger: true, icon: <Trash2 size={15} />, onSelect: () => setVars((x) => x.filter((y) => y.k !== r.k)) }]} /> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── API keys
export function DevKeysScreen() {
  const toast = O.useToast();
  const [keys, setKeys] = useState([
    { id: 'k1', name: 'CI deploy', prefix: 'fk_live_8f3c', created: 'Oct 2', used: '4m ago', scopes: ['deploy'] },
    { id: 'k2', name: 'Analytics export', prefix: 'fk_live_19ab', created: 'Aug 21', used: '3 days ago', scopes: ['read'] },
  ]);
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [revoke, setRevoke] = useState<string | null>(null);
  const { copied, copy } = O.useClipboard();
  return (
    <Screen product={forge} active="keys" topbar={<O.Text weight="medium">API keys</O.Text>}>
      <Page title="API keys" subtitle="Keys act as your workspace. Store them in a secret manager." actions={<O.Button variant="primary" iconStart={<KeyRound />} onClick={() => (setCreated(null), setOpen(true))}>Create key</O.Button>} max={980}>
        <O.List>
          {keys.map((k, i) => (
            <O.ListItem key={k.id} last={i === keys.length - 1} leading={<KeyRound size={16} />} title={k.name} subtitle={`${k.prefix}•••• · created ${k.created} · used ${k.used}`} trailing={<O.HStack gap={2}>{k.scopes.map((s) => <O.Badge key={s}>{s}</O.Badge>)}<O.Button size="xs" variant="ghost" onClick={() => setRevoke(k.id)}>Revoke</O.Button></O.HStack>} />
          ))}
        </O.List>
      </Page>
      <O.Dialog open={open} onClose={() => setOpen(false)} title={created ? 'Copy your key now' : 'Create API key'} description={created ? 'You will not be able to see it again.' : undefined} footer={created ? <O.Button variant="primary" onClick={() => setOpen(false)}>Done</O.Button> : <><O.Button onClick={() => setOpen(false)}>Cancel</O.Button><O.Button variant="primary" onClick={() => { const key = 'fk_live_' + Math.random().toString(36).slice(2, 14); setCreated(key); setKeys((x) => [...x, { id: key, name: 'New key', prefix: key.slice(0, 12), created: 'Today', used: 'never', scopes: ['read'] }]); }}>Create</O.Button></>}>
        {created ? (
          <O.HStack gap={2}><O.Code>{created}</O.Code><O.Button size="sm" iconStart={<Copy />} onClick={() => copy(created)}>{copied ? 'Copied' : 'Copy'}</O.Button></O.HStack>
        ) : (
          <O.VStack gap={4}>
            <O.Field label="Name"><O.TextInput placeholder="e.g. CI deploy" data-autofocus /></O.Field>
            <O.Field label="Scopes"><O.CheckboxList label="Scopes" defaultValue={['read']} items={[{ value: 'read', label: 'read', description: 'Projects, deployments, logs' }, { value: 'deploy', label: 'deploy', description: 'Create deployments' }, { value: 'admin', label: 'admin', description: 'Everything, including billing' }]} /></O.Field>
          </O.VStack>
        )}
      </O.Dialog>
      <O.AlertDialog open={!!revoke} onClose={() => setRevoke(null)} destructive onConfirm={() => (setKeys((x) => x.filter((k) => k.id !== revoke)), toast({ title: 'Key revoked' }))} title="Revoke this key?" description="Anything using it stops working immediately." confirmLabel="Revoke key" />
    </Screen>
  );
}

// ───────── Webhooks
export function DevWebhooksScreen() {
  const toast = O.useToast();
  const [sel, setSel] = useState('w1');
  const hooks = [
    { id: 'w1', url: 'https://hooks.slack.com/services/T0…', events: 4, ok: 99.2 },
    { id: 'w2', url: 'https://api.acme.com/forge', events: 2, ok: 71.4 },
  ];
  const cur = hooks.find((h) => h.id === sel)!;
  return (
    <Screen product={forge} active="webhooks" topbar={<O.Text weight="medium">Webhooks</O.Text>}>
      <Page title="Webhooks" actions={<O.Button variant="primary" iconStart={<Webhook />}>Add endpoint</O.Button>}>
        <Cols template="320px minmax(0, 1fr)">
          <O.List>
            {hooks.map((h, i) => (
              <O.ListItem key={h.id} last={i === hooks.length - 1} leading={<Webhook size={16} />} title={<span style={{ fontFamily: O.font.mono, fontSize: 12 }}>{h.url}</span>} subtitle={`${h.events} events · ${h.ok}% delivered`} trailing={h.ok < 90 ? <O.StatusDot tone="danger" label="Failing" /> : <O.StatusDot tone="success" label="Healthy" />} onClick={() => setSel(h.id)} />
            ))}
          </O.List>
          <O.VStack gap={3}>
            {cur.ok < 90 && <O.Banner tone="danger" title="Deliveries failing" action={<O.Button size="sm" iconStart={<RefreshCw />} onClick={() => toast({ title: 'Retrying 12 deliveries' })}>Retry all</O.Button>}>Endpoint returned 500 for 12 events.</O.Banner>}
            <O.Well title="Events">
              <O.CheckboxList label="Subscribed events" defaultValue={['deployment.ready', 'deployment.failed']} items={['deployment.ready', 'deployment.failed', 'incident.opened', 'incident.resolved'].map((e) => ({ value: e, label: e }))} />
            </O.Well>
            <O.Well title="Recent deliveries">
              <O.Card padding="none">
                <O.Table label="Deliveries" compact rows={['deployment.ready#1', 'deployment.failed#2', 'deployment.ready#3']} rowKey={(r) => r} renderExpanded={(r) => <O.CodeBlock code={`{\n  "type": "${r.split('#')[0]}",\n  "deployment": "dpl_8f3c2a1",\n  "project": "forge-web"\n}`} />} columns={[{ key: 'e', header: 'Event', render: (r) => <O.Text as="span" mono size="sm">{r.split('#')[0]}</O.Text> }, { key: 's', header: 'Response', render: () => <O.StatusChip size="sm" tone={cur.ok < 90 ? 'danger' : 'success'}>{cur.ok < 90 ? '500' : '200'}</O.StatusChip> }]} />
              </O.Card>
            </O.Well>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Usage & billing
export function DevUsageScreen() {
  return (
    <Screen product={forge} active="usage" topbar={<O.Text weight="medium">Usage</O.Text>}>
      <Page title="Usage" subtitle="Billing period 1 – 30 November">
        <O.Grid columns={4} gap={3}>
          <O.StatTile icon={<Rocket size={20} />} color={O.seriesColors.blue} label="Build minutes" value="3,412" delta={12} foot="vs October" />
          <O.StatTile icon={<Globe size={20} />} color={O.seriesColors.teal} label="Bandwidth" value="412 GB" delta={8} foot="vs October" />
          <O.StatTile icon={<Server size={20} />} color={O.seriesColors.violet} label="Function calls" value="8.2M" delta={21} foot="vs October" />
          <O.StatTile icon={<KeyRound size={20} />} color={O.seriesColors.amber} label="Estimated bill" value={money(214)} delta={-3} good="down" foot="vs October" />
        </O.Grid>
        <O.UsageMeter title="Build minutes by project" total={6000} format={(n) => Math.round(n).toLocaleString('en-US')} segments={[{ label: 'forge-web', value: 1840, color: O.seriesColors.blue }, { label: 'api', value: 1020, color: O.seriesColors.violet }, { label: 'docs', value: 420, color: O.seriesColors.teal }, { label: 'status', value: 132, color: O.seriesColors.amber }]} />
      </Page>
    </Screen>
  );
}
