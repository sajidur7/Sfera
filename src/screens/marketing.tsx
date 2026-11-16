import { useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, Flag, Image as ImageIcon, Mail, MousePointerClick, Plus, Send, Smartphone, Monitor, Type, Users, Link2, Trophy } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { signal } from './products';
import { Cols, Page, money } from './ui';
import { sampleImages } from '../data/mock';

const campStatus: Record<string, O.Tone> = { Live: 'success', Scheduled: 'info', Draft: 'neutral', Ended: 'warning' };
const campaigns = [
  { id: 'c1', name: 'Black Friday early access', channel: 'Email', status: 'Scheduled', sent: 0, open: 0, click: 0, revenue: 0, date: 'Nov 24' },
  { id: 'c2', name: 'Autumn glaze launch', channel: 'Email', status: 'Live', sent: 48210, open: 41.2, click: 6.8, revenue: 18420, date: 'Nov 4' },
  { id: 'c3', name: 'Retargeting · cart', channel: 'Ads', status: 'Live', sent: 120400, open: 0, click: 1.9, revenue: 9210, date: 'Oct 28' },
  { id: 'c4', name: 'Newsletter #42', channel: 'Email', status: 'Ended', sent: 39880, open: 38.4, click: 4.1, revenue: 3120, date: 'Nov 3' },
  { id: 'c5', name: 'Gift guide', channel: 'Social', status: 'Draft', sent: 0, open: 0, click: 0, revenue: 0, date: '—' },
];

