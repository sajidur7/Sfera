import * as stylex from '@stylexjs/stylex';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Check, Ellipsis, Plus, RotateCcw, Copy } from 'lucide-react';
import { accent, colors, font, motion, radius, shadows } from '../sfera/tokens.stylex';
import * as O from '../sfera';
import { doc } from './ComponentPage';
import { AccentPicker, ThemeToggle } from './App';
import { CodeView, CopyButton } from './code';
import { files } from './source';
import installerSource from '../../dist-installer/sfera-install.mjs?raw';
import proofLog from '../../install-proof.log?raw';
const libraryCount = (installerSource.match(/const LIBRARY = (\{.*?\});\n/s)?.[1].match(/\.tsx?\"|\.css\"/g) ?? []).length;
import { components } from './registry';
import { screens } from '../screens';
import { date, levels, money, orderStatus, orders } from '../data/mock';
import { coverage, type Cov } from './coverage';

const pg = stylex.create({
  showcase: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(3, minmax(0, 1fr))', '@media (max-width: 1100px)': 'repeat(2, minmax(0, 1fr))', '@media (max-width: 680px)': 'minmax(0, 1fr)' },
    gap: 10,
    alignItems: 'stretch',
  },
  span2: { gridColumn: { default: 'span 2', '@media (max-width: 680px)': 'span 1' } },
  span3: { gridColumn: { default: '1 / -1' } },
  heroRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 6 },
  links: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 10, marginTop: 44 },
  table: { borderRadius: 16, overflow: 'hidden' },
});

