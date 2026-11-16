import { useState } from 'react';
import { Building2, Calendar, Globe, Users } from 'lucide-react';
import { Avatar, Badge, HStack, List, ListItem, MetadataList, OverflowList, PowerSearch, StatGroup, StatusChip, StatusSelect, Table, Text, VStack, colors, useToast, type Column, type PowerField, type PowerFilter } from '../../sfera';
import { date, money, orderStatus, orders as seed, type Order } from '../../data/mock';

// #region TableExample
export function TableExample() {
  const [rows, setRows] = useState(seed.slice(0, 5));
  const setStatus = (id: string, status: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  const columns: Column<Order>[] = [
    {
      key: 'customer',
      header: 'Customer',
      sortValue: (r) => r.customer,
      render: (r) => (
        <HStack gap={2}>
          <Avatar name={r.customer} size="sm" />
          <Text as="span" weight="medium">{r.customer}</Text>
        </HStack>
      ),
    },
    { key: 'status', header: 'Purchase', render: (r) => <StatusSelect options={orderStatus} value={r.status} onChange={(v) => setStatus(r.id, v)} /> },
    {
      key: 'delivery',
      header: 'Status',
      hideBelow: 'sm',
      render: (r) =>
        r.delivery === 'shipped' ? <StatusChip tone="success">Shipped</StatusChip> : r.delivery === 'failed' ? <StatusChip tone="danger">Delivery failed</StatusChip> : <StatusChip tone="info">Processing</StatusChip>,
    },
    { key: 'updated', header: 'Last updated', hideBelow: 'md', sortValue: (r) => r.updated, render: (r) => date(r.updated) },
    { key: 'total', header: 'Price', align: 'right', sortValue: (r) => r.total, render: (r) => money(r.total) },
  ];
  return (
    <Table
      label="Orders"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      selectable
      renderExpanded={(r) => <Text size="sm" tone="muted">{r.items} items · {r.email} · order {r.id}</Text>}
    />
  );
}
// #endregion

// #region StatGroupExample
export function StatGroupExample() {
  return (
    <StatGroup
      stats={[
        { label: 'Total tokens', value: '1.8B', delta: 12, note: 'vs last year' },
        { label: 'Peak tokens', value: '562.7M', delta: 4 },
        { label: 'Longest task', value: '12h 54m', delta: -8 },
        { label: 'Top streak', value: '62 days', note: 'Jun – Aug' },
      ]}
    />
  );
}
// #endregion

// #region MetadataExample
export function MetadataExample() {
  return (
    <MetadataList
      items={[
        { label: 'Domain', icon: <Globe size={14} />, value: 'northwind.com' },
        { label: 'Industry', icon: <Building2 size={14} />, value: <StatusChip tone="neutral" size="sm">Logistics</StatusChip> },
        { label: 'Employees', icon: <Users size={14} />, value: '1,204' },
        { label: 'Founded', icon: <Calendar size={14} />, value: '28 July 1997' },
      ]}
    />
  );
}
// #endregion

// #region StatusSelectExample
export function StatusSelectExample() {
  const [s, setS] = useState('processing');
  return (
    <VStack gap={3} align="center">
      <StatusSelect options={orderStatus} value={s} onChange={setS} />
      <Text size="sm" tone="muted">Current value: {s}</Text>
    </VStack>
  );
}
// #endregion

// #region ListExample
export function ListExample() {
  const toast = useToast();
  const rows = [
    { n: 'Lea Moss', s: 'Refund for duplicate charge', t: '9:41', u: true },
    { n: 'Sam Ito', s: 'SSO setup with Okta', t: '9:12', u: true },
    { n: 'Owen Hale', s: 'How do I add a teammate?', t: 'Mon', u: false },
  ];
  return (
    <List label="Conversations">
      {rows.map((r, i) => (
        <ListItem key={r.n} last={i === rows.length - 1} leading={<Avatar name={r.n} />} title={r.n} subtitle={r.s} trailing={<>{r.u && <Badge tone="accent">New</Badge>}{r.t}</>} onClick={() => toast({ title: `Opened ${r.n}` })} />
      ))}
    </List>
  );
}
// #endregion

// #region OverflowListExample
export function OverflowListExample() {
  const tags = ['Enterprise', 'EU region', 'SSO', 'Renewal Q4', 'Champion: Karri', 'Security review', 'Legal', 'Expansion'];
  return (
    <div style={{ width: '100%', resize: 'horizontal', overflow: 'hidden', minWidth: 160, maxWidth: '100%', padding: 8, border: `1px dashed ${colors.borderStrong}`, borderRadius: 12 }}>
      <OverflowList items={tags} label={(t) => t} render={(t) => <StatusChip size="sm" tone="neutral">{t}</StatusChip>} />
    </div>
  );
}
// #endregion

// #region PowerSearchExample
export function PowerSearchExample() {
  const [filters, setFilters] = useState<PowerFilter[]>([{ field: 'stage', op: 'is', value: 'Negotiation' }]);
  const [q, setQ] = useState('');
  const fields: PowerField[] = [
    { id: 'stage', label: 'Stage', options: ['Lead', 'Qualified', 'Negotiation', 'Won', 'Lost'] },
    { id: 'owner', label: 'Owner', options: ['Mira Chen', 'Theo Park', 'Ana Ruiz'] },
    { id: 'region', label: 'Region', options: ['EU', 'US', 'APAC'] },
  ];
  return (
    <VStack gap={3}>
      <PowerSearch fields={fields} filters={filters} onFiltersChange={setFilters} query={q} onQueryChange={setQ} />
      <Text size="sm" tone="muted" mono>
        {filters.map((f) => `${f.field} ${f.op} "${f.value}"`).join(' AND ') || 'no filters'}
        {q ? ` AND text ~ "${q}"` : ''}
      </Text>
    </VStack>
  );
}
// #endregion