// ───────── Campaigns list
export function MktCampaignsScreen() {
  const { open } = useScreenNav();
  const [st, setSt] = useState('all');
  const rows = campaigns.filter((c) => st === 'all' || c.status === st);
  return (
    <Screen product={signal} active="campaigns" topbar={<O.Text weight="medium">Campaigns</O.Text>}>
      <Page title="Campaigns" actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => open('mkt-email')}>New campaign</O.Button>}>
        <O.KpiStrip items={[
          { label: 'Revenue', period: '30 days', value: '$30.7k', delta: 14, viz: <O.SparkBars values={[2, 3, 2, 5, 4, 6, 9, 7, 5, 8, 6, 10]} />, note: <>From <O.KpiStrong>4</O.KpiStrong> campaigns</> },
          { label: 'Open rate', period: 'email', value: '40.1%', delta: 3, viz: <O.QuotaBar value={40} max={60} />, note: <>Industry avg <O.KpiStrong>32%</O.KpiStrong></> },
          { label: 'Click rate', period: 'all', value: '4.3%', delta: -1, viz: <O.WaffleGrid filled={43} total={1000} cells={120} />, note: <><O.KpiStrong>9,412</O.KpiStrong> clicks</> },
          { label: 'Unsubscribes', period: 'rate', value: '0.2%', delta: -8, good: 'down', viz: <O.RangeMarker min={0} max={1} value={0.2} previous={0.3} unit="%" />, note: 'Below the 0.5% limit' },
        ]} />
        <O.HStack justify="between" wrap>
          <O.SegmentedControl size="sm" value={st} onChange={setSt} options={[{ value: 'all', label: 'All' }, { value: 'Live', label: 'Live' }, { value: 'Scheduled', label: 'Scheduled' }, { value: 'Draft', label: 'Draft' }]} />
        </O.HStack>
        <O.Card padding="none">
          <O.Table label="Campaigns" rows={rows} rowKey={(c) => c.id} onRowClick={(c) => open('mkt-campaign', { id: c.id })} columns={[
            { key: 'n', header: 'Campaign', render: (c) => <O.VStack gap={0}><O.Text as="span" size="sm" weight="medium">{c.name}</O.Text><O.Text as="span" size="xs" tone="muted">{c.channel} · {c.date}</O.Text></O.VStack> },
            { key: 's', header: 'Status', render: (c) => <O.StatusChip size="sm" variant="dot" tone={campStatus[c.status]}>{c.status}</O.StatusChip> },
            { key: 'o', header: 'Open', align: 'right', hideBelow: 'sm', render: (c) => (c.open ? `${c.open}%` : '—') },
            { key: 'c', header: 'Click', align: 'right', hideBelow: 'md', render: (c) => (c.click ? `${c.click}%` : '—') },
            { key: 'r', header: 'Revenue', align: 'right', sortValue: (c) => c.revenue, render: (c) => (c.revenue ? money(c.revenue) : '—') },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Campaign report
export function MktCampaignScreen() {
  const { params, open } = useScreenNav();
  const c = campaigns.find((x) => x.id === params.id) ?? campaigns[1];
  const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, values: { opens: Math.round(400 * Math.exp(-((i - 9) ** 2) / 18) + 40), clicks: Math.round(80 * Math.exp(-((i - 10) ** 2) / 20) + 6), bounces: 2 + (i % 4) } }));
  return (
    <Screen product={signal} active="campaigns" topbar={<O.HStack gap={2}><O.IconButton size="sm" label="Back" icon={<ArrowLeft />} onClick={() => open('mkt-campaigns')} /><O.Text weight="medium">{c.name}</O.Text></O.HStack>}>
      <Page title={c.name} subtitle={`${c.channel} · sent ${c.date} · ${c.sent.toLocaleString('en-US')} recipients`} actions={<><O.StatusChip variant="dot" tone={campStatus[c.status]}>{c.status}</O.StatusChip><O.Button iconStart={<Copy />}>Duplicate</O.Button></>}>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)" stretch>
          {[
            ['Opened', c.open || 41.2, O.seriesColors.blue],
            ['Clicked', c.click || 6.8, O.seriesColors.violet],
            ['Converted', 1.9, O.seriesColors.green],
          ].map(([l, v, col]) => (
            <O.Well key={l as string} title={l as string} fill>
              <O.Card grow>
                <O.VStack gap={2} align="center">
                  <O.RingScore value={Number(v)} max={l === 'Opened' ? 100 : 20} segments={[{ value: Number(v), color: col as string }]} center={`${v}%`} size={112} />
                </O.VStack>
              </O.Card>
            </O.Well>
          ))}
        </Cols>
        <O.Well title="Engagement by hour" subtitle="Bounces below the line">
          <O.Card>
            <O.StackedBarChart label="Engagement by hour" data={hours} series={[{ key: 'opens', label: 'Opens', color: O.seriesColors.blue }, { key: 'clicks', label: 'Clicks', color: O.seriesColors.violet }]} negative={{ key: 'bounces', label: 'Bounces', color: O.seriesColors.pink }} height={200} />
          </O.Card>
        </O.Well>
        <O.Well title="Top links">
          <O.Card padding="none">
            <O.Table label="Links" compact rows={[['Shop the glaze', 2140], ['Ash Grey mug', 1290], ['Studio tour video', 640]]} rowKey={(r) => r[0] as string} columns={[{ key: 'l', header: 'Link', render: (r) => <O.HStack gap={2}><Link2 size={14} />{r[0]}</O.HStack> }, { key: 'c', header: 'Clicks', align: 'right', render: (r) => (r[1] as number).toLocaleString('en-US') }]} />
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Email builder: blocks + live preview
type Block = { id: string; kind: 'heading' | 'text' | 'image' | 'button'; text: string };
export function MktEmailScreen() {
  const toast = O.useToast();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b1', kind: 'image', text: '' },
    { id: 'b2', kind: 'heading', text: 'Autumn glazes are here' },
    { id: 'b3', kind: 'text', text: 'Ash Grey, Cobalt and Celadon — thrown and glazed by hand in Lisbon.' },
    { id: 'b4', kind: 'button', text: 'Shop the glaze' },
  ]);
  const [sel, setSel] = useState('b2');
  const [device, setDevice] = useState('desktop');
  const [send, setSend] = useState(false);
  const cur = blocks.find((b) => b.id === sel);
  const add = (kind: Block['kind']) => {
    const id = 'b' + Date.now();
    setBlocks((b) => [...b, { id, kind, text: kind === 'button' ? 'Click me' : kind === 'heading' ? 'New heading' : kind === 'text' ? 'Write something.' : '' }]);
    setSel(id);
  };
  return (
    <Screen product={signal} active="emails" topbar={<O.HStack gap={2}><O.Text weight="medium">Autumn glaze launch</O.Text><O.Badge>Draft</O.Badge></O.HStack>}>
      <Page max={1320}>
        <Cols template="240px minmax(0, 1fr) 280px">
          <O.Well title="Blocks">
            <O.Card padding="sm">
              <O.VStack gap={1}>
                {([['heading', 'Heading', Type], ['text', 'Text', Type], ['image', 'Image', ImageIcon], ['button', 'Button', MousePointerClick]] as const).map(([k, l, I]) => (
                  <O.Button key={k} variant="ghost" fullWidth iconStart={<I />} onClick={() => add(k)} xstyle={undefined}>
                    <span style={{ flex: 1, textAlign: 'left' }}>Add {l.toLowerCase()}</span>
                  </O.Button>
                ))}
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.Well title="Preview" actions={<O.SegmentedControl size="sm" value={device} onChange={setDevice} options={[{ value: 'desktop', label: 'Desktop', icon: <Monitor size={13} /> }, { value: 'mobile', label: 'Mobile', icon: <Smartphone size={13} /> }]} />}>
            <O.Card>
              <div style={{ maxWidth: device === 'mobile' ? 340 : 560, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 14, transition: 'max-width 360ms cubic-bezier(.32,.72,0,1)' }}>
                {blocks.map((b) => (
                  <div key={b.id} role="button" tabIndex={0} onClick={() => setSel(b.id)} onKeyDown={(e) => e.key === 'Enter' && setSel(b.id)} style={{ borderRadius: 12, outline: sel === b.id ? `2px solid ${O.accent.base}` : '1px dashed transparent', outlineOffset: 4, cursor: 'pointer' }}>
                    {b.kind === 'image' && <O.AspectRatio ratio={16 / 7}><img src={sampleImages[0].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></O.AspectRatio>}
                    {b.kind === 'heading' && <O.Heading level={2} size="h2">{b.text}</O.Heading>}
                    {b.kind === 'text' && <O.Text>{b.text}</O.Text>}
                    {b.kind === 'button' && <O.Button variant="primary">{b.text}</O.Button>}
                  </div>
                ))}
              </div>
            </O.Card>
          </O.Well>
          <O.Well title="Block">
            <O.Card>
              {cur ? (
                <O.VStack gap={3}>
                  <O.Badge>{cur.kind}</O.Badge>
                  {cur.kind !== 'image' && <O.Field label="Text"><O.TextArea rows={3} value={cur.text} onChange={(e) => setBlocks((bs) => bs.map((b) => (b.id === cur.id ? { ...b, text: e.target.value } : b)))} /></O.Field>}
                  <O.HStack gap={2}>
                    <O.Button size="sm" onClick={() => setBlocks((bs) => { const i = bs.findIndex((b) => b.id === cur.id); if (i < 1) return bs; const n = [...bs]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}>Move up</O.Button>
                    <O.Button size="sm" variant="ghost" onClick={() => setBlocks((bs) => bs.filter((b) => b.id !== cur.id))}>Remove</O.Button>
                  </O.HStack>
                </O.VStack>
              ) : (
                <O.EmptyState bordered={false} title="Select a block" />
              )}
            </O.Card>
            <O.Button variant="primary" fullWidth iconStart={<Send />} onClick={() => setSend(true)}>Schedule</O.Button>
          </O.Well>
        </Cols>
      </Page>
      <O.Dialog open={send} onClose={() => setSend(false)} title="Schedule campaign" description="Sent in each recipient’s time zone." footer={<><O.Button onClick={() => setSend(false)}>Cancel</O.Button><O.Button variant="primary" onClick={() => (setSend(false), toast({ title: 'Scheduled for Nov 24, 09:00', tone: 'success' }))}>Schedule</O.Button></>}>
        <O.VStack gap={4}>
          <O.Field label="Audience"><O.Select defaultValue="vip" options={[{ value: 'all', label: 'All subscribers · 48,210' }, { value: 'vip', label: 'VIP customers · 3,120' }]} /></O.Field>
          <O.Field label="Send at"><O.DateTimeInput /></O.Field>
        </O.VStack>
      </O.Dialog>
    </Screen>
  );
}

// ───────── Audiences with power search
export function MktAudiencesScreen() {
  const [filters, setFilters] = useState<O.PowerFilter[]>([{ field: 'country', op: 'is', value: 'Portugal' }]);
  const [q, setQ] = useState('');
  const size = useMemo(() => Math.round(48210 * Math.pow(0.42, filters.length) * (q ? 0.3 : 1)), [filters, q]);
  return (
    <Screen product={signal} active="audiences" topbar={<O.Text weight="medium">Audiences</O.Text>}>
      <Page title="Audiences" subtitle="Build a segment from customer traits and behaviour." actions={<O.Button variant="primary" iconStart={<Users />}>Save segment</O.Button>}>
        <O.PowerSearch query={q} onQueryChange={setQ} filters={filters} onFiltersChange={setFilters} fields={[{ id: 'country', label: 'Country', options: ['Portugal', 'Germany', 'United Kingdom', 'Japan'] }, { id: 'orders', label: 'Orders', options: ['0', '1', '2–5', '6+'] }, { id: 'source', label: 'Source', options: ['Newsletter', 'Instagram', 'Search'] }]} />
        <Cols template="minmax(0, 1.4fr) minmax(0, 1fr)" stretch>
          <O.Well title="Segment size" fill>
            <O.Card grow>
              <O.VStack gap={3}>
                <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.04em' }}><O.AnimatedNumber value={size} /></span>
                <O.ProgressBar value={size} max={48210} label="Of all subscribers" />
                <O.Text size="sm" tone="muted">Estimated reach · {filters.length} filters</O.Text>
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.UsageMeter title="Where they came from" total={size || 1} format={(n) => Math.round(n).toLocaleString('en-US')} segments={[{ label: 'Newsletter', value: size * 0.46, color: O.seriesColors.blue }, { label: 'Instagram', value: size * 0.31, color: O.seriesColors.pink }, { label: 'Search', value: size * 0.18, color: O.seriesColors.teal }]} />
        </Cols>
        <O.Well title="Saved segments">
          <O.Card padding="none">
            <O.List boxed={false}>
              {['VIP customers · 3,120', 'Lapsed 90 days · 8,412', 'Portugal · first order · 1,204'].map((s, i) => (
                <O.ListItem key={s} last={i === 2} leading={<Users size={16} />} title={s.split(' · ')[0]} subtitle={`${s.split(' · ').slice(1).join(' · ')} people`} trailing={<O.Badge variant="outline">Updated daily</O.Badge>} />
              ))}
            </O.List>
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Content calendar
export function MktCalendarScreen() {
  const toast = O.useToast();
  const [events, setEvents] = useState<O.CalEvent[]>([
    { id: '1', date: new Date(2026, 10, 3), title: 'Newsletter #42', tone: 'accent', time: '09:00' },
    { id: '2', date: new Date(2026, 10, 4), title: 'Autumn glaze launch', tone: 'success' },
    { id: '3', date: new Date(2026, 10, 12), title: 'Instagram reel', tone: 'neutral', time: '18:00' },
    { id: '4', date: new Date(2026, 10, 18), title: 'BF prep review', tone: 'warning' },
    { id: '5', date: new Date(2026, 10, 24), title: 'Early access email', tone: 'accent', time: '09:00' },
    { id: '6', date: new Date(2026, 10, 27), title: 'Black Friday', tone: 'danger' },
    { id: '7', date: new Date(2026, 10, 27), title: 'Ads go live', tone: 'accent' },
    { id: '8', date: new Date(2026, 10, 27), title: 'Stock check', tone: 'neutral' },
  ]);
  const [pick, setPick] = useState<O.CalEvent | null>(null);
  return (
    <Screen product={signal} active="calendar" topbar={<O.Text weight="medium">Calendar</O.Text>}>
      <Page max={1280}>
        <O.EventCalendar events={events} onEventClick={setPick} onDayClick={(d) => (setEvents((e) => [...e, { id: String(Date.now()), date: d, title: 'New post', tone: 'accent' }]), toast({ title: `Draft post added on ${O.fmtDate(d)}` }))} />
      </Page>
      <O.Drawer open={!!pick} onClose={() => setPick(null)} title={pick?.title ?? ''} description={pick ? `${O.fmtDate(pick.date)}${pick.time ? ' · ' + pick.time : ''}` : ''} footer={<O.Button variant="danger" onClick={() => (pick && setEvents((e) => e.filter((x) => x.id !== pick.id)), setPick(null))}>Delete</O.Button>}>
        <O.VStack gap={4}>
          <O.Field label="Channel"><O.Select defaultValue="email" options={[{ value: 'email', label: 'Email' }, { value: 'ig', label: 'Instagram' }, { value: 'ads', label: 'Ads' }]} /></O.Field>
          <O.Field label="Owner"><O.Select defaultValue="Jonas Weber" options={['Jonas Weber', 'Mira Chen'].map((n) => ({ value: n, label: n }))} /></O.Field>
          <O.Field label="Notes"><O.TextArea rows={4} placeholder="Brief, links, assets…" /></O.Field>
        </O.VStack>
      </O.Drawer>
    </Screen>
  );
}

// ───────── Forms (signup forms)
export function MktFormsScreen() {
  const [sel, setSel] = useState('popup');
  const [fields, setFields] = useState(['Email', 'First name']);
  return (
    <Screen product={signal} active="forms" topbar={<O.Text weight="medium">Forms</O.Text>}>
      <Page title="Signup forms" subtitle="Collect subscribers on your site.">
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)">
          <O.VStack gap={3}>
            <O.Text weight="medium">Layout</O.Text>
            <O.VStack gap={2}>
              {[['popup', 'Pop-up', 'Shows after 8 seconds on page'], ['embed', 'Embedded', 'Sits inside a page section'], ['bar', 'Top bar', 'Thin banner at the top']].map(([id, t, d]) => (
                <O.SelectableCard key={id} selected={sel === id} onSelect={() => setSel(id)} title={t} description={d} />
              ))}
            </O.VStack>
            <O.Field label="Fields" help="Email is always required"><O.MultiSelect value={fields} onChange={(v) => setFields(v.includes('Email') ? v : ['Email', ...v])} options={['Email', 'First name', 'Last name', 'Birthday', 'Country'].map((f) => ({ value: f, label: f }))} /></O.Field>
          </O.VStack>
          <O.Well title="Live preview">
            <O.Card>
              <O.VStack gap={3}>
                <O.Heading level={3} size="h3">Join the studio list</O.Heading>
                <O.Text size="sm" tone="muted">New glazes and studio sales, twice a month.</O.Text>
                {fields.map((f) => (
                  <O.Field key={f} label={f}><O.TextInput type={f === 'Email' ? 'email' : 'text'} /></O.Field>
                ))}
                <O.Button variant="primary" fullWidth iconStart={<Mail />}>Subscribe</O.Button>
              </O.VStack>
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── A/B test results
export function MktAbTestScreen() {
  const toast = O.useToast();
  return (
    <Screen product={signal} active="experiments" topbar={<O.Text weight="medium">Experiments</O.Text>}>
      <Page title="Subject line test" subtitle="Autumn glaze launch · 20% of list · ran 4 hours" actions={<O.Button variant="primary" iconStart={<Trophy />} onClick={() => toast({ title: 'Variant B sent to the remaining 80%', tone: 'success' })}>Send winner</O.Button>} max={1080}>
        <O.Banner tone="success" title="Variant B is winning with 97% confidence">Open rate +6.1 points over variant A.</O.Banner>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)" stretch>
          {[['A', '“New autumn glazes inside”', 35.1, 4.2, false], ['B', '“Ash Grey just landed — 48 mugs only”', 41.2, 6.8, true]].map(([v, s, o, c, win]) => (
            <O.Well key={v as string} title={`Variant ${v}`} subtitle={s as string} actions={win ? <O.Badge tone="success">Winner</O.Badge> : undefined} fill>
              <O.Card grow>
                <O.VStack gap={4}>
                  <O.ProgressBar label="Open rate" value={o as number} tone={win ? 'success' : 'neutral'} thick />
                  <O.ProgressBar label="Click rate" value={(c as number) * 5} tone={win ? 'success' : 'neutral'} thick />
                  <O.Text size="sm" tone="muted">4,821 recipients</O.Text>
                </O.VStack>
              </O.Card>
            </O.Well>
          ))}
        </Cols>
        <O.Well title="Opens over time">
          <O.Card>
            <O.LineChart label="Opens" labels={['0h', '1h', '2h', '3h', '4h']} series={[{ name: 'A', values: [0, 820, 1310, 1590, 1692], color: O.colors.borderStrong, dashed: true }, { name: 'B', values: [0, 960, 1560, 1880, 1986] }]} />
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── UTM link builder
export function MktUtmScreen() {
  const [url, setUrl] = useState('https://kiln.shop/glazes');
  const [src, setSrc] = useState('newsletter');
  const [med, setMed] = useState('email');
  const [camp, setCamp] = useState('autumn-glaze');
  const full = `${url}${url.includes('?') ? '&' : '?'}utm_source=${encodeURIComponent(src)}&utm_medium=${encodeURIComponent(med)}&utm_campaign=${encodeURIComponent(camp)}`;
  const { copied, copy } = O.useClipboard();
  return (
    <Screen product={signal} active="links" topbar={<O.Text weight="medium">Link builder</O.Text>}>
      <Page title="Link builder" subtitle="Tag links so campaigns show up in Overview." max={760}>
        <O.Well>
          <O.Card>
            <O.VStack gap={4}>
              <O.Field label="Page URL"><O.TextInput type="url" value={url} onChange={(e) => setUrl(e.target.value)} /></O.Field>
              <O.Grid min={180} gap={3}>
                <O.Field label="Source"><O.TextInput value={src} onChange={(e) => setSrc(e.target.value)} /></O.Field>
                <O.Field label="Medium"><O.Select value={med} onChange={setMed} options={['email', 'social', 'cpc', 'referral'].map((v) => ({ value: v, label: v }))} /></O.Field>
                <O.Field label="Campaign"><O.TextInput value={camp} onChange={(e) => setCamp(e.target.value)} /></O.Field>
              </O.Grid>
            </O.VStack>
          </O.Card>
          <O.Card padding="sm">
            <O.HStack gap={2}>
              <O.Text size="sm" mono><span style={{ overflowWrap: 'anywhere' }}>{full}</span></O.Text>
              <span style={{ marginLeft: 'auto' }}><O.Button size="sm" variant="primary" iconStart={copied ? <Check /> : <Copy />} onClick={() => copy(full)}>{copied ? 'Copied' : 'Copy'}</O.Button></span>
            </O.HStack>
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}