// ───────── Overview
function Showcase() {
  const [rows, setRows] = useState(orders.slice(0, 5));
  const [page, setPage] = useState(1);
  const [model, setModel] = useState('compose');
  const [effort, setEffort] = useState(2);
  const [range, setRange] = useState('weekly');
  const [stepsWeek, setStepsWeek] = useState(0);
  const [nav, setNav] = useState('home');
  const base = [6200, 2300, 1900, 6500, 7400, 5600, 3200];
  const steps = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({ label, value: base[(i + stepsWeek * 3 + 70) % 7] + stepsWeek * 120 }));
  const total = steps.reduce((a, b) => a + b.value, 0);
  const toast = O.useToast();
  return (
    <div {...stylex.props(pg.showcase)}>
      <O.Well title="Profile" subtitle="Patient record" actions={<O.IconButton size="sm" label="More" icon={<Ellipsis size={16} />} />} fill>
        <O.Card grow>
          <O.VStack gap={3} align="center">
            <O.Avatar name="Mira Chen" size="xl" status="success" />
            <O.VStack gap={0} align="center">
              <O.Text size="lg" weight="medium">Mira Chen</O.Text>
              <O.Text size="sm" tone="muted">mira@northwind.com</O.Text>
            </O.VStack>
          </O.VStack>
          <div style={{ marginTop: 12 }}>
            <O.MetadataList
              alignValues="right"
              items={[
                { label: 'Date of birth', value: '28 July 1997' },
                { label: 'Gender', value: 'Female' },
                { label: 'Blood type', value: 'A rh+' },
                { label: 'Doctor', value: 'Theo Park' },
                { label: 'Next check-up', value: '2 Dec 2026' },
              ]}
            />
          </div>
        </O.Card>
      </O.Well>
      <O.Well title="Steps" subtitle="Daily total" actions={<O.DateStepper onChange={(s) => setStepsWeek(Math.round(s.getTime() / 6.048e8) % 9)} />} fill>
        <O.Card grow>
          <O.CardHeader value={<O.AnimatedNumber value={total} />} unit="total steps" />
          <O.BarChart data={steps} height={196} label="Steps per day" />
        </O.Card>
      </O.Well>
      <O.Well title="Sleep score" subtitle="Last night" actions={<O.DateStepper defaultStart={new Date(2026, 5, 29)} />} fill>
        <O.Card grow>
          <O.VStack gap={4} align="center">
            <O.Text size="lg" weight="medium">Excellent</O.Text>
            <O.RingScore value={98} size={140} segments={[{ value: 49, color: '#8B5CF6' }, { value: 29, color: '#E0457B' }, { value: 20, color: '#3B82F6' }]} />
          </O.VStack>
          <div style={{ marginTop: 12 }}>
            <O.MetadataList
              alignValues="right"
              items={[
                { label: <O.HStack gap={2}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#8B5CF6' }} />Duration 7h 50m</O.HStack>, value: '49/50' },
                { label: <O.HStack gap={2}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#E0457B' }} />Bedtime 20m earlier</O.HStack>, value: '29/30' },
                { label: <O.HStack gap={2}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#3B82F6' }} />Interruptions</O.HStack>, value: '20/20' },
              ]}
            />
          </div>
        </O.Card>
      </O.Well>
      <div {...stylex.props(pg.span2)}>
        <O.Well
          title="Orders"
          subtitle="Change a purchase status from its dropdown"
          actions={
            <O.Button size="sm" variant="primary" iconStart={<Plus size={14} />} onClick={() => toast({ title: 'Draft order created', tone: 'success' })}>
              New order
            </O.Button>
          }
          fill
        >
          <O.Card padding="none" grow>
            <O.Table
              label="Orders"
              rows={rows}
              rowKey={(r) => r.id}
              columns={[
                { key: 'c', header: 'Customer', sortValue: (r) => r.customer, render: (r) => <O.HStack gap={2}><O.Avatar name={r.customer} size="sm" /><span>{r.customer}</span></O.HStack> },
                { key: 's', header: 'Purchase', render: (r) => <O.StatusSelect options={orderStatus} value={r.status} onChange={(v) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: v } : x)))} /> },
                { key: 'd', header: 'Status', hideBelow: 'sm', render: (r) => (r.delivery === 'shipped' ? <O.StatusChip tone="success">Shipped</O.StatusChip> : r.delivery === 'failed' ? <O.StatusChip tone="danger">Delivery failed</O.StatusChip> : <O.StatusChip tone="info">Processing</O.StatusChip>) },
                { key: 'u', header: 'Last updated', hideBelow: 'md', sortValue: (r) => r.updated, render: (r) => date(r.updated) },
                { key: 'p', header: 'Price', align: 'right', sortValue: (r) => r.total, render: (r) => money(r.total) },
              ]}
            />
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${O.colors.border}` }}>
              <O.Pagination page={page} total={10} onChange={setPage} />
            </div>
          </O.Card>
        </O.Well>
      </div>
      <O.Well fill>
        <O.Card padding="sm" grow>
          <O.VStack gap={2} grow>
            <O.WorkspaceSwitcher name="Mira Chen" subtitle="Personal" color={O.accent.base} />
            <O.SearchInput size="sm" placeholder="Quick search" end={<O.Kbd keys={['mod', 'l']} />} />
            <O.SideNav>
              {[
                { id: 'home', label: 'Home', count: 152 },
                { id: 'board', label: 'Project board' },
                { id: 'marketing', label: 'Marketing' },
                { id: 'calendar', label: 'Calendar' },
                { id: 'finance', label: 'Finance' },
                { id: 'chat', label: 'Assistant' },
              ].map((it) => (
                <O.SideNavItem key={it.id} item={{ ...it, icon: <O.Icon as={O.iconCatalog[{ home: 'House', board: 'Kanban', marketing: 'Megaphone', calendar: 'Calendar', finance: 'Landmark', chat: 'MessageSquare' }[it.id]!]} /> }} active={nav} onSelect={setNav} />
              ))}
            </O.SideNav>
            <O.UserCard name="Studio team" email="team@northwind.com" />
          </O.VStack>
        </O.Card>
      </O.Well>
      <div {...stylex.props(pg.span2)}>
        <O.Well
          title="Token usage"
          subtitle="Across all projects"
          actions={<O.SegmentedControl size="sm" value={range} onChange={setRange} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} />}
          fill
        >
          <O.StatGroup
            stats={[
              { label: 'Total tokens', value: range === 'weekly' ? '84.2M' : range === 'monthly' ? '361M' : '1.8B', delta: 12 },
              { label: 'Peak tokens', value: '562.7M', delta: 4 },
              { label: 'Longest task', value: '12h 54m', delta: -8 },
              { label: 'Top streak', value: '62 days' },
            ]}
          />
          <O.Card grow>
            <O.VStack gap={3}>
              <O.Heatmap values={levels((range === 'weekly' ? 30 : range === 'monthly' ? 40 : 52) * 7, range.length)} label="Token usage" unit="M tokens" />
              <O.HStack gap={4} wrap>
                <O.Text size="sm" tone="muted">Busiest day <strong style={{ fontWeight: 500, color: O.colors.text }}>Tuesday · 14.2M</strong></O.Text>
                <O.Text size="sm" tone="muted">Quietest <strong style={{ fontWeight: 500, color: O.colors.text }}>Sunday · 1.1M</strong></O.Text>
              </O.HStack>
            </O.VStack>
          </O.Card>
        </O.Well>
      </div>
      <O.Well title="Model" subtitle="Used for new chats" fill>
        <O.Card grow>
          <O.VStack gap={4}>
            <O.RadioGroup
              value={model}
              onChange={setModel}
              options={[
                { value: 'compose', label: 'Compose', description: 'Balanced, default' },
                { value: 'swift', label: 'Swift', description: 'Fastest replies' },
                { value: 'depth', label: 'Depth', description: 'Long, careful work' },
              ]}
            />
            <O.Divider />
            <O.Field label="Effort">
              <O.Slider value={effort} onChange={setEffort} min={0} max={4} format={(n) => ['Off', 'Low', 'Medium', 'High', 'Max'][n]} />
            </O.Field>
            <O.HStack justify="between">
              <O.Switch size="sm" label="Web search" defaultChecked />
              <O.Meter level={effort} label="Effort" />
            </O.HStack>
            <O.Field label="Context">
              <O.Select size="sm" defaultValue="200k" options={[{ value: '32k', label: '32k tokens' }, { value: '200k', label: '200k tokens' }, { value: '1m', label: '1M tokens' }]} />
            </O.Field>
          </O.VStack>
        </O.Card>
      </O.Well>
    </div>
  );
}

function Overview() {
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Sfera UI · React + StyleX</p>
        <h1 {...stylex.props(doc.h1)}>A calm system for data-heavy apps</h1>
        <p {...stylex.props(doc.lead)}>
          Soft grey wells hold white cards. Hairlines, near-black text, one accent. {components.length} components, real source in every example, {screens.length} screens built only from them.
        </p>
        <div {...stylex.props(pg.heroRow)}>
          <O.Button variant="primary" iconEnd={<ArrowRight size={15} />} onClick={() => (location.hash = '#components')}>
            Browse components
          </O.Button>
          <O.Button onClick={() => (location.hash = '#docs-installation')}>Install</O.Button>
          <AccentPicker size={20} />
          <ThemeToggle />
        </div>
      </header>
      <Showcase />
      <div {...stylex.props(pg.links)}>
        {[
          { t: 'Foundations', d: 'Colour, type, spacing, motion, icons.', h: '#docs-color' },
          { t: 'Components', d: `${components.length} components with live code.`, h: '#components' },
          { t: 'Screens', d: `${screens.length} app screens across 10 products.`, h: '#screens' },
          { t: 'Themes', d: 'Six accent presets, light and dark.', h: '#themes' },
        ].map((l) => (
          <O.Card key={l.t} onClick={() => (location.hash = l.h)}>
            <O.HStack justify="between" align="start">
              <O.VStack gap={1}>
                <O.Text weight="medium">{l.t}</O.Text>
                <O.Text size="sm" tone="muted">{l.d}</O.Text>
              </O.VStack>
              <ArrowRight size={16} />
            </O.HStack>
          </O.Card>
        ))}
      </div>
    </div>
  );
}

// ───────── Installation
const steps = stylex.create({
  list: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 },
  step: { display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 14 },
  n: { width: 26, height: 26, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.mono, fontSize: 12, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, color: colors.textMuted },
  body: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, paddingBottom: 18 },
  code: { borderRadius: 14, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: colors.codeBg, overflow: 'hidden', position: 'relative' },
  copy: { position: 'absolute', top: 6, right: 6 },
});
function Step({ n, title, children, code }: { n: number; title: string; children?: ReactNode; code?: string }) {
  return (
    <div {...stylex.props(steps.step)}>
      <span {...stylex.props(steps.n)}>{n}</span>
      <div {...stylex.props(steps.body)}>
        <O.Text weight="medium">{title}</O.Text>
        {children && <p {...stylex.props(doc.p)}>{children}</p>}
        {code && (
          <div {...stylex.props(steps.code)}>
            <CodeView code={code} />
            <span {...stylex.props(steps.copy)}>
              <CopyButton text={code} iconOnly />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
function Installation() {
  const { copied, copy } = O.useClipboard(2000);
  const toast = O.useToast();
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Getting started</p>
        <h1 {...stylex.props(doc.h1)}>Installation</h1>
        <p {...stylex.props(doc.lead)}>Sfera UI is source you own. One installer file creates a new app or adds the library to an existing Vite + React app. React 19, TypeScript, StyleX.</p>
      </header>
      <div {...stylex.props(steps.list)}>
        <Step n={1} title="Get the installer">
          One file, no dependencies besides Node 18+. Copy it below and save it as <O.Code>sfera-install.mjs</O.Code>, or take it from <O.Code>dist-installer/</O.Code> in the Sfera UI repo.
        </Step>
        <div style={{ marginTop: -10, marginBottom: 18, paddingLeft: 42 }}>
          <O.HStack gap={2} wrap>
            <O.Button variant="primary" iconStart={copied ? <Check /> : <Copy />} onClick={() => (copy(installerSource), toast({ title: 'Installer copied', description: 'Paste it into a file named sfera-install.mjs.', tone: 'success' }))}>
              {copied ? 'Copied' : 'Copy installer'}
            </O.Button>
            <O.Text size="sm" tone="muted">{(installerSource.length / 1024).toFixed(0)} kB · carries all {libraryCount} library files and the starter</O.Text>
          </O.HStack>
        </div>
        <Step n={2} title="Start a new app" code={`node sfera-install.mjs init my-app\ncd my-app\nnpm install\nnpm run dev`}>
          Creates a Vite + React + StyleX app with Sfera UI in <O.Code>src/sfera/</O.Code> and a small example screen.
        </Step>
        <Step n={3} title="Or add it to an existing app" code={`node sfera-install.mjs add --install\n\n// vite.config.ts\nimport stylex from '@stylexjs/unplugin';\nplugins: [stylex.vite({ useCSSLayers: true, unstable_moduleResolution: { type: 'commonJS' } }), react()]\n\n// main.tsx\nimport { SferaProvider } from './sfera';\n<SferaProvider><App /></SferaProvider>`}>
          Copies the library, installs exact versions of StyleX and Lucide, adds a .browserslistrc if you have none, and prints the two lines to add.
        </Step>
      </div>
      <section {...stylex.props(doc.section)}>
        <O.HStack gap={2}>
          <h2 {...stylex.props(doc.h2)}>Install proof</h2>
          <O.StatusChip tone="success" variant="dot">Both builds exit 0</O.StatusChip>
        </O.HStack>
        <p {...stylex.props(doc.p)}>Recorded output: a new app from an empty folder, and the add flow in a plain Vite app that had no StyleX. Nothing here is edited.</p>
        <div {...stylex.props(steps.code)}>
          <CodeView code={proofLog.trim()} maxHeight={520} />
        </div>
      </section>
      <section {...stylex.props(doc.section)}>
        <O.Collapsible title="Install by hand instead">
          <O.VStack gap={3}>
            <O.Text size="sm" tone="muted">Install the packages, add the StyleX plugin, copy src/sfera/ and wrap your app in SferaProvider.</O.Text>
            <O.CodeBlock code={`npm i -E @stylexjs/stylex@0.19.2 lucide-react@1.73.0\nnpm i -E -D @stylexjs/unplugin@0.19.2`} />
          </O.VStack>
        </O.Collapsible>
      </section>
    </div>
  );
}

