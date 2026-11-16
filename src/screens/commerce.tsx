import * as stylex from '@stylexjs/stylex';
import { useMemo, useState } from 'react';
import { Download, Mail, Package, Plus, Printer, RotateCcw, ShoppingBag, Truck } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  DateStepper,
  Divider,
  Drawer,
  EmptyState,
  HStack,
  MetadataList,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatGroup,
  StatusChip,
  StatusSelect,
  Table,
  Text,
  VStack,
  Well,
  AlertDialog,
  useToast,
  type Column,
} from '../sfera';
import { colors } from '../sfera/tokens.stylex';
import { Screen } from './kit';
import { kiln } from './products';
import { date, money, orderStatus, orders as seed, type Order } from '../data/mock';

const s = stylex.create({
  page: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1280, marginInline: 'auto' },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '4px 4px 4px 10px' },
  search: { flexGrow: 1, minWidth: 180, maxWidth: { default: 300, '@media (max-width: 640px)': 'none' } },
  foot: { padding: '10px 12px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.border },
  line: { display: 'flex', justifyContent: 'space-between', gap: 12, paddingBlock: 6, fontSize: 14 },
});

const delivery = (d: Order['delivery']) =>
  d === 'shipped' ? <StatusChip tone="success">Shipped</StatusChip> : d === 'failed' ? <StatusChip tone="danger">Delivery failed</StatusChip> : <StatusChip tone="info">Processing</StatusChip>;

