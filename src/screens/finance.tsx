import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Banknote, Building2, Coffee, CreditCard, Download, FileText, Landmark, Lock, Plane, Plus, Receipt, Send, ShoppingCart, Snowflake, Upload, Wallet } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { ledger } from './products';
import { Cols, Page, money } from './ui';

type Tx = { id: string; date: string; who: string; cat: string; amount: number; account: string; receipt: boolean };
const cats = ['Software', 'Travel', 'Meals', 'Payroll', 'Revenue', 'Office'];
export const txs: Tx[] = [
  ['Nov 14', 'Stripe payout', 'Revenue', 12480, 'Operating'],
  ['Nov 14', 'Figma', 'Software', -540, 'Card ·4021'],
  ['Nov 13', 'TAP Air Portugal', 'Travel', -386.2, 'Card ·7710'],
  ['Nov 13', 'Café Janis', 'Meals', -42.5, 'Card ·4021'],
  ['Nov 12', 'Northwind client', 'Revenue', 8400, 'Operating'],
  ['Nov 11', 'AWS', 'Software', -1210.88, 'Card ·4021'],
  ['Nov 10', 'Payroll · Crew', 'Payroll', -48210, 'Operating'],
  ['Nov 9', 'IKEA', 'Office', -229, 'Card ·7710'],
  ['Nov 8', 'Linear', 'Software', -96, 'Card ·4021'],
].map(([d, w, c, a, acc], i) => ({ id: `tx${i}`, date: d as string, who: w as string, cat: c as string, amount: a as number, account: acc as string, receipt: i % 3 !== 1 }));
const catIcon: Record<string, React.ReactNode> = { Software: <ShoppingCart size={14} />, Travel: <Plane size={14} />, Meals: <Coffee size={14} />, Payroll: <Wallet size={14} />, Revenue: <ArrowDownLeft size={14} />, Office: <Building2 size={14} /> };

