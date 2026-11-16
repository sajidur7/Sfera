import { useState } from 'react';
import { CircleDollarSign, Clock, DollarSign, Layers, RotateCcw, ShoppingBasket, Target, Users, IceCreamCone } from 'lucide-react';
import {
  Button,
  ConditionBuilder,
  Grid,
  InsightCard,
  InsightMention,
  InsightNumber,
  KpiStrip,
  KpiStrong,
  QuotaBar,
  RangeMarker,
  SegmentedControl,
  SparkBars,
  StackedBarChart,
  StatTile,
  TrendCard,
  UsageMeter,
  WaffleGrid,
  VStack,
  HStack,
  Text,
  seriesColors,
  useToast,
  type Condition,
} from '../../sfera';

// #region StatTilesExample
export function StatTilesExample() {
  return (
    <Grid columns={2} gap={3}>
      <StatTile icon={<CircleDollarSign size={20} />} color={seriesColors.blue} label="Total revenue" value="$152,313.92" delta={16} info="Gross sales before refunds and fees." />
      <StatTile icon={<ShoppingBasket size={20} />} color={seriesColors.amber} label="Total orders" value="25,162" delta={20} info="Orders placed, including drafts converted to orders." />
      <StatTile icon={<Users size={20} />} color={seriesColors.violet} label="New customers" value="3,847" delta={8.1} info="First order in this period." />
      <StatTile icon={<RotateCcw size={20} />} color={seriesColors.pink} label="Refunds" value="$4,209.44" delta={-2.4} good="up" info="Money returned to customers." />
    </Grid>
  );
}
// #endregion

// #region KpiStripExample
export function KpiStripExample() {
  return (
    <KpiStrip
      items={[
        { icon: <Layers size={14} />, label: 'Pipeline', period: 'Q4', value: '$1.24M', delta: 12, viz: <QuotaBar value={1.24} max={1.5} />, note: <><KpiStrong>83%</KpiStrong> of the $1.5M quota</> },
        { icon: <DollarSign size={14} />, label: 'Won', period: '30 days', value: '$212k', delta: 8, viz: <SparkBars values={[3, 9, 1, 2, 8, 8, 7, 7, 2, 1, 2, 4, 5, 2, 5, 3, 1, 6, 2, 2, 2, 1, 6, 6, 2, 5, 2]} />, note: <>Best day <KpiStrong>$13.9k</KpiStrong> · Oct 16</> },
        { icon: <Target size={14} />, label: 'Win rate', period: '30 days', value: '34%', delta: 6, viz: <WaffleGrid filled={112} total={329} />, note: <><KpiStrong>112</KpiStrong> won of 329 closed</> },
        { icon: <Clock size={14} />, label: 'Avg cycle', period: 'vs Q3', value: '41 days', delta: -9, good: 'down', viz: <RangeMarker min={30} max={60} value={41} previous={45} />, note: <><KpiStrong>4 days</KpiStrong> faster than last quarter</> },
      ]}
    />
  );
}
// #endregion

// #region UsageMeterExample
export function UsageMeterExample() {
  const toast = useToast();
  const [compact, setCompact] = useState(false);
  const k = compact ? 0.45 : 1;
  return (
    <div style={{ maxWidth: 420, width: '100%' }}>
      <UsageMeter
        title="Context"
        total={200_000}
        action={<Button size="sm" variant="secondary" onClick={() => (setCompact(!compact), toast({ title: compact ? 'Context restored' : 'Context compacted', tone: 'success' }))}>{compact ? 'Restore' : 'Compact'}</Button>}
        segments={[
          { label: 'Chat', value: 92_000 * k, color: seriesColors.teal },
          { label: 'Files', value: 58_000 * k, color: seriesColors.blue },
          { label: 'Tools', value: 15_000 * k, color: seriesColors.violet },
          { label: 'System', value: 5_600, color: seriesColors.pink },
          { label: 'Memory', value: 5_000, color: seriesColors.green },
        ]}
      />
    </div>
  );
}
// #endregion

