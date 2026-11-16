import { ArrowRight, Download, Plus } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Button, Card, CardHeader, Center, CollapsibleGroup, DateStepper, Field, FormLayout, Grid, GridItem, HStack, MetadataList, PageHeader, ProgressBar, SparkBars, Resizable, RingScore, ScrollableArea, Section, SelectableCard, Text, TextInput, VStack, Well, useToast } from '../../sfera';

// #region WellExample
export function WellExample() {
  return (
    <Grid min={240} gap={3}>
      <Well title="Steps" subtitle="Last 7 days" actions={<DateStepper />}>
        <Card>
          <CardHeader value="31,600" unit="total steps" />
          <BarChart
            height={208}
            data={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ label: d, value: [6200, 2300, 1900, 6500, 7400, 5600, 3200][i] }))}
          />
        </Card>
      </Well>
      <Well title="Sleep score" subtitle="Excellent">
        <Card>
          <VStack align="center" gap={3}>
            <RingScore value={98} caption="of 100" />
            <MetadataList
              alignValues="right"
              items={[
                { label: 'Duration', value: '7h 50m' },
                { label: 'Bedtime', value: '20m earlier' },
                { label: 'Interruptions', value: '1' },
              ]}
            />
          </VStack>
        </Card>
      </Well>
    </Grid>
  );
}
// #endregion

// #region CardExample
export function CardExample() {
  const toast = useToast();
  return (
    <Grid min={200} gap={3}>
      <Card>
        <VStack gap={3}>
          <CardHeader eyebrow="Revenue" value="$48,210" subtitle="+12% vs last month" />
          <SparkBars values={[18, 24, 21, 30, 27, 36, 33]} />
          <HStack gap={2} justify="between">
            <Text size="sm" tone="muted">Best day</Text>
            <Text size="sm" weight="medium">Sat · $8,640</Text>
          </HStack>
        </VStack>
      </Card>
      <Card>
        <VStack gap={3} grow>
          <CardHeader title="Plan" subtitle="Team · renews 1 Dec 2026" actions={<Button size="sm">Manage</Button>} />
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProgressBar value={18} max={24} label="18 of 24 seats" />
            <HStack gap={2} justify="between">
              <Text size="sm" tone="muted">6 seats free</Text>
              <Text size="sm" weight="medium">$12 / seat</Text>
            </HStack>
          </div>
        </VStack>
      </Card>
      <Card onClick={() => toast({ title: 'Opening 3 unpaid invoices' })}>
        <VStack gap={3}>
          <CardHeader title="Unpaid invoices" subtitle="The whole card is a button" />
          <VStack gap={1}>
            {[['Northwind', '$2,400'], ['Kiln Studio', '$1,320'], ['Lea Moss', '$400']].map(([who, amt]) => (
              <HStack key={who} gap={2} justify="between">
                <Text size="sm" tone="muted">{who}</Text>
                <Text size="sm" numeric>{amt}</Text>
              </HStack>
            ))}
          </VStack>
          <HStack gap={2} justify="between" align="center">
            <Text size="sm" weight="medium">3 due · $4,120</Text>
            <ArrowRight size={16} aria-hidden />
          </HStack>
        </VStack>
      </Card>
    </Grid>
  );
}
// #endregion

// #region StackExample
export function StackExample() {
  const box = (t: string) => (
    <div style={{ padding: '8px 12px', borderRadius: 10, border: '1px dashed currentColor', opacity: 0.6, fontSize: 13 }}>{t}</div>
  );
  return (
    <VStack gap={4}>
      <HStack gap={2} wrap>{['One', 'Two', 'Three'].map(box)}</HStack>
      <HStack justify="between">{box('Start')}{box('End')}</HStack>
      <VStack gap={1}>{['Stacked', 'Vertically'].map(box)}</VStack>
    </VStack>
  );
}
// #endregion