// ───────── Overview: balance trend + cash flow + upcoming
export function FinOverviewScreen() {
  const { open } = useScreenNav();
  const walk = (n: number, drift: number) => {
    let v = 182000;
    return Array.from({ length: n }, (_, i) => (v += Math.sin(i * 1.1) * 2400 + drift));
  };
  const flow = Array.from({ length: 12 }, (_, i) => ({ label: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i], values: { revenue: 60 + ((i * 13) % 30), other: 6 + (i % 4) * 3, spend: 38 + ((i * 7) % 20) } }));
  return (
    <Screen product={ledger} active="overview" topbar={<O.Text weight="medium">Overview</O.Text>}>
      <Page title="Finance" subtitle="Northwind Ltd · all accounts in USD">
        <Cols template="360px minmax(0, 1fr)" stretch>
          <O.TrendCard label="Cash" ranges={{ '1M': walk(30, 260), '3M': walk(45, 420), '1Y': walk(52, 900) }} period="this period" />
          <O.Well title="Cash flow" subtitle="$k per month · spend below the line" fill>
            <O.Card grow>
              <O.StackedBarChart label="Cash flow" data={flow} series={[{ key: 'revenue', label: 'Revenue', color: O.seriesColors.green }, { key: 'other', label: 'Other income', color: O.seriesColors.teal }]} negative={{ key: 'spend', label: 'Spend', color: O.seriesColors.pink }} height={210} />
            </O.Card>
          </O.Well>
        </Cols>
        <O.KpiStrip items={[
          { icon: <Landmark size={14} />, label: 'Runway', period: 'at current burn', value: '19 mo', delta: 2, viz: <O.QuotaBar value={19} max={24} />, note: <>Goal <O.KpiStrong>24 months</O.KpiStrong></> },
          { icon: <ArrowDownLeft size={14} />, label: 'Revenue', period: 'Nov', value: '$84.2k', delta: 11, viz: <O.SparkBars values={flow.map((f) => f.values.revenue)} />, note: <>Best month <O.KpiStrong>Oct</O.KpiStrong></> },
          { icon: <ArrowUpRight size={14} />, label: 'Burn', period: 'Nov', value: '$61.9k', delta: -4, good: 'down', viz: <O.WaffleGrid filled={62} total={84} />, note: '74% of revenue' },
          { icon: <FileText size={14} />, label: 'Days to pay', period: 'invoices', value: '21 d', delta: -9, good: 'down', viz: <O.RangeMarker min={0} max={60} value={21} previous={25} />, note: <><O.KpiStrong>4 days</O.KpiStrong> faster</> },
        ]} />
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)" stretch>
          <O.Well title="Recent transactions" actions={<O.Button size="sm" variant="ghost" onClick={() => open('fin-transactions')}>All</O.Button>} fill>
            <O.Card padding="none" grow>
              <O.List boxed={false}>
                {txs.slice(0, 5).map((t, i) => (
                  <O.ListItem key={t.id} last={i === 4} leading={<span style={{ width: 30, height: 30, borderRadius: 9, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{catIcon[t.cat]}</span>} title={t.who} subtitle={`${t.date} · ${t.cat}`} trailing={<O.Text as="span" size="sm" numeric weight="medium">{money(t.amount, 2)}</O.Text>} />
                ))}
              </O.List>
            </O.Card>
          </O.Well>
          <O.Well title="Due this week" fill>
            <O.Card padding="none" grow>
              <O.List boxed={false}>
                <O.ListItem leading={<Receipt size={16} />} title="AWS · bill" subtitle="Due Nov 18 · auto-pay" trailing={money(1210.88, 2)} onClick={() => open('fin-bills')} />
                <O.ListItem leading={<FileText size={16} />} title="INV-2041 · Fjord Freight" subtitle="Overdue 3 days" trailing={<O.Badge tone="danger">{money(12400)}</O.Badge>} onClick={() => open('fin-invoice')} />
                <O.ListItem leading={<Building2 size={16} />} title="Office rent · Lisbon" subtitle="Dec 1 · standing order" trailing={money(3200)} />
                <O.ListItem leading={<CreditCard size={16} />} title="Card statement ·4021" subtitle="Dec 3 · auto-pay" trailing={money(2847.32, 2)} />
                <O.ListItem last leading={<Wallet size={16} />} title="Payroll" subtitle="Nov 28 · 15 people" trailing={money(48210)} />
              </O.List>
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Transactions with category select + receipt flags
export function FinTransactionsScreen() {
  const toast = O.useToast();
  const [rows, setRows] = useState(txs);
  const [q, setQ] = useState('');
  const [range, setRange] = useState<[Date | null, Date | null]>([new Date(2026, 10, 1), new Date(2026, 10, 15)]);
  const shown = rows.filter((t) => t.who.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen product={ledger} active="transactions" topbar={<O.Text weight="medium">Transactions</O.Text>}>
      <Page title="Transactions" subtitle={`${shown.length} transactions · ${shown.filter((t) => !t.receipt).length} missing receipts`} actions={<O.Button iconStart={<Download />} onClick={() => toast({ title: 'CSV export started' })}>Export</O.Button>}>
        <O.HStack gap={2} wrap>
          <div style={{ flex: '1 1 220px', maxWidth: 300 }}><O.SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search merchant" /></div>
          <div style={{ width: 280, maxWidth: '100%' }}><O.DateRangeInput value={range} onChange={setRange} /></div>
        </O.HStack>
        <O.Card padding="none">
          <O.Table label="Transactions" rows={shown} rowKey={(t) => t.id} selectable columns={[
            { key: 'd', header: 'Date', sortValue: (t) => t.date, render: (t) => <O.Text as="span" size="sm" tone="muted">{t.date}</O.Text> },
            { key: 'w', header: 'Merchant', render: (t) => <O.HStack gap={2}>{catIcon[t.cat]}{t.who}</O.HStack> },
            { key: 'c', header: 'Category', hideBelow: 'sm', render: (t) => <div style={{ width: 150 }}><O.Select size="sm" label="Category" value={t.cat} onChange={(v) => setRows((r) => r.map((x) => (x.id === t.id ? { ...x, cat: v } : x)))} options={cats.map((c) => ({ value: c, label: c }))} /></div> },
            { key: 'r', header: 'Receipt', hideBelow: 'md', render: (t) => (t.receipt ? <O.StatusChip size="sm" tone="success">Attached</O.StatusChip> : <O.Button size="xs" variant="soft" iconStart={<Upload />} onClick={() => (setRows((r) => r.map((x) => (x.id === t.id ? { ...x, receipt: true } : x))), toast({ title: 'Receipt attached', tone: 'success' }))}>Add</O.Button>) },
            { key: 'a', header: 'Amount', align: 'right', sortValue: (t) => t.amount, render: (t) => <span style={{ color: t.amount > 0 ? O.colors.success : undefined }}>{t.amount > 0 ? '+' : ''}{money(t.amount, 2)}</span> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Invoices
const invStatus: Record<string, O.Tone> = { Paid: 'success', Sent: 'info', Overdue: 'danger', Draft: 'neutral' };
const invoices = [
  { id: 'INV-2044', client: 'Linear', amount: 8400, due: 'Dec 1', status: 'Draft' },
  { id: 'INV-2043', client: 'Nimbus Labs', amount: 6100, due: 'Nov 28', status: 'Sent' },
  { id: 'INV-2042', client: 'Paperhill', amount: 2200, due: 'Nov 20', status: 'Sent' },
  { id: 'INV-2041', client: 'Fjord Freight', amount: 12400, due: 'Nov 12', status: 'Overdue' },
  { id: 'INV-2040', client: 'Arcadia Studio', amount: 4800, due: 'Nov 3', status: 'Paid' },
];
export function FinInvoicesScreen() {
  const { open } = useScreenNav();
  const [tab, setTab] = useState('all');
  const list = invoices.filter((i) => tab === 'all' || i.status === tab);
  const sum = (s: string) => money(invoices.filter((i) => i.status === s).reduce((a, i) => a + i.amount, 0));
  return (
    <Screen product={ledger} active="invoices" topbar={<O.Text weight="medium">Invoices</O.Text>}>
      <Page title="Invoices" actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => open('fin-invoice')}>New invoice</O.Button>}>
        <O.StatGroup stats={[{ label: 'Outstanding', value: sum('Sent') }, { label: 'Overdue', value: sum('Overdue'), note: '1 invoice' }, { label: 'Paid (30d)', value: sum('Paid'), delta: 12 }, { label: 'Drafts', value: invoices.filter((i) => i.status === 'Draft').length }]} />
        <O.Tabs label="Status" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All' }, { id: 'Draft', label: 'Draft' }, { id: 'Sent', label: 'Sent' }, { id: 'Overdue', label: 'Overdue' }, { id: 'Paid', label: 'Paid' }]} />
        <O.Card padding="none">
          <O.Table label="Invoices" rows={list} rowKey={(i) => i.id} onRowClick={() => open('fin-invoice')} columns={[
            { key: 'i', header: 'Invoice', render: (i) => <O.Text as="span" size="sm" mono>{i.id}</O.Text> },
            { key: 'c', header: 'Client', render: (i) => <O.HStack gap={2}><O.Avatar name={i.client} size="xs" square />{i.client}</O.HStack> },
            { key: 'd', header: 'Due', hideBelow: 'sm', render: (i) => i.due },
            { key: 's', header: 'Status', render: (i) => <O.StatusChip size="sm" tone={invStatus[i.status]}>{i.status}</O.StatusChip> },
            { key: 'a', header: 'Amount', align: 'right', sortValue: (i) => i.amount, render: (i) => money(i.amount) },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Invoice editor with live document preview
export function FinInvoiceScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [lines, setLines] = useState([{ d: 'Design system build', q: 1, p: 6400 }, { d: 'Onboarding workshop', q: 2, p: 1000 }]);
  const [client, setClient] = useState('linear');
  const [tax, setTax] = useState(23);
  const sub = lines.reduce((a, l) => a + l.q * l.p, 0);
  return (
    <Screen product={ledger} active="invoices" topbar={<O.Breadcrumbs items={[{ id: 'i', label: 'Invoices' }, { id: 'n', label: 'INV-2044' }]} onNavigate={() => open('fin-invoices')} />}>
      <Page title="INV-2044" actions={<><O.Button onClick={() => toast({ title: 'Draft saved' })}>Save draft</O.Button><O.Button variant="primary" iconStart={<Send />} onClick={() => toast({ title: 'Invoice sent to ap@linear.app', tone: 'success' })}>Send</O.Button></>} max={1200}>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)">
          <O.Well title="Details">
            <O.Card>
              <O.VStack gap={4}>
                <O.Grid min={180} gap={3}>
                  <O.Field label="Client"><O.Typeahead value={client} onChange={(v) => setClient(v ?? '')} options={[{ value: 'linear', label: 'Linear', description: 'ap@linear.app' }, { value: 'nimbus', label: 'Nimbus Labs' }, { value: 'fjord', label: 'Fjord Freight' }]} /></O.Field>
                  <O.Field label="Due date"><O.DateInput defaultValue={new Date(2026, 11, 1)} /></O.Field>
                </O.Grid>
                {lines.map((l, i) => (
                  <O.Grid key={i} min={120} gap={2}>
                    <O.TextInput aria-label="Description" value={l.d} onChange={(e) => setLines((x) => x.map((y, k) => (k === i ? { ...y, d: e.target.value } : y)))} />
                    <O.NumberInput label="Quantity" value={l.q} min={1} onChange={(v) => setLines((x) => x.map((y, k) => (k === i ? { ...y, q: v } : y)))} />
                    <O.TextInput aria-label="Price" inputMode="decimal" value={String(l.p)} iconStart={<span>$</span>} onChange={(e) => setLines((x) => x.map((y, k) => (k === i ? { ...y, p: Number(e.target.value) || 0 } : y)))} />
                  </O.Grid>
                ))}
                <div><O.Button size="sm" variant="soft" iconStart={<Plus />} onClick={() => setLines((x) => [...x, { d: 'New line', q: 1, p: 0 }])}>Add line</O.Button></div>
                <O.Field label="Tax"><O.Slider value={tax} onChange={setTax} min={0} max={25} format={(n) => `${n}%`} /></O.Field>
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.Card>
            <O.VStack gap={4}>
              <O.HStack justify="between" align="start">
                <O.VStack gap={0}><O.Text weight="medium">Northwind Ltd</O.Text><O.Text size="xs" tone="muted">Rua Augusta 21, Lisbon</O.Text></O.VStack>
                <O.VStack gap={0} align="end"><O.Text size="xs" tone="subtle" mono>INVOICE</O.Text><O.Text mono>INV-2044</O.Text></O.VStack>
              </O.HStack>
              <O.Divider />
              <O.Text size="sm" tone="muted">Bill to <strong style={{ fontWeight: 500 }}>{client || '—'}</strong> · due 1 Dec 2026</O.Text>
              <O.MetadataList alignValues="right" items={[...lines.map((l) => ({ label: `${l.d} × ${l.q}`, value: money(l.q * l.p, 2) })), { label: 'Subtotal', value: money(sub, 2) }, { label: `Tax ${tax}%`, value: money((sub * tax) / 100, 2) }, { label: <strong style={{ fontWeight: 500 }}>Total</strong>, value: <strong style={{ fontWeight: 500, fontSize: 18 }}>{money(sub * (1 + tax / 100), 2)}</strong> }]} />
            </O.VStack>
          </O.Card>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Bills (approval queue)
export function FinBillsScreen() {
  const toast = O.useToast();
  const [bills, setBills] = useState([
    { id: 'b1', v: 'AWS', amt: 1210.88, due: 'Nov 18', state: 'approved' },
    { id: 'b2', v: 'WeWork Lisbon', amt: 3200, due: 'Nov 20', state: 'pending' },
    { id: 'b3', v: 'Figma', amt: 540, due: 'Nov 22', state: 'pending' },
    { id: 'b4', v: 'Legal · Morais & Co', amt: 4800, due: 'Dec 1', state: 'pending' },
  ]);
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <Screen product={ledger} active="bills" topbar={<O.Text weight="medium">Bills</O.Text>}>
      <Page title="Bills" subtitle="Approve, then pay on the due date." actions={<O.Button iconStart={<Upload />}>Upload bill</O.Button>} max={1000}>
        <O.VStack gap={2}>
          {bills.map((b) => (
            <O.Card key={b.id} padding="sm">
              <O.HStack gap={3} wrap>
                <O.Avatar name={b.v} square />
                <O.VStack gap={0} grow><O.Text size="sm" weight="medium">{b.v}</O.Text><O.Text size="xs" tone="muted">Due {b.due}</O.Text></O.VStack>
                <O.Text numeric weight="medium">{money(b.amt, 2)}</O.Text>
                {b.state === 'pending' ? (
                  <O.HStack gap={2}><O.Button size="sm" variant="ghost" onClick={() => setBills((x) => x.map((y) => (y.id === b.id ? { ...y, state: 'rejected' } : y)))}>Reject</O.Button><O.Button size="sm" variant="primary" onClick={() => setConfirm(b.id)}>Approve</O.Button></O.HStack>
                ) : (
                  <O.StatusChip size="sm" tone={b.state === 'approved' ? 'success' : 'neutral'}>{b.state}</O.StatusChip>
                )}
              </O.HStack>
            </O.Card>
          ))}
        </O.VStack>
      </Page>
      <O.AlertDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => (setBills((x) => x.map((y) => (y.id === confirm ? { ...y, state: 'approved' } : y))), toast({ title: 'Bill approved', description: 'It will be paid on the due date.', tone: 'success' }))} title="Approve this bill?" description={`${bills.find((b) => b.id === confirm)?.v} · ${money(bills.find((b) => b.id === confirm)?.amt ?? 0, 2)} is paid automatically on the due date.`} confirmLabel="Approve" />
    </Screen>
  );
}

// ───────── Expenses: receipts grid + submit
export function FinExpensesScreen() {
  const toast = O.useToast();
  const [open, setOpen] = useState(false);
  const items = [
    { m: 'TAP Air Portugal', a: 386.2, c: 'Travel', s: 'Approved', who: 'Mira Chen' },
    { m: 'Café Janis', a: 42.5, c: 'Meals', s: 'Pending', who: 'Theo Park' },
    { m: 'IKEA', a: 229, c: 'Office', s: 'Needs receipt', who: 'Ana Ruiz' },
    { m: 'Uber', a: 18.4, c: 'Travel', s: 'Pending', who: 'Sam Ito' },
  ];
  const tone: Record<string, O.Tone> = { Approved: 'success', Pending: 'info', 'Needs receipt': 'warning' };
  return (
    <Screen product={ledger} active="expenses" topbar={<O.Text weight="medium">Expenses</O.Text>}>
      <Page title="Expenses" actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => setOpen(true)}>New expense</O.Button>}>
        <O.Grid min={230} gap={3}>
          {items.map((e) => (
            <O.Well key={e.m}>
              <O.Card padding="sm">
                <O.VStack gap={2}>
                  <O.HStack justify="between"><span style={{ width: 32, height: 32, borderRadius: 10, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{catIcon[e.c]}</span><O.StatusChip size="sm" tone={tone[e.s]}>{e.s}</O.StatusChip></O.HStack>
                  <O.Text weight="medium">{e.m}</O.Text>
                  <span style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.03em' }}>{money(e.a, 2)}</span>
                </O.VStack>
              </O.Card>
              <O.HStack gap={2}><O.Avatar name={e.who} size="xs" /><O.Text size="xs" tone="muted">{e.who} · {e.c}</O.Text></O.HStack>
            </O.Well>
          ))}
        </O.Grid>
      </Page>
      <O.BottomSheet open={open} onClose={() => setOpen(false)} title="New expense">
        <O.VStack gap={4}>
          <O.Field label="Receipt"><O.FileInput multiple={false} hint="Photo or PDF" /></O.Field>
          <O.Field label="Amount"><O.TextInput inputMode="decimal" iconStart={<span>$</span>} /></O.Field>
          <O.Field label="Category"><O.Select options={cats.map((c) => ({ value: c, label: c }))} /></O.Field>
          <O.Button variant="primary" fullWidth onClick={() => (setOpen(false), toast({ title: 'Expense submitted', tone: 'success' }))}>Submit</O.Button>
        </O.VStack>
      </O.BottomSheet>
    </Screen>
  );
}

// ───────── Budgets
export function FinBudgetsScreen() {
  const budgets = [
    ['Software', 4000, 3120, O.seriesColors.blue],
    ['Travel', 6000, 6420, O.seriesColors.amber],
    ['Marketing', 12000, 7400, O.seriesColors.violet],
    ['Office', 2000, 820, O.seriesColors.teal],
  ] as const;
  return (
    <Screen product={ledger} active="budgets" topbar={<O.Text weight="medium">Budgets</O.Text>}>
      <Page title="Budgets" subtitle="November · resets on the 1st">
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)" stretch>
          <O.UsageMeter title="Total spend" total={24000} format={(n) => `$${(n / 1000).toFixed(1)}k`} segments={budgets.map(([l, , s, c]) => ({ label: l, value: s, color: c }))} />
          <O.Well title="By team" fill>
            <O.Card grow>
              <O.VStack gap={4}>
                {budgets.map(([l, b, s]) => (
                  <O.VStack key={l} gap={1}>
                    <O.ProgressBar label={l} value={s} max={b} tone={s > b ? 'danger' : s / b > 0.8 ? 'warning' : 'accent'} />
                    <O.Text size="xs" tone="muted">{money(s)} of {money(b)}{s > b ? ` · over by ${money(s - b)}` : ''}</O.Text>
                  </O.VStack>
                ))}
              </O.VStack>
            </O.Card>
          </O.Well>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Cards
export function FinCardsScreen() {
  const toast = O.useToast();
  const [cards, setCards] = useState([
    { id: 'c1', name: 'Mira Chen', last: '4021', limit: 5000, spent: 3120, frozen: false, color: '#1F2A44' },
    { id: 'c2', name: 'Theo Park', last: '7710', limit: 2000, spent: 640, frozen: false, color: '#17804F' },
    { id: 'c3', name: 'Software', last: '9902', limit: 8000, spent: 6100, frozen: true, color: '#6D4DE6' },
  ]);
  return (
    <Screen product={ledger} active="cards" topbar={<O.Text weight="medium">Cards</O.Text>}>
      <Page title="Cards" actions={<O.Button variant="primary" iconStart={<CreditCard />}>Issue card</O.Button>}>
        <O.Grid min={280} gap={3}>
          {cards.map((c) => (
            <O.Well key={c.id}>
              <div style={{ aspectRatio: '1.6', maxWidth: '100%', borderRadius: 16, background: c.color, color: '#fff', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: c.frozen ? 0.55 : 1, transition: 'opacity 220ms' }}>
                <O.HStack justify="between"><span style={{ fontSize: 13, opacity: 0.8 }}>Ledger</span>{c.frozen ? <Snowflake size={18} /> : <Banknote size={18} />}</O.HStack>
                <span style={{ fontFamily: O.font.mono, fontSize: 17, letterSpacing: '0.1em' }}>•••• {c.last}</span>
                <span style={{ fontSize: 14 }}>{c.name}</span>
              </div>
              <O.Card padding="sm">
                <O.VStack gap={3}>
                  <O.ProgressBar label="Spent this month" value={c.spent} max={c.limit} />
                  <O.HStack justify="between"><O.Switch size="sm" label="Frozen" checked={c.frozen} onChange={(v) => (setCards((x) => x.map((y) => (y.id === c.id ? { ...y, frozen: v } : y))), toast({ title: v ? 'Card frozen' : 'Card unfrozen' }))} /><O.Button size="xs" variant="soft" iconStart={<Lock />}>Limits</O.Button></O.HStack>
                </O.VStack>
              </O.Card>
            </O.Well>
          ))}
        </O.Grid>
      </Page>
    </Screen>
  );
}

// ───────── P&L report
export function FinReportsScreen() {
  const [period, setPeriod] = useState('q4');
  const rows = useMemo(
    () => [
      ['Revenue', 252400, 231000],
      ['Cost of sales', -61200, -58900],
      ['Gross profit', 191200, 172100],
      ['Payroll', -144630, -139200],
      ['Software', -9480, -8900],
      ['Marketing', -22100, -18800],
      ['Operating profit', 14990, 5200],
    ].map(([l, a, b]) => ({ l: l as string, a: (a as number) * (period === 'q4' ? 1 : 0.92), b: b as number })),
    [period],
  );
  return (
    <Screen product={ledger} active="reports" topbar={<O.Text weight="medium">Reports</O.Text>}>
      <Page title="Profit and loss" actions={<><O.SegmentedControl size="sm" value={period} onChange={setPeriod} options={[{ value: 'q3', label: 'Q3' }, { value: 'q4', label: 'Q4' }]} /><O.Button iconStart={<Download />}>PDF</O.Button></>} max={1000}>
        <O.Card padding="none">
          <O.Table label="P&L" rows={rows} rowKey={(r) => r.l} columns={[
            { key: 'l', header: 'Line', render: (r) => <span style={{ fontWeight: /profit/i.test(r.l) ? 500 : 400 }}>{r.l}</span> },
            { key: 'a', header: 'This period', align: 'right', render: (r) => money(r.a) },
            { key: 'b', header: 'Previous', align: 'right', hideBelow: 'sm', render: (r) => money(r.b) },
            { key: 'c', header: 'Change', align: 'right', render: (r) => <O.DeltaPill variant="arrow" value={Math.round(((r.a - r.b) / Math.abs(r.b)) * 100)} good={r.a < 0 ? 'down' : 'up'} /> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Accounts
export function FinAccountsScreen() {
  const toast = O.useToast();
  return (
    <Screen product={ledger} active="accounts" topbar={<O.Text weight="medium">Accounts</O.Text>}>
      <Page title="Accounts" actions={<O.Button iconStart={<Plus />} onClick={() => toast({ title: 'Bank connection is coming soon' })}>Connect bank</O.Button>} max={980}>
        <O.VStack gap={2}>
          {[['Operating', 'Millennium BCP ··3310', 182400, 'Synced 4 min ago'], ['Savings', 'Revolut Business ··0921', 400000, 'Synced 1 h ago'], ['USD', 'Wise ··4410', 38210, 'Sync failed']].map(([n, b, v, s]) => (
            <O.Card key={n as string}>
              <O.HStack gap={3} wrap>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Landmark size={18} /></span>
                <O.VStack gap={0} grow><O.Text weight="medium">{n}</O.Text><O.Text size="sm" tone="muted">{b}</O.Text></O.VStack>
                <O.VStack gap={0} align="end"><span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>{money(v as number)}</span><O.StatusChip size="sm" variant="dot" tone={(s as string).includes('failed') ? 'danger' : 'success'}>{s}</O.StatusChip></O.VStack>
              </O.HStack>
            </O.Card>
          ))}
        </O.VStack>
      </Page>
    </Screen>
  );
}