// ───────── Principles (UX rules applied)
function Principles() {
  const rules: [string, string][] = [
    ['Hierarchy from size, weight and spacing', 'Headings 500 with tight tracking, one primary button per view, muted secondary text (5.9:1).'],
    ['4px spacing rhythm', 'All gaps are multiples of 4: Stack gap = n × 4px. Wells 8px, cards 16px.'],
    ['Visible focus rings', '2px accent outline with 2px offset on every interactive element; never removed.'],
    ['Targets', 'Controls are 32–36px on desktop; inputs grow to 16px text on phones to stop iOS zoom.'],
    ['Colour is never the only signal', 'Status chips always carry a word; status dots sit beside labels.'],
    ['Labels, not placeholders', 'Field always renders a visible label; errors sit under the field with aria-describedby and say how to fix it.'],
    ['States', 'Hover, pressed (scale .97), disabled (45% opacity + not-allowed), loading (spinner + aria-busy), empty (dashed EmptyState with an action).'],
    ['Toasts', 'aria-live="polite", auto-dismiss at 4s, do not steal focus, optional undo.'],
    ['Destructive actions', 'AlertDialog with Cancel focused first; undo offered afterwards.'],
    ['Motion', 'One curve (0.32, 0.72, 0, 1) at 140/220/360ms; transform and opacity only; prefers-reduced-motion cuts animation.'],
    ['Responsive', 'No page-level sideways scroll at 375px: tables scroll inside themselves, columns hide below 640/900px, sidebars become drawers.'],
    ['Icons', 'Lucide only, SVG, one stroke width; icon-only buttons require a label.'],
    ['Dark mode', 'Designed tonal greys, not inverted; tints are mixed from the token so contrast holds in both.'],
  ];
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Getting started</p>
        <h1 {...stylex.props(doc.h1)}>UX rules applied</h1>
        <p {...stylex.props(doc.lead)}>The UX rules the system follows, and where each one shows up.</p>
      </header>
      <O.Well>
        <O.Card padding="none">
          <O.Table label="Rules" rowKey={(r) => r[0]} rows={rules} columns={[{ key: 'r', header: 'Rule', render: (r) => <O.Text weight="medium" size="sm">{r[0]}</O.Text> }, { key: 'h', header: 'How Sfera UI applies it', render: (r) => <span style={{ whiteSpace: 'normal', display: 'block', fontSize: 13, color: O.colors.textMuted, minWidth: 220 }}>{r[1]}</span> }]} />
        </O.Card>
      </O.Well>
    </div>
  );
}

