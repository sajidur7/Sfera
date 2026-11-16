import * as stylex from '@stylexjs/stylex';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Calendar, Download, GitCompare, Globe, Laptop, Smartphone, Tablet } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  Heatmap,
  HStack,
  LineChart,
  ProgressBar,
  RingScore,
  SegmentedControl,
  Select,
  StatGroup,
  Table,
  Text,
  ToggleButton,
  VStack,
  Well,
  colors as C,
  useToast,
} from '../sfera';
import { colors, font } from '../sfera/tokens.stylex';
import { Screen } from './kit';
import { signal } from './products';
import { levels } from '../data/mock';

const s = stylex.create({
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1320, marginInline: 'auto' },
  head: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  title: { margin: 0, fontSize: { default: 28, '@media (max-width: 640px)': 22 }, fontWeight: 500, letterSpacing: '-0.03em', color: colors.text },
  filterbar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  row: { display: 'grid', gridTemplateColumns: { default: 'minmax(0, 2fr) minmax(0, 1fr)', '@media (max-width: 1000px)': 'minmax(0, 1fr)' }, gap: 12, alignItems: 'stretch' },
  rank: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 56px', gap: 12, alignItems: 'center', paddingBlock: 8, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  rankLast: { borderBottomWidth: 0 },
  num: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted, textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  page2: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
  path: { fontFamily: font.mono, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

const series = {
  '7d': { labels: ['Nov 9', 'Nov 10', 'Nov 11', 'Nov 12', 'Nov 13', 'Nov 14', 'Nov 15'], now: [4200, 4810, 4630, 5320, 6100, 5900, 6420], prev: [3900, 4100, 4300, 4250, 4700, 5010, 4880] },
  '30d': { labels: Array.from({ length: 30 }, (_, i) => `Oct ${i + 16 > 31 ? i - 15 : i + 16}`), now: Array.from({ length: 30 }, (_, i) => 3800 + Math.round(Math.sin(i / 3) * 600 + i * 70)), prev: Array.from({ length: 30 }, (_, i) => 3500 + Math.round(Math.cos(i / 4) * 400 + i * 40)) },
  '90d': { labels: Array.from({ length: 13 }, (_, i) => `W${i + 34}`), now: [21, 23, 22, 26, 25, 28, 31, 30, 34, 33, 37, 39, 42].map((v) => v * 1000), prev: [19, 20, 21, 21, 23, 24, 24, 26, 27, 28, 28, 30, 31].map((v) => v * 1000) },
};

export function AnalyticsScreen() {
  const toast = useToast();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [compare, setCompare] = useState(true);
  const [source, setSource] = useState('all');
  const [device, setDevice] = useState('all');
  const d = series[range];
  const k = (source === 'all' ? 1 : source === 'organic' ? 0.46 : source === 'paid' ? 0.31 : 0.23) * (device === 'all' ? 1 : device === 'desktop' ? 0.58 : device === 'mobile' ? 0.36 : 0.06);
  const now = useMemo(() => d.now.map((v) => Math.round(v * k)), [d, k]);
  const prev = useMemo(() => d.prev.map((v) => Math.round(v * k)), [d, k]);
  const total = now.reduce((a, b) => a + b, 0);
  const channels: [string, number][] = [
    ['Organic search', 38],
    ['Paid social', 18],
    ['Newsletter', 14],
    ['Referral', 11],
    ['Direct', 8],
    ['Paid search', 6],
    ['Partners', 5],
  ];
  const pages: [string, number, number][] = [
    ['/pricing', 18240, 6.2],
    ['/blog/stylex-vs-tailwind', 12410, 2.1],
    ['/', 9840, 3.4],
    ['/changelog', 5120, 1.2],
    ['/docs/install', 4380, 4.8],
  ];
  return (
    <Screen product={signal} active="overview" topbar={<Text weight="medium">Overview</Text>}>
      <div {...stylex.props(s.page)}>
        <div {...stylex.props(s.head)}>
          <VStack gap={1}>
            <h1 {...stylex.props(s.title)}>Marketing overview</h1>
            <Text size="sm" tone="muted">signal.so · all campaigns · updated 4 minutes ago</Text>
          </VStack>
          <Button iconStart={<Download size={15} />} onClick={() => toast({ title: 'Report PDF is being prepared', tone: 'success' })}>
            Export report
          </Button>
        </div>
        <div {...stylex.props(s.filterbar)} role="toolbar" aria-label="Filters">
          <SegmentedControl label="Range" value={range} onChange={(v) => setRange(v as '7d')} options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }]} />
          <Select size="sm" width="auto" label="Source" value={source} onChange={setSource} options={[{ value: 'all', label: 'All sources', icon: <Globe size={14} /> }, { value: 'organic', label: 'Organic' }, { value: 'paid', label: 'Paid' }, { value: 'email', label: 'Email' }]} />
          <Select size="sm" width="auto" label="Device" value={device} onChange={setDevice} options={[{ value: 'all', label: 'All devices', icon: <Laptop size={14} /> }, { value: 'desktop', label: 'Desktop', icon: <Laptop size={14} /> }, { value: 'mobile', label: 'Mobile', icon: <Smartphone size={14} /> }, { value: 'tablet', label: 'Tablet', icon: <Tablet size={14} /> }]} />
          <ToggleButton size="sm" pressed={compare} onPressedChange={setCompare} iconStart={<GitCompare size={14} />}>
            Compare
          </ToggleButton>
        </div>
        <StatGroup
          stats={[
            { label: 'Visitors', value: total.toLocaleString('en-US'), delta: 14 },
            { label: 'Signups', value: Math.round(total * 0.041).toLocaleString('en-US'), delta: 9 },
            { label: 'Conversion', value: '4.1%', delta: 0.6 },
            { label: 'Cost per signup', value: '$18.40', delta: -7 },
          ]}
        />
        <div {...stylex.props(s.row)}>
          <Well title="Visitors" subtitle={compare ? 'Solid: this period · dashed: previous' : 'This period'} actions={<HStack gap={1}><Calendar size={14} /><Text as="span" size="sm" tone="muted">{range}</Text></HStack>} fill>
            <Card grow>
              <CardHeader value={total.toLocaleString('en-US')} unit="visitors" />
              <LineChart
                key={range + source + device}
                label="Visitors over time"
                labels={d.labels}
                height={200}
                series={[{ name: 'This period', values: now }, ...(compare ? [{ name: 'Previous', values: prev, color: C.borderStrong, dashed: true }] : [])]}
              />
            </Card>
          </Well>
          <Well title="Top channels" subtitle="Share of visitors" fill>
            <Card grow>
              <VStack gap={4} justify="between" grow>
                {channels.map(([n, v], i) => (
                  <ProgressBar key={n} label={n} value={v} tone={i === 0 ? 'accent' : 'neutral'} />
                ))}
              </VStack>
            </Card>
          </Well>
        </div>
        <div {...stylex.props(s.row)}>
          <Well title="Top pages" subtitle="By visitors" actions={<Button size="sm" variant="ghost" iconEnd={<ArrowUpRight size={14} />} onClick={() => toast({ title: 'Full pages report is coming soon' })}>All pages</Button>} fill>
            <Card padding="none" grow>
              <Table
                label="Top pages"
                compact
                rowKey={(r) => r[0]}
                rows={pages}
                columns={[
                  { key: 'p', header: 'Page', render: (r) => <span {...stylex.props(s.path)}>{r[0]}</span> },
                  { key: 'v', header: 'Visitors', align: 'right', sortValue: (r) => r[1], render: (r) => r[1].toLocaleString('en-US') },
                  { key: 'c', header: 'Conv.', align: 'right', sortValue: (r) => r[2], render: (r) => `${r[2]}%` },
                ]}
              />
            </Card>
          </Well>
          <Well title="Goal" subtitle="Q4 signups target" fill>
            <Card grow>
              <VStack gap={3} align="center">
                <RingScore value={72} caption="of target" size={150} />
                <Text size="sm" tone="muted">7,200 of 10,000 signups</Text>
                <Text size="sm" weight="medium">Needs 61 a day to finish on time</Text>
              </VStack>
            </Card>
          </Well>
        </div>
        <Well title="Traffic by day" subtitle="Each square is a day; darker means more visitors">
          <Card>
            <Heatmap values={levels(36 * 7, range.length + k * 10)} label="Traffic by day" unit="k visitors" />
          </Card>
        </Well>
      </div>
    </Screen>
  );
}
