import { useState } from 'react';
import { BarChart, Card, CardHeader, DateStepper, Heatmap, HStack, LineChart, Meter, MetadataList, RingScore, SegmentedControl, Text, VStack, colors } from '../../sfera';
import { levels } from '../../data/mock';

// #region BarChartExample
export function BarChartExample() {
  const [week, setWeek] = useState(0);
  const base = [6200, 2300, 1900, 6500, 7400, 5600, 3200];
  const data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({ label, value: base[(i + week + 7) % 7] }));
  return (
    <Card>
      <CardHeader
        eyebrow="Steps"
        value={data.reduce((a, d) => a + d.value, 0).toLocaleString('en-US')}
        unit="total steps"
        actions={<DateStepper onChange={(s) => setWeek(Math.round(s.getTime() / 6.048e8) % 7)} />}
      />
      <BarChart data={data} height={160} label="Steps per day" />
    </Card>
  );
}
// #endregion

// #region RingScoreExample
export function RingScoreExample() {
  return (
    <HStack gap={6} wrap justify="center" align="center">
      <RingScore
        value={98}
        segments={[
          { value: 49, color: '#8B5CF6' },
          { value: 29, color: '#E0457B' },
          { value: 20, color: '#3B82F6' },
        ]}
      />
      <RingScore value={72} size={96} thickness={9} caption="health" />
      <div style={{ minWidth: 200 }}>
        <MetadataList
          alignValues="right"
          items={[
            { label: 'Duration: 7h 50m', value: '49/50' },
            { label: 'Bedtime: 20m earlier', value: '29/30' },
            { label: 'Interruptions', value: '20/20' },
          ]}
        />
      </div>
    </HStack>
  );
}
// #endregion

// #region HeatmapExample
export function HeatmapExample() {
  const [range, setRange] = useState('weekly');
  const weeks = range === 'weekly' ? 26 : range === 'monthly' ? 40 : 52;
  return (
    <VStack gap={3}>
      <HStack justify="between" wrap>
        <Text size="sm" tone="muted">Token usage</Text>
        <SegmentedControl size="sm" value={range} onChange={setRange} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} />
      </HStack>
      <Heatmap values={levels(weeks * 7, weeks)} label="Token usage heatmap" unit="M tokens" />
    </VStack>
  );
}
// #endregion

// #region LineChartExample
export function LineChartExample() {
  const labels = Array.from({ length: 14 }, (_, i) => `Nov ${i + 1}`);
  return (
    <LineChart
      label="Visitors and signups"
      labels={labels}
      series={[
        { name: 'Visitors', values: [420, 480, 460, 530, 610, 590, 640, 700, 680, 760, 820, 790, 860, 910] },
        { name: 'Last period', values: [380, 400, 430, 420, 470, 500, 480, 520, 560, 540, 600, 620, 610, 650], color: colors.borderStrong, dashed: true },
      ]}
    />
  );
}
// #endregion

// #region MeterExample
export function MeterExample() {
  return (
    <HStack gap={5} justify="center">
      <HStack gap={2}><Meter level={4} label="High confidence" /><Text size="sm">High confidence</Text></HStack>
      <HStack gap={2}><Meter level={2} label="Medium confidence" /><Text size="sm">Medium</Text></HStack>
    </HStack>
  );
}
// #endregion