// ───────── Coverage
const covTone: Record<Cov['status'], O.Tone> = { built: 'success', part: 'info', api: 'accent', gap: 'warning', skip: 'neutral' };
const covLabel: Record<Cov['status'], string> = { built: 'Own component', part: 'Part of another', api: 'Different API', gap: 'Not yet', skip: 'Skipped' };
function Coverage() {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const count = (st: Cov['status']) => coverage.filter((c) => c.status === st).length;
  const rows = coverage.filter((c) => (filter === 'all' || c.status === filter) && (c.reference + ' ' + c.sfera + ' ' + c.group).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Getting started</p>
        <h1 {...stylex.props(doc.h1)}>Coverage</h1>
        <p {...stylex.props(doc.lead)}>
          Every entry in the reference component list we matched against, mapped to what Sfera UI has. Where the reference splits a component into parts or hooks, Sfera often covers it with one component and a prop; those rows say which. Gaps are listed, not hidden.
        </p>
      </header>
      <O.VStack gap={3}>
        <O.StatGroup
          stats={[
            { label: 'Own component', value: count('built') },
            { label: 'Covered by a part or prop', value: count('part') + count('api') },
            { label: 'Not yet', value: count('gap') },
            { label: 'Sfera UI components', value: components.length },
          ]}
        />
        <O.HStack gap={2} wrap>
          <O.SegmentedControl size="sm" value={filter} onChange={setFilter} label="Filter by status" options={[{ value: 'all', label: `All ${coverage.length}` }, { value: 'built', label: 'Built' }, { value: 'part', label: 'Part' }, { value: 'api', label: 'API' }, { value: 'gap', label: `Not yet ${count('gap')}` }]} />
          <div style={{ flex: '1 1 200px', maxWidth: 300 }}>
            <O.SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search entries" />
          </div>
        </O.HStack>
        <O.Card padding="none">
          <O.Table
            label="Coverage"
            compact
            rowKey={(r) => r.group + r.reference}
            rows={rows}
            columns={[
              { key: 'a', header: 'Reference entry', sortValue: (r) => r.reference, render: (r) => <span style={{ whiteSpace: 'normal', display: 'block', minWidth: 140 }}><O.Text as="span" size="sm" weight="medium">{r.reference}</O.Text><br /><O.Text as="span" size="xs" tone="subtle">{r.group}</O.Text></span> },
              { key: 'o', header: 'Sfera UI', render: (r) => <span style={{ whiteSpace: 'normal', display: 'block', minWidth: 140, fontFamily: O.font.mono, fontSize: 12 }}>{r.sfera}</span> },
              { key: 's', header: 'Status', sortValue: (r) => r.status, render: (r) => <O.StatusChip size="sm" tone={covTone[r.status]}>{covLabel[r.status]}</O.StatusChip> },
              { key: 'n', header: 'Note', hideBelow: 'md', render: (r) => <span style={{ whiteSpace: 'normal', fontSize: 12, color: O.colors.textMuted }}>{r.note}</span> },
            ]}
          />
        </O.Card>
      </O.VStack>
    </div>
  );
}