export function OrdersScreen() {
  const toast = useToast();
  const [rows, setRows] = useState(seed);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [refund, setRefund] = useState(false);
  const shown = useMemo(() => rows.filter((r) => (status === 'all' || r.status === status) && (r.customer + r.id).toLowerCase().includes(q.toLowerCase())), [rows, q, status]);
  const cur = rows.find((r) => r.id === openId);
  const setRowStatus = (id: string, v: string) => setRows((rs) => rs.map((x) => (x.id === id ? { ...x, status: v } : x)));
  const cols: Column<Order>[] = [
    { key: 'id', header: 'Order', sortValue: (r) => r.id, render: (r) => <Text as="span" mono size="sm">{r.id}</Text> },
    { key: 'c', header: 'Customer', sortValue: (r) => r.customer, render: (r) => <HStack gap={2}><Avatar name={r.customer} size="sm" /><span>{r.customer}</span></HStack> },
    { key: 's', header: 'Purchase', render: (r) => <StatusSelect options={orderStatus} value={r.status} onChange={(v) => setRowStatus(r.id, v)} /> },
    { key: 'd', header: 'Delivery', hideBelow: 'sm', render: (r) => delivery(r.delivery) },
    { key: 'u', header: 'Last updated', hideBelow: 'md', sortValue: (r) => r.updated, render: (r) => date(r.updated) },
    { key: 'p', header: 'Total', align: 'right', sortValue: (r) => r.total, render: (r) => money(r.total) },
  ];
  return (
    <Screen product={kiln} active="orders" topbar={<Text weight="medium">Orders</Text>}>
      <div {...stylex.props(s.page)}>
        <PageHeader
          title="Orders"
          subtitle="Everything sold across web and retail."
          actions={
            <>
              <Button iconStart={<Download size={15} />} onClick={() => toast({ title: 'Export queued', description: 'orders-nov.csv will download shortly.', tone: 'success' })}>
                Export
              </Button>
              <Button variant="primary" iconStart={<Plus size={15} />} onClick={() => toast({ title: 'Draft orders are coming soon' })}>
                Create order
              </Button>
            </>
          }
        />
        <StatGroup
          stats={[
            { label: 'Revenue', value: '$48,210', delta: 12, note: 'vs last week' },
            { label: 'Orders', value: rows.length * 47, delta: 6 },
            { label: 'Avg. order', value: '$128', delta: -3 },
            { label: 'Failed deliveries', value: rows.filter((r) => r.delivery === 'failed').length, note: 'need action' },
          ]}
        />
        <Well title="All orders" subtitle={`${shown.length} shown · change purchase status from its dropdown`} actions={<DateStepper days={7} />}>
          <div {...stylex.props(s.filters)}>
            <div {...stylex.props(s.search)}>
              <SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search order or customer" />
            </div>
            <Select size="sm" width="auto" label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, ...orderStatus.map((o) => ({ value: o.value, label: o.label }))]} />
          </div>
          <Card padding="none">
            {shown.length ? (
              <Table label="Orders" columns={cols} rows={shown} rowKey={(r) => r.id} selectable onRowClick={(r) => setOpenId(r.id)} />
            ) : (
              <div style={{ padding: 16 }}>
                <EmptyState icon={<ShoppingBag size={18} />} title="No orders match" description="Clear the search or pick another status." actions={<Button size="sm" onClick={() => (setQ(''), setStatus('all'))}>Clear filters</Button>} />
              </div>
            )}
            <div {...stylex.props(s.foot)}>
              <Pagination page={page} total={12} onChange={setPage} />
            </div>
          </Card>
        </Well>
      </div>
      <Drawer
        open={!!cur}
        onClose={() => setOpenId(null)}
        title={cur ? cur.id : ''}
        description={cur ? `${cur.items} items · ${date(cur.updated)}` : ''}
        footer={
          <>
            <Button iconStart={<RotateCcw size={15} />} onClick={() => setRefund(true)}>
              Refund
            </Button>
            <Button variant="primary" iconStart={<Truck size={15} />} onClick={() => (cur && setRows((rs) => rs.map((x) => (x.id === cur.id ? { ...x, delivery: 'shipped', status: 'completed' } : x))), toast({ title: 'Marked as shipped', tone: 'success' }))}>
              Mark shipped
            </Button>
          </>
        }
      >
        {cur && (
          <VStack gap={5}>
            <HStack gap={3}>
              <Avatar name={cur.customer} size="lg" />
              <VStack gap={0} grow>
                <Text weight="medium">{cur.customer}</Text>
                <Text size="sm" tone="muted">{cur.email}</Text>
              </VStack>
              <Button size="sm" variant="ghost" iconStart={<Mail size={14} />} onClick={() => toast({ title: `Email to ${cur.customer} is coming soon` })}>
                Email
              </Button>
            </HStack>
            <MetadataList
              items={[
                { label: 'Purchase', value: <StatusSelect options={orderStatus} value={cur.status} onChange={(v) => setRowStatus(cur.id, v)} /> },
                { label: 'Delivery', value: delivery(cur.delivery) },
                { label: 'Payment', value: 'Visa ending 4242' },
                { label: 'Ship to', value: 'Rua Augusta 21, Lisbon' },
              ]}
            />
            <Well title="Items">
              <Card padding="sm">
                {Array.from({ length: Math.min(cur.items, 3) }, (_, i) => (
                  <div key={i} {...stylex.props(s.line)}>
                    <HStack gap={2}>
                      <Package size={15} />
                      <span>{['Stoneware mug', 'Linen apron', 'Glaze sampler'][i]}</span>
                    </HStack>
                    <span>{money([38, 64, 120][i])}</span>
                  </div>
                ))}
                <Divider />
                <div {...stylex.props(s.line)}>
                  <strong style={{ fontWeight: 500 }}>Total</strong>
                  <strong style={{ fontWeight: 500 }}>{money(cur.total)}</strong>
                </div>
              </Card>
            </Well>
            <Button variant="ghost" iconStart={<Printer size={15} />} onClick={() => toast({ title: 'Packing slip sent to printer' })}>
              Print packing slip
            </Button>
          </VStack>
        )}
      </Drawer>
      <AlertDialog
        open={refund}
        onClose={() => setRefund(false)}
        onConfirm={() => toast({ title: `Refunded ${cur ? money(cur.total) : ''}`, tone: 'success', action: { label: 'Undo', onClick: () => toast({ title: 'Refund cancelled' }) } })}
        destructive
        title="Refund this order?"
        description={cur ? `${money(cur.total)} goes back to ${cur.customer}'s card. This cannot be reversed after 30 minutes.` : ''}
        confirmLabel="Refund"
      />
    </Screen>
  );
}