// #region StackedBarsExample
export function StackedBarsExample() {
  const [mode, setMode] = useState('day');
  const n = mode === 'day' ? 20 : 12;
  const data = Array.from({ length: n }, (_, i) => {
    const s = Math.sin(i * 1.7) * 0.5 + 1;
    return { label: mode === 'day' ? `Oct ${i + 1}` : `W${i + 30}`, values: { direct: Math.round(300 * s + 120), search: Math.round(260 * s + 90), social: Math.round(120 * s), referral: Math.round(90 * s + 20), bounced: Math.round(12 + (i % 5) * 4) } };
  });
  const total = data.reduce((a, d) => a + d.values.direct + d.values.search + d.values.social + d.values.referral, 0);
  return (
    <VStack gap={3}>
      <HStack justify="between" align="start">
        <VStack gap={0}>
          <Text weight="medium">Traffic</Text>
          <Text size="sm" tone="muted">Last {n} {mode === 'day' ? 'days' : 'weeks'}</Text>
        </VStack>
        <SegmentedControl size="sm" value={mode} onChange={setMode} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]} />
      </HStack>
      <Text size="lg"><span style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.04em' }}>{total.toLocaleString('en-US')}</span> visits</Text>
      <StackedBarChart
        label="Traffic by source"
        data={data}
        series={[
          { key: 'direct', label: 'Direct', color: seriesColors.violet },
          { key: 'search', label: 'Search', color: seriesColors.blue },
          { key: 'social', label: 'Social', color: seriesColors.slate },
          { key: 'referral', label: 'Referral', color: seriesColors.amber },
        ]}
        negative={{ key: 'bounced', label: 'Bounced', color: seriesColors.pink }}
      />
    </VStack>
  );
}
// #endregion

// #region TrendCardExample
export function TrendCardExample() {
  const walk = (n: number, seed: number, drift: number) => {
    let v = 57630;
    return Array.from({ length: n }, (_, i) => (v += Math.sin(i * seed) * 90 + drift));
  };
  return (
    <div style={{ maxWidth: 380, width: '100%' }}>
      <TrendCard label="Portfolio" ranges={{ '1H': walk(12, 2.1, 6), '4H': walk(18, 1.3, 20), '1D': walk(30, 0.9, 41) }} />
    </div>
  );
}
// #endregion

// #region InsightCardExample
export function InsightCardExample() {
  const toast = useToast();
  return (
    <div style={{ maxWidth: 520, width: '100%' }}>
      <InsightCard
        suggestion="Should I rebalance the glazes?"
        onSuggest={() => toast({ title: 'Asked the assistant', description: 'Opening a chat with this insight attached.' })}
        insights={[
          {
            text: <>The weakest line in <InsightMention color={seriesColors.amber}>@Kiln studio</InsightMention> is Ash Grey, down <InsightNumber>−6%</InsightNumber> or <InsightNumber>−$2,453.44</InsightNumber>.</>,
            compare: [{ label: 'Ash Grey', color: seriesColors.amber, pct: -4.41, amount: -2377.66 }, { label: 'Cobalt', color: seriesColors.blue, pct: 1.15, amount: 617.22 }],
          },
          {
            text: <>Cobalt mugs sold <InsightNumber tone="pos">+18%</InsightNumber> after the newsletter on Tuesday.</>,
            compare: [{ label: 'Cobalt', color: seriesColors.blue, pct: 18.2, amount: 4120 }, { label: 'Celadon', color: seriesColors.green, pct: 3.4, amount: 812.5 }],
            trend: [{ color: seriesColors.blue, values: [3, 4, 4, 6, 9, 11, 12] }, { color: seriesColors.green, values: [5, 5, 6, 5, 6, 7, 7] }],
          },
          {
            text: <>Refunds are flat week over week at <InsightNumber tone="pos">0.9%</InsightNumber> of orders.</>,
            compare: [{ label: 'This week', color: seriesColors.violet, pct: 0.1, amount: 12.4 }, { label: 'Last week', color: seriesColors.slate, pct: -0.3, amount: -40 }],
            trend: [{ color: seriesColors.violet, values: [2, 3, 2, 3, 2, 3, 2] }],
          },
        ]}
      />
    </div>
  );
}
// #endregion

// #region ConditionBuilderExample
export function ConditionBuilderExample() {
  const [conds, setConds] = useState<Condition[]>([
    { id: 'a', field: 'glaze', value: 'ash' },
    { id: 'b', field: 'size', value: 'large' },
  ]);
  return (
    <VStack gap={3}>
      <ConditionBuilder
        entity="order"
        entityIcon={<IceCreamCone size={14} />}
        conditions={conds}
        onChange={setConds}
        fields={[
          { id: 'glaze', label: 'glaze', options: [{ value: 'ash', label: 'Ash Grey', color: seriesColors.amber }, { value: 'cobalt', label: 'Cobalt', color: seriesColors.blue }, { value: 'celadon', label: 'Celadon', color: seriesColors.green }] },
          { id: 'size', label: 'size', options: [{ value: 'small', label: 'Small' }, { value: 'large', label: 'Large' }] },
          { id: 'country', label: 'country', options: [{ value: 'pt', label: 'Portugal' }, { value: 'de', label: 'Germany' }] },
        ]}
      />
      <Text size="sm" tone="muted" mono>{conds.map((c) => `${c.field} = ${c.value}`).join(' AND ')}</Text>
    </VStack>
  );
}
// #endregion