// #region GridExample
export function GridExample() {
  return (
    <Grid columns={4} gap={2}>
      {['Leads', 'Qualified', 'Won', 'Lost'].map((t, i) => (
        <Card key={t} padding="sm">
          <CardHeader eyebrow={t} value={[412, 128, 46, 19][i]} />
        </Card>
      ))}
      <GridItem span={3}>
        <Card padding="sm">
          <CardHeader eyebrow="Spans 3 columns" value="$1.2M" />
        </Card>
      </GridItem>
      <Card padding="sm">
        <CardHeader eyebrow="Win rate" value="36%" />
      </Card>
    </Grid>
  );
}
// #endregion

// #region PageHeaderExample
export function PageHeaderExample() {
  return (
    <PageHeader
      title="Companies"
      subtitle="1,204 records · synced 2 minutes ago"
      actions={
        <HStack gap={2}>
          <Button iconStart={<Download size={15} />}>Export</Button>
          <Button variant="primary" iconStart={<Plus size={15} />}>New company</Button>
        </HStack>
      }
    />
  );
}
// #endregion

// #region SectionExample
export function SectionExample() {
  return (
    <Section title="Open deals" subtitle="2 closing this month" actions={<Button size="sm">View pipeline</Button>}>
      <Center minHeight={96}>
        <Text tone="muted">Center puts content in the middle of its box.</Text>
      </Center>
    </Section>
  );
}
// #endregion

// #region FormLayoutExample
export function FormLayoutExample() {
  return (
    <FormLayout
      sections={[
        { title: 'Workspace', description: 'Shown in invites and the sidebar.', content: <><Field label="Name"><TextInput defaultValue="Northwind" /></Field><Field label="URL"><TextInput defaultValue="northwind" /></Field></> },
        { title: 'Notifications', description: 'Where we send digests.', content: <Field label="Digest email"><TextInput type="email" defaultValue="ops@northwind.com" /></Field> },
      ]}
    />
  );
}
// #endregion

// #region CollapsibleExample
export function CollapsibleExample() {
  return (
    <CollapsibleGroup
      defaultOpen={['a']}
      items={[
        { id: 'a', title: 'Can I change the accent colour?', content: 'Yes. Pick one of six presets on the Themes page, or pass defaultAccent to SferaProvider.' },
        { id: 'b', title: 'Does it work without Tailwind?', content: 'Sfera uses StyleX only. There is no Tailwind anywhere.' },
        { id: 'c', title: 'Is dark mode automatic?', content: 'It follows the system setting until the user picks light or dark.' },
      ]}
    />
  );
}
// #endregion

// #region ScrollResizeExample
export function ScrollResizeExample() {
  return (
    <Resizable
      defaultSize={38}
      start={
        <ScrollableArea maxHeight={220} label="Folders">
          <div style={{ padding: 8 }}>
            {['Inbox', 'Sent', 'Drafts', 'Archive', 'Invoices', 'Contracts', 'Receipts', 'Press', 'Hiring', 'Legal', 'Travel'].map((f) => (
              <div key={f} style={{ padding: '6px 8px', fontSize: 13 }}>{f}</div>
            ))}
          </div>
        </ScrollableArea>
      }
      end={
        <div style={{ padding: 16 }}>
          <Text weight="medium">Drag the divider</Text>
          <Text size="sm" tone="muted">Or focus it and use the arrow keys. The left pane scrolls on its own.</Text>
        </div>
      }
    />
  );
}
// #endregion

// #region SelectableCardExample
export function SelectableCardExample() {
  const [plan, setPlan] = useState('team');
  return (
    <VStack gap={2}>
      {[
        ['starter', 'Starter', 'Up to 3 seats, community support', '$0'],
        ['team', 'Team', 'Unlimited seats, SSO, priority support', '$48'],
        ['enterprise', 'Enterprise', 'Audit log, SLA, custom contract', 'Talk to us'],
      ].map(([id, t, d, p]) => (
        <SelectableCard key={id} selected={plan === id} onSelect={() => setPlan(id)} title={t} description={d} aside={p} />
      ))}
    </VStack>
  );
}
// #endregion