// ───────── Foundations
const fd = stylex.create({
  swatches: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 8 },
  sw: { display: 'flex', flexDirection: 'column', gap: 0, padding: 0, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: colors.surface, cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' },
  chip: { height: 64, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  swMeta: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  swName: { fontSize: font.sm, fontWeight: 500 },
  swVal: { fontFamily: font.mono, fontSize: 11, color: colors.textMuted },
  typeRow: { display: 'grid', gridTemplateColumns: { default: '140px minmax(0, 1fr)', '@media (max-width: 640px)': 'minmax(0, 1fr)' }, gap: 12, alignItems: 'baseline', paddingBlock: 14, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  typeMeta: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted },
  bar: { height: 12, borderRadius: 3, backgroundColor: accent.base },
  radiusBox: { width: 72, height: 72, backgroundColor: colors.well, borderWidth: 1, borderStyle: 'solid', borderColor: colors.borderStrong },
  elev: { height: 110, borderRadius: 16, backgroundColor: colors.raised, display: 'flex', alignItems: 'flex-end', padding: 12, fontFamily: font.mono, fontSize: 12, color: colors.textMuted },
  motionTrack: { position: 'relative', height: 44, borderRadius: 12, backgroundColor: colors.well, overflow: 'hidden' },
  ball: { position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderRadius: 8, backgroundColor: accent.base, transitionProperty: 'transform', transitionTimingFunction: motion.ease },
  icons: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 6 },
  iconBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 88,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    backgroundColor: { default: colors.surface, ':hover': colors.hover },
    color: colors.text,
    cursor: 'pointer',
    transitionProperty: 'transform, background-color',
    transitionDuration: motion.fast,
    transform: { default: null, ':active': 'scale(0.95)' },
  },
  iconName: { fontSize: 11, color: colors.textMuted, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copied: { color: colors.success },
});

type ColorName = 'page' | 'well' | 'surface' | 'raised' | 'hover' | 'track' | 'border' | 'borderStrong' | 'text' | 'textMuted' | 'textSubtle' | 'success' | 'warning' | 'danger' | 'info';
const colorTokens: { group: string; items: { name: ColorName; light: string; dark: string; use: string }[] }[] = [
  {
    group: 'Surfaces',
    items: [
      { name: 'page', light: '#FFFFFF', dark: '#0E0E10', use: 'App background' },
      { name: 'well', light: '#F4F4F5', dark: '#18181B', use: 'Grey wells' },
      { name: 'surface', light: '#FFFFFF', dark: '#1F1F23', use: 'Cards, inputs' },
      { name: 'raised', light: '#FFFFFF', dark: '#232328', use: 'Menus, dialogs' },
      { name: 'hover', light: '#F5F5F6', dark: '#26262B', use: 'Row and item hover' },
      { name: 'track', light: '#EDEDEF', dark: '#2A2A2F', use: 'Chart and progress tracks' },
    ],
  },
  {
    group: 'Lines and text',
    items: [
      { name: 'border', light: '#E6E6E9', dark: '#2B2B30', use: 'Hairlines' },
      { name: 'borderStrong', light: '#D4D4D9', dark: '#3A3A41', use: 'Input outlines' },
      { name: 'text', light: '#121214', dark: '#EDEDF0', use: 'Primary text' },
      { name: 'textMuted', light: '#62626B', dark: '#A1A1AA', use: 'Secondary text' },
      { name: 'textSubtle', light: '#8A8A93', dark: '#76767F', use: 'Captions, placeholders' },
    ],
  },
  {
    group: 'Status',
    items: [
      { name: 'success', light: '#1E9E5A', dark: '#3DBE78', use: 'Shipped, paid' },
      { name: 'warning', light: '#D99A06', dark: '#E8B02A', use: 'Waiting, due' },
      { name: 'danger', light: '#DC3B40', dark: '#F0595D', use: 'Failed, delete' },
      { name: 'info', light: '#2E64F0', dark: '#5B8BFF', use: 'Processing' },
    ],
  },
];

function Swatch({ name, light, dark, use, value }: { name: string; light: string; dark: string; use: string; value: string }) {
  const { copied, copy } = O.useClipboard();
  return (
    <button type="button" onClick={() => copy(`colors.${name}`)} {...stylex.props(fd.sw)} aria-label={`Copy colors.${name}`}>
      <span {...stylex.props(fd.chip)} style={{ backgroundColor: value }} />
      <span {...stylex.props(fd.swMeta)}>
        <span {...stylex.props(fd.swName, copied && fd.copied)}>{copied ? 'Copied colors.' + name : `colors.${name}`}</span>
        <span {...stylex.props(fd.swVal)}>
          {light} · {dark}
        </span>
        <O.Text size="xs" tone="muted">{use}</O.Text>
      </span>
    </button>
  );
}

function ColorPage() {
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Foundations</p>
        <h1 {...stylex.props(doc.h1)}>Colour</h1>
        <p {...stylex.props(doc.lead)}>Neutral greys do the work; one accent marks action and selection. Every token has a light and a dark value. Click a swatch to copy its token.</p>
      </header>
      {colorTokens.map((g) => (
        <section key={g.group} {...stylex.props(doc.section)}>
          <h2 {...stylex.props(doc.h2)}>{g.group}</h2>
          <div {...stylex.props(fd.swatches)}>
            {g.items.map((t) => (
              <Swatch key={t.name} {...t} value={O.colors[t.name]} />
            ))}
          </div>
        </section>
      ))}
      <section {...stylex.props(doc.section)}>
        <h2 {...stylex.props(doc.h2)}>Accent</h2>
        <p {...stylex.props(doc.p)}>Six flat presets made with stylex.createTheme. White text passes 4.5:1 on every one. Tints (selected rows, soft chips) are mixed from the accent with color-mix, so they follow the preset and the mode.</p>
        <O.HStack gap={4} wrap>
          <AccentPicker size={28} />
          <O.Button variant="primary">Primary</O.Button>
          <O.StatusChip tone="accent">Selected</O.StatusChip>
        </O.HStack>
        <CodeView code={`// themes.ts\n${files.themes.text.split('// #region accentPresets\n')[1].split('// #endregion')[0].trim()}`} maxHeight={260} />
      </section>
    </div>
  );
}

function TypographyPage() {
  const scale: [string, number, number, string, string][] = [
    ['Display', 44, 500, '-0.035em', 'Calm by default'],
    ['H1', 32, 500, '-0.03em', 'Records overview'],
    ['H2', 24, 500, '-0.025em', 'Pipeline this quarter'],
    ['H3', 18, 500, '-0.015em', 'Recent activity'],
    ['Body large', 16, 400, '0', 'Body text for intros and empty states.'],
    ['Body', 14, 400, '0', 'Default body text with a 1.55 line height.'],
    ['Small', 13, 400, '0', 'Secondary text, table meta and help.'],
    ['Caption', 12, 400, '0', 'Captions and badges.'],
  ];
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Foundations</p>
        <h1 {...stylex.props(doc.h1)}>Typography</h1>
        <p {...stylex.props(doc.lead)}>Geist for text, Geist Mono for code and small labels. Headings are big and light: weight 500, never bold, with tight tracking.</p>
      </header>
      <O.Well>
        <O.Card>
          {scale.map(([n, s, w, ls, t], i) => (
            <div key={n} {...stylex.props(fd.typeRow)} style={i === scale.length - 1 ? { borderBottom: 0 } : undefined}>
              <span {...stylex.props(fd.typeMeta)}>
                {n} · {s}/{w}
              </span>
              <span style={{ fontSize: s, fontWeight: w, letterSpacing: ls, lineHeight: 1.2, minWidth: 0, overflowWrap: 'anywhere' }}>{t}</span>
            </div>
          ))}
          <div {...stylex.props(fd.typeRow)} style={{ borderBottom: 0 }}>
            <span {...stylex.props(fd.typeMeta)}>Mono · 12/400</span>
            <span style={{ fontFamily: O.font.mono, fontSize: 12 }}>GEIST MONO · ORD-2041 · npm run build</span>
          </div>
        </O.Card>
      </O.Well>
    </div>
  );
}

function SpacingPage() {
  const sp = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  const rd: [string, string][] = [['xs', '6px'], ['sm', '8px'], ['control', '10px'], ['card', '16px'], ['well', '24px'], ['pill', '999px']];
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Foundations</p>
        <h1 {...stylex.props(doc.h1)}>Spacing and radius</h1>
        <p {...stylex.props(doc.lead)}>A 4px rhythm. Controls 24 / 32 / 36px tall (36 by default) with a 10px radius; chips, tags and segmented controls are pills.</p>
      </header>
      <O.VStack gap={3}>
        <O.Well title="Space" subtitle="space.s1 – space.s16">
          <O.Card grow>
            <O.VStack gap={2}>
              {sp.map((s) => (
                <O.HStack key={s} gap={3}>
                  <span style={{ width: 36, fontFamily: O.font.mono, fontSize: 12, color: O.colors.textMuted }}>{s}</span>
                  <span {...stylex.props(fd.bar)} style={{ width: s * 3 }} />
                </O.HStack>
              ))}
            </O.VStack>
          </O.Card>
        </O.Well>
        <O.Well title="Radius" subtitle="Nesting: well 24 → card 16 → control 10">
          <O.Card grow>
            <O.Grid min={110} gap={3}>
              {rd.map(([n, v]) => (
                <O.VStack key={n} gap={2} align="center">
                  <span {...stylex.props(fd.radiusBox)} style={{ borderRadius: v === '999px' ? 36 : v }} />
                  <O.Text size="xs" mono tone="muted">
                    {n} · {v}
                  </O.Text>
                </O.VStack>
              ))}
            </O.Grid>
            <div style={{ marginTop: 16 }}><O.Text size="sm" tone="muted">Inner radius = outer radius − padding. A 24px well with 8px padding holds a 16px card, so the curves stay parallel.</O.Text></div>
          </O.Card>
        </O.Well>
      </O.VStack>
    </div>
  );
}

function ElevationPage() {
  const lv: [string, string, string][] = [
    ['card', O.shadows.card, 'Cards inside wells'],
    ['raised', O.shadows.raised, 'Menus, popovers, toasts'],
    ['dialog', O.shadows.dialog, 'Dialogs and drawers'],
  ];
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Foundations</p>
        <h1 {...stylex.props(doc.h1)}>Elevation</h1>
        <p {...stylex.props(doc.lead)}>Depth comes from nesting (well → card), not shadows. Shadows are reserved for things that float. In dark mode they become a faint edge plus a deep shadow.</p>
      </header>
      <O.Well>
        <O.Grid min={200} gap={3}>
          {lv.map(([n, s, d]) => (
            <div key={n} {...stylex.props(fd.elev)} style={{ boxShadow: s }}>
              <O.VStack gap={0}>
                <O.Text weight="medium" size="sm">shadows.{n}</O.Text>
                <O.Text size="xs" tone="muted">{d}</O.Text>
              </O.VStack>
            </div>
          ))}
        </O.Grid>
      </O.Well>
    </div>
  );
}

function MotionPage() {
  const [on, setOn] = useState(false);
  const [n, setN] = useState(1280);
  const [open, setOpen] = useState(false);
  const durs: [string, string][] = [['fast', '140ms'], ['base', '220ms'], ['slow', '360ms']];
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Foundations</p>
        <h1 {...stylex.props(doc.h1)}>Motion</h1>
        <p {...stylex.props(doc.lead)}>One curve everywhere — cubic-bezier(0.32, 0.72, 0, 1): quick start, long soft landing. Three durations. Only transform and opacity animate; reduced-motion users get instant changes.</p>
      </header>
      <O.VStack gap={3}>
        <O.Well title="Curve and durations" actions={<O.Button size="sm" iconStart={<RotateCcw size={14} />} onClick={() => setOn(!on)}>Play</O.Button>}>
          <O.Card>
            <O.VStack gap={2}>
              {durs.map(([k, v]) => (
                <O.HStack key={k} gap={3}>
                  <span style={{ width: 92, fontFamily: O.font.mono, fontSize: 12, color: O.colors.textMuted }}>
                    {k} {v}
                  </span>
                  <div {...stylex.props(fd.motionTrack)} style={{ flex: 1, minWidth: 0 }}>
                    <span {...stylex.props(fd.ball)} style={{ transitionDuration: v, transform: on ? 'translateX(min(520px, calc(100vw - 260px)))' : 'none' }} />
                  </div>
                </O.HStack>
              ))}
            </O.VStack>
          </O.Card>
        </O.Well>
        <O.Grid min={240} gap={3}>
          <O.Well title="Numbers roll">
            <O.Card grow>
              <O.VStack gap={3} align="center">
                <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.04em' }}>
                  <O.AnimatedNumber value={n} />
                </span>
                <O.Button size="sm" onClick={() => setN(n + 347)}>Add 347</O.Button>
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.Well title="Toggles move">
            <O.Card grow>
              <O.VStack gap={3} align="center">
                <O.Switch label="Press and hold" defaultChecked />
                <O.SegmentedControl options={[{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }, { value: 'c', label: 'Three' }]} />
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.Well title="Open and close">
            <O.Card grow>
              <O.VStack gap={3} align="center">
                <O.Button variant="primary" onClick={() => setOpen(true)}>Open dialog</O.Button>
                <O.Text size="xs" tone="muted">Scale + fade in 360ms, scrim 220ms.</O.Text>
              </O.VStack>
            </O.Card>
          </O.Well>
        </O.Grid>
      </O.VStack>
      <O.Dialog open={open} onClose={() => setOpen(false)} title="Smooth state change" description="Same curve as every other transition." footer={<O.Button variant="primary" onClick={() => setOpen(false)}>Close</O.Button>} />
    </div>
  );
}

function IconCell({ name, I }: { name: string; I: (typeof O.iconCatalog)[string] }) {
  const { copied, copy } = O.useClipboard();
  return (
    <button
      type="button"
      aria-label={`Copy ${name} SVG`}
      title={`Copy ${name} SVG`}
      onClick={() => copy(renderToStaticMarkup(<I size={24} strokeWidth={1.75} />))}
      {...stylex.props(fd.iconBtn)}
    >
      {copied ? <Check size={22} /> : <I size={22} strokeWidth={1.75} />}
      <span {...stylex.props(fd.iconName, copied && fd.copied)}>{copied ? 'SVG copied' : name}</span>
    </button>
  );
}
function IconographyPage() {
  const [q, setQ] = useState('');
  const list = useMemo(() => Object.entries(O.iconCatalog).filter(([n]) => n.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Foundations</p>
        <h1 {...stylex.props(doc.h1)}>Iconography</h1>
        <p {...stylex.props(doc.lead)}>Lucide only, drawn as SVG at 1.75 stroke. Sizes 12 / 14 / 16 / 20 / 24. Click an icon to copy its SVG.</p>
      </header>
      <O.VStack gap={3}>
        <div style={{ maxWidth: 320 }}>
          <O.SearchInput value={q} onValueChange={setQ} placeholder={`Search ${Object.keys(O.iconCatalog).length} icons`} />
        </div>
        <O.Well>
          {list.length ? (
            <div {...stylex.props(fd.icons)}>
              {list.map(([n, I]) => (
                <IconCell key={n} name={n} I={I} />
              ))}
            </div>
          ) : (
            <O.EmptyState title="No icons match" description={`Nothing called “${q}”.`} actions={<O.Button size="sm" onClick={() => setQ('')}>Clear search</O.Button>} />
          )}
        </O.Well>
      </O.VStack>
    </div>
  );
}

// ───────── Themes
function ThemesPage() {
  const { accent: a, mode } = O.useSfera();
  const [nav, setNav] = useState('h');
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Themes</p>
        <h1 {...stylex.props(doc.h1)}>Accent and mode</h1>
        <p {...stylex.props(doc.lead)}>Pick an accent and a mode. The whole site, every component and every screen switch live.</p>
      </header>
      <O.VStack gap={3}>
        <O.Well title="Accent preset" subtitle={`Current: ${a} · ${mode}`} actions={<ThemeToggle />}>
          <O.Card>
            <O.VStack gap={4}>
              <AccentPicker size={36} />
              <O.HStack gap={2} wrap>
                <O.Button variant="primary">Primary</O.Button>
                <O.ToggleButton defaultPressed>Toggle</O.ToggleButton>
                <O.Badge variant="solid">152</O.Badge>
                <O.StatusChip tone="accent">Selected</O.StatusChip>
                <O.Checkbox label="Checked" defaultChecked />
                <O.Switch defaultChecked label="On" />
              </O.HStack>
            </O.VStack>
          </O.Card>
        </O.Well>
        <O.Grid min={260} gap={3}>
          <O.Well title="Sidebar">
            <O.Card padding="sm" grow>
              <O.SideNav>
                <O.SideNavItem item={{ id: 'h', label: 'Home', icon: <O.Icon as={O.iconCatalog.House} />, count: 152 }} active={nav} onSelect={setNav} />
                <O.SideNavItem item={{ id: 'i', label: 'Inbox', icon: <O.Icon as={O.iconCatalog.Inbox} />, count: 8 }} active={nav} onSelect={setNav} />
                <O.SideNavItem item={{ id: 'c', label: 'Calendar', icon: <O.Icon as={O.iconCatalog.Calendar} /> }} active={nav} onSelect={setNav} />
                <O.SideNavItem item={{ id: 's', label: 'Settings', icon: <O.Icon as={O.iconCatalog.Settings} /> }} active={nav} onSelect={setNav} />
              </O.SideNav>
              <div style={{ marginTop: 'auto', padding: '12px 8px 4px' }}>
                <O.ProgressBar value={6.2} max={10} label="6.2 of 10 GB used" />
              </div>
            </O.Card>
          </O.Well>
          <O.Well title="Charts">
            <O.Card grow>
              <O.BarChart height={110} highlight={4} data={[3, 5, 2, 6, 7, 4, 3].map((v, i) => ({ label: 'MTWTFSS'[i], value: v }))} />
            </O.Card>
          </O.Well>
          <O.Well title="Heatmap">
            <O.Card grow>
              <O.Heatmap values={levels(18 * 7, 3)} />
            </O.Card>
          </O.Well>
        </O.Grid>
        <O.Well title="How it works">
          <O.Card padding="none">
            <CodeView code={`import { SferaProvider } from './sfera';\n\n// mode: 'light' | 'dark'   accent: 'blue' | 'violet' | 'pink' | 'red' | 'orange' | 'green'\n<SferaProvider defaultMode="light" defaultAccent="${a}">\n  <App />\n</SferaProvider>\n\n// Inside the provider:\nconst { mode, setMode, accent, setAccent } = useSfera();`} />
          </O.Card>
        </O.Well>
      </O.VStack>
    </div>
  );
}

export function Pages({ id }: { id: string }) {
  switch (id) {
    case 'overview':
      return <Overview />;
    case 'installation':
      return <Installation />;
    case 'principles':
      return <Principles />;
    case 'coverage':
      return <Coverage />;
    case 'color':
      return <ColorPage />;
    case 'typography':
      return <TypographyPage />;
    case 'spacing':
      return <SpacingPage />;
    case 'elevation':
      return <ElevationPage />;
    case 'motion':
      return <MotionPage />;
    case 'iconography':
      return <IconographyPage />;
    case 'themes':
      return <ThemesPage />;
    default:
      return <O.EmptyState title="Page not found" description={`There is no page “${id}”.`} actions={<O.Button onClick={() => (location.hash = '#docs-overview')}>Go to overview</O.Button>} />;
  }
}

export { radius, shadows };
