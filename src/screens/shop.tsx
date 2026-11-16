import { useState } from 'react';
import { ArrowLeft, CircleDollarSign, Copy, Globe, ImagePlus, Package, Plus, Printer, RotateCcw, ShoppingBasket, Tag, Truck, Users, Wallet } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav } from './kit';
import { kiln } from './products';
import { Cols, Page, money, names } from './ui';
import { date, orderStatus, orders, sampleImages } from '../data/mock';

type Product = { id: string; name: string; price: number; stock: number; status: 'active' | 'draft' | 'archived'; img: number; sku: string; sold: number };
export const products: Product[] = [
  ['Ash Grey mug', 34, 120, 'active', 0, 412],
  ['Cobalt mug', 34, 18, 'active', 1, 610],
  ['Celadon bowl', 48, 0, 'active', 3, 233],
  ['Glaze sampler', 120, 42, 'active', 2, 98],
  ['Linen apron', 64, 75, 'draft', 1, 0],
  ['Studio vase', 89, 9, 'active', 0, 141],
  ['Gift card', 50, 999, 'active', 2, 320],
  ['Speckled plate', 42, 64, 'archived', 3, 77],
].map(([n, p, s, st, img, sold], i) => ({ id: `p${i}`, name: n as string, price: p as number, stock: s as number, status: st as Product['status'], img: img as number, sku: `KLN-${100 + i}`, sold: sold as number }));

// ───────── Store home: tiles + insights + trend
export function ShopHomeScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const walk = (n: number, drift: number) => {
    let v = 41200;
    return Array.from({ length: n }, (_, i) => (v += Math.sin(i * 0.45) * 260 + Math.cos(i * 0.17) * 180 + drift));
  };
  return (
    <Screen product={kiln} active="home" topbar={<O.Text weight="medium">Home</O.Text>}>
      <Page title="Good morning, Ana" subtitle="Here is how the studio is doing this month.">
        <O.Grid columns={4} gap={3}>
          <O.StatTile icon={<CircleDollarSign size={20} />} color={O.seriesColors.blue} label="Total revenue" value="$152,313.92" delta={16} info="Gross sales before refunds and fees." />
          <O.StatTile icon={<ShoppingBasket size={20} />} color={O.seriesColors.amber} label="Total orders" value="25,162" delta={20} info="All channels." />
          <O.StatTile icon={<Users size={20} />} color={O.seriesColors.violet} label="New customers" value="3,847" delta={8.1} info="First order this month." />
          <O.StatTile icon={<RotateCcw size={20} />} color={O.seriesColors.pink} label="Refunds" value="$4,209.44" delta={-2.4} good="down" info="Money returned to customers." />
        </O.Grid>
        <Cols template="minmax(0, 1.2fr) minmax(0, 1fr)">
          <O.Card>
            <O.InsightCard
              suggestion="Should I rebalance the glazes?"
              onSuggest={() => toast({ title: 'Opened in Muse', description: 'The insight is attached to a new chat.' })}
              insights={[
                { text: <>The weakest line in <O.InsightMention color={O.seriesColors.amber}>@Kiln studio</O.InsightMention> is Ash Grey, down <O.InsightNumber>−6%</O.InsightNumber> or <O.InsightNumber>−$2,453.44</O.InsightNumber>.</>, compare: [{ label: 'Ash Grey', color: O.seriesColors.amber, pct: -4.41, amount: -2377.66 }, { label: 'Cobalt', color: O.seriesColors.blue, pct: 1.15, amount: 617.22 }], trend: [{ color: O.seriesColors.amber, values: [9, 8, 8, 7, 6, 6, 5] }, { color: O.seriesColors.blue, values: [5, 5, 6, 6, 6, 7, 7] }] },
                { text: <>Cobalt mugs sold <O.InsightNumber tone="pos">+18%</O.InsightNumber> after Tuesday’s newsletter.</>, compare: [{ label: 'Cobalt', color: O.seriesColors.blue, pct: 18.2, amount: 4120 }, { label: 'Celadon', color: O.seriesColors.green, pct: 3.4, amount: 812.5 }] },
              ]}
            />
          </O.Card>
          <O.VStack gap={3}>
            <O.TrendCard label="Balance" ranges={{ '1W': walk(8, 120), '1M': walk(30, 90), '3M': walk(40, 60) }} period="this period" />
            <O.Well title="Needs attention" actions={<O.Button size="sm" variant="ghost" onClick={() => open('commerce-orders')}>All orders</O.Button>}>
              <O.Card padding="none">
                <O.List boxed={false}>
                  <O.ListItem leading={<Truck size={16} />} title="3 failed deliveries" subtitle="Reship or refund" trailing={<O.Badge tone="danger">3</O.Badge>} onClick={() => open('commerce-orders')} />
                  <O.ListItem leading={<Package size={16} />} title="Celadon bowl is out of stock" subtitle="233 sold this month" trailing={<O.Badge tone="warning">0 left</O.Badge>} onClick={() => open('shop-inventory')} />
                  <O.ListItem last leading={<Wallet size={16} />} title="Payout of $12,480 on Thursday" subtitle="To account ending 4021" onClick={() => open('shop-payouts')} />
                </O.List>
              </O.Card>
            </O.Well>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Order detail page (vs. the drawer on the list)
export function ShopOrderScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const o = orders.find((x) => x.id === params.id) ?? orders[0];
  const [status, setStatus] = useState(o.status);
  return (
    <Screen product={kiln} active="orders" topbar={<O.HStack gap={2}><O.IconButton size="sm" label="Back to orders" icon={<ArrowLeft />} onClick={() => open('commerce-orders')} /><O.Text weight="medium">{o.id}</O.Text></O.HStack>}>
      <Page title={`Order ${o.id}`} subtitle={`${date(o.updated)} · ${o.items} items · ${o.customer}`} actions={<><O.Button iconStart={<Printer />}>Packing slip</O.Button><O.Button variant="primary" iconStart={<Truck />} onClick={() => (setStatus('completed'), toast({ title: 'Marked as fulfilled', tone: 'success' }))}>Fulfil</O.Button></>} max={1140}>
        <Cols template="minmax(0, 1fr) 320px">
          <O.VStack gap={3}>
            <O.Well title="Items" subtitle="Ships from Lisbon studio">
              <O.Card padding="none">
                <O.Table
                  label="Items"
                  rowKey={(p) => p.id}
                  rows={products.slice(0, Math.min(o.items, 4))}
                  columns={[
                    { key: 'p', header: 'Product', render: (p) => <O.HStack gap={3}><O.Thumbnail src={sampleImages[p.img].src} alt={p.name} size="sm" /><O.VStack gap={0}><O.Text as="span" size="sm" weight="medium">{p.name}</O.Text><O.Text as="span" size="xs" tone="muted" mono>{p.sku}</O.Text></O.VStack></O.HStack> },
                    { key: 'q', header: 'Qty', align: 'right', render: () => 1 },
                    { key: 't', header: 'Total', align: 'right', render: (p) => money(p.price, 2) },
                  ]}
                />
              </O.Card>
              <O.Card padding="sm">
                <O.MetadataList alignValues="right" items={[{ label: 'Subtotal', value: money(o.total * 0.9, 2) }, { label: 'Shipping', value: money(o.total * 0.04, 2) }, { label: 'Tax', value: money(o.total * 0.06, 2) }, { label: <strong style={{ fontWeight: 500 }}>Total</strong>, value: <strong style={{ fontWeight: 500 }}>{money(o.total, 2)}</strong> }]} />
              </O.Card>
            </O.Well>
            <O.Well title="Timeline">
              <O.Card>
                <O.ActivityFeed items={[{ id: '1', who: 'System', action: 'payment captured', detail: 'Visa ending 4242', when: '9:02', icon: <CircleDollarSign size={14} /> }, { id: '2', who: 'Ana Ruiz', action: 'printed packing slip', when: '9:40', icon: <Printer size={14} /> }, { id: '3', who: 'DHL', action: o.delivery === 'failed' ? 'could not deliver: address not found' : 'picked up the parcel', when: '14:10', icon: <Truck size={14} /> }]} />
              </O.Card>
            </O.Well>
          </O.VStack>
          <O.VStack gap={3}>
            <O.Card padding="sm">
              <O.MetadataList items={[{ label: 'Payment', value: <O.StatusChip size="sm" tone="success">Paid</O.StatusChip> }, { label: 'Fulfilment', value: <O.StatusSelect options={orderStatus} value={status} onChange={setStatus} /> }]} />
            </O.Card>
            <O.Card>
              <O.VStack gap={3}>
                <O.HStack gap={3}><O.Avatar name={o.customer} size="lg" /><O.VStack gap={0}><O.Text weight="medium">{o.customer}</O.Text><O.Text size="sm" tone="muted">{o.email}</O.Text></O.VStack></O.HStack>
                <O.Divider />
                <O.Text size="sm" tone="muted">Rua Augusta 21, 1100-048 Lisbon, Portugal</O.Text>
                <O.Button size="sm" variant="ghost" iconStart={<Copy />} onClick={() => toast({ title: 'Address copied' })}>Copy address</O.Button>
              </O.VStack>
            </O.Card>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Products: image grid
export function ShopProductsScreen() {
  const { open } = useScreenNav();
  const [tab, setTab] = useState('all');
  const list = products.filter((p) => tab === 'all' || p.status === tab);
  return (
    <Screen product={kiln} active="products" topbar={<O.Text weight="medium">Products</O.Text>}>
      <Page title="Products" subtitle={`${products.length} products · ${products.filter((p) => p.stock < 20).length} low on stock`} actions={<O.Button variant="primary" iconStart={<Plus />} onClick={() => open('shop-product')}>Add product</O.Button>}>
        <O.Tabs label="Status" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'draft', label: 'Draft' }, { id: 'archived', label: 'Archived' }]} />
        <O.Grid min={210} gap={3}>
          {list.map((p) => (
            <O.Card key={p.id} padding="none" onClick={() => open('shop-product', { id: p.id })}>
              <O.AspectRatio ratio={4 / 3}>
                <img src={sampleImages[p.img].src} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </O.AspectRatio>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <O.HStack justify="between"><O.Text size="sm" weight="medium">{p.name}</O.Text><O.Text size="sm" numeric>{money(p.price)}</O.Text></O.HStack>
                <O.HStack justify="between">
                  <O.StatusChip size="sm" variant="dot" tone={p.status === 'active' ? 'success' : p.status === 'draft' ? 'neutral' : 'warning'}>{p.status}</O.StatusChip>
                  <O.Text size="xs" tone={p.stock === 0 ? 'default' : 'muted'}>{p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}</O.Text>
                </O.HStack>
              </div>
            </O.Card>
          ))}
        </O.Grid>
      </Page>
    </Screen>
  );
}

// ───────── Product editor
export function ShopProductScreen() {
  const { params, open } = useScreenNav();
  const toast = O.useToast();
  const p = products.find((x) => x.id === params.id) ?? products[0];
  const [img, setImg] = useState<number | null>(null);
  const [variants, setVariants] = useState(['Small', 'Large']);
  return (
    <Screen product={kiln} active="products" topbar={<O.Breadcrumbs items={[{ id: 'p', label: 'Products' }, { id: p.id, label: p.name }]} onNavigate={() => open('shop-products')} />}>
      <Page title={p.name} actions={<><O.Button onClick={() => toast({ title: 'Preview opens the storefront — coming soon' })}>Preview</O.Button><O.Button variant="primary" onClick={() => toast({ title: 'Product saved', tone: 'success' })}>Save</O.Button></>} max={1120}>
        <Cols template="minmax(0, 1fr) 300px">
          <O.VStack gap={3}>
            <O.Well title="Details">
              <O.Card>
                <O.VStack gap={4}>
                  <O.Field label="Title"><O.TextInput defaultValue={p.name} /></O.Field>
                  <O.Field label="Description"><O.TextArea rows={4} defaultValue="Wheel-thrown stoneware, glazed by hand in Lisbon. Dishwasher safe." /></O.Field>
                </O.VStack>
              </O.Card>
            </O.Well>
            <O.Well title="Media" subtitle="First image is the cover">
              <O.Card>
                <O.HStack gap={2} wrap>
                  {sampleImages.map((im, i) => (
                    <O.Thumbnail key={i} src={im.src} alt={im.alt} size="lg" onClick={() => setImg(i)} />
                  ))}
                  <O.Button variant="soft" iconStart={<ImagePlus />} onClick={() => toast({ title: 'Upload is coming soon' })}>Add</O.Button>
                </O.HStack>
                <O.Lightbox items={sampleImages} index={img} onIndexChange={setImg} onClose={() => setImg(null)} />
              </O.Card>
            </O.Well>
            <O.Well title="Pricing and variants">
              <O.Card>
                <O.VStack gap={4}>
                  <O.Grid min={160} gap={3}>
                    <O.Field label="Price"><O.TextInput defaultValue={String(p.price)} iconStart={<span>$</span>} inputMode="decimal" /></O.Field>
                    <O.Field label="Compare at" optional><O.TextInput iconStart={<span>$</span>} inputMode="decimal" /></O.Field>
                    <O.Field label="SKU"><O.TextInput defaultValue={p.sku} /></O.Field>
                  </O.Grid>
                  <O.Field label="Sizes" help="Press Enter to add a size"><O.Tokenizer value={variants} onChange={setVariants} /></O.Field>
                </O.VStack>
              </O.Card>
            </O.Well>
          </O.VStack>
          <O.VStack gap={3}>
            <O.Card padding="sm">
              <O.VStack gap={3}>
                <O.Field label="Status"><O.Select size="sm" defaultValue={p.status} options={[{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' }]} /></O.Field>
                <O.Field label="Collections"><O.MultiSelect defaultValue={['mugs']} options={[{ value: 'mugs', label: 'Mugs' }, { value: 'gifts', label: 'Gifts' }, { value: 'new', label: 'New in' }]} /></O.Field>
              </O.VStack>
            </O.Card>
            <O.Card padding="sm">
              <O.MetadataList alignValues="right" items={[{ label: 'In stock', value: p.stock }, { label: 'Sold (30d)', value: p.sold }, { label: 'Margin', value: '62%' }]} />
            </O.Card>
          </O.VStack>
        </Cols>
      </Page>
    </Screen>
  );
}

// ───────── Customers
export function ShopCustomersScreen() {
  const { open } = useScreenNav();
  const [seg, setSeg] = useState('all');
  const rows = names.map((n, i) => ({ id: `c${i}`, name: n, orders: (i * 7) % 23 + 1, spent: ((i * 397) % 4200) + 80, city: ['Lisbon', 'Berlin', 'Leeds', 'Tokyo', 'Dubai'][i % 5], vip: i % 4 === 0 })).filter((c) => seg === 'all' || (seg === 'vip' && c.vip) || (seg === 'new' && c.orders < 3));
  return (
    <Screen product={kiln} active="customers" topbar={<O.Text weight="medium">Customers</O.Text>}>
      <Page title="Customers" actions={<O.SegmentedControl size="sm" value={seg} onChange={setSeg} options={[{ value: 'all', label: 'All' }, { value: 'vip', label: 'VIP' }, { value: 'new', label: 'New' }]} />}>
        <O.StatGroup stats={[{ label: 'Customers', value: '12,480', delta: 6 }, { label: 'Returning', value: '38%', delta: 3 }, { label: 'Lifetime value', value: '$214', delta: 5 }, { label: 'Churned (90d)', value: '412', delta: -4 }]} />
        <O.Card padding="none">
          <O.Table label="Customers" rows={rows} rowKey={(c) => c.id} onRowClick={(c) => open('shop-customer', { id: c.id })} columns={[
            { key: 'n', header: 'Customer', sortValue: (c) => c.name, render: (c) => <O.HStack gap={2}><O.Avatar name={c.name} size="sm" />{c.name}{c.vip && <O.Badge tone="accent">VIP</O.Badge>}</O.HStack> },
            { key: 'c', header: 'City', hideBelow: 'sm', render: (c) => c.city },
            { key: 'o', header: 'Orders', align: 'right', sortValue: (c) => c.orders, render: (c) => c.orders },
            { key: 's', header: 'Spent', align: 'right', sortValue: (c) => c.spent, render: (c) => money(c.spent) },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

export function ShopCustomerScreen() {
  const { params, open } = useScreenNav();
  const n = names[Number((params.id ?? 'c0').slice(1)) % names.length];
  return (
    <Screen product={kiln} active="customers" topbar={<O.Breadcrumbs items={[{ id: 'c', label: 'Customers' }, { id: 'x', label: n }]} onNavigate={() => open('shop-customers')} />}>
      <Page max={1100}>
        <O.Card>
          <O.HStack gap={4} wrap>
            <O.Avatar name={n} size="xl" />
            <O.VStack gap={1} grow>
              <O.Heading level={1} size="h2">{n}</O.Heading>
              <O.Text size="sm" tone="muted">Customer for 2 years · Lisbon · accepts marketing</O.Text>
            </O.VStack>
            <O.HStack gap={1}><O.Badge tone="accent">VIP</O.Badge><O.Badge>Wholesale</O.Badge></O.HStack>
          </O.HStack>
        </O.Card>
        <O.KpiStrip items={[{ label: 'Spent', period: 'lifetime', value: '$2,914', delta: 12, viz: <O.SparkBars values={[2, 4, 1, 6, 3, 5, 8, 2, 4, 9]} />, note: <>Last order <O.KpiStrong>$148</O.KpiStrong></> }, { label: 'Orders', period: 'lifetime', value: '23', viz: <O.QuotaBar value={23} max={30} />, note: <>Next tier at <O.KpiStrong>30</O.KpiStrong></> }, { label: 'Returns', period: 'rate', value: '4%', delta: -1, good: 'down', viz: <O.WaffleGrid filled={1} total={23} />, note: <><O.KpiStrong>1</O.KpiStrong> of 23 orders</> }, { label: 'Reorder', period: 'every', value: '41 days', viz: <O.RangeMarker min={0} max={90} value={41} previous={52} />, note: 'Faster than average' }]} />
        <O.Well title="Orders">
          <O.Card padding="none">
            <O.Table label="Orders" rows={orders.slice(0, 4)} rowKey={(o) => o.id} onRowClick={(o) => open('shop-order', { id: o.id })} columns={[{ key: 'i', header: 'Order', render: (o) => <O.Text as="span" mono size="sm">{o.id}</O.Text> }, { key: 'd', header: 'Date', render: (o) => date(o.updated) }, { key: 't', header: 'Total', align: 'right', render: (o) => money(o.total) }]} />
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Discounts
export function ShopDiscountsScreen() {
  const toast = O.useToast();
  const [open, setOpen] = useState(false);
  const [codes, setCodes] = useState([
    { code: 'AUTUMN15', kind: '15% off', used: 412, limit: 1000, active: true, ends: 'Nov 30' },
    { code: 'FREESHIP', kind: 'Free shipping', used: 1290, limit: 0, active: true, ends: '—' },
    { code: 'VIP25', kind: '25% off', used: 88, limit: 200, active: false, ends: 'Dec 31' },
  ]);
  const [code, setCode] = useState('BLACKFRIDAY');
  return (
    <Screen product={kiln} active="discounts" topbar={<O.Text weight="medium">Discounts</O.Text>}>
      <Page title="Discounts" actions={<O.Button variant="primary" iconStart={<Tag />} onClick={() => setOpen(true)}>Create discount</O.Button>} max={1000}>
        <O.VStack gap={2}>
          {codes.map((c) => (
            <O.Card key={c.code} padding="sm">
              <O.HStack gap={3} wrap>
                <O.Code>{c.code}</O.Code>
                <O.VStack gap={0} grow>
                  <O.Text size="sm" weight="medium">{c.kind}</O.Text>
                  <O.Text size="xs" tone="muted">{c.used.toLocaleString('en-US')} used{c.limit ? ` of ${c.limit}` : ''} · ends {c.ends}</O.Text>
                </O.VStack>
                {c.limit > 0 && <div style={{ width: 140 }}><O.ProgressBar value={c.used} max={c.limit} showValue={false} /></div>}
                <O.Switch aria-label={`${c.code} active`} checked={c.active} onChange={(v) => setCodes((cs) => cs.map((x) => (x.code === c.code ? { ...x, active: v } : x)))} />
              </O.HStack>
            </O.Card>
          ))}
        </O.VStack>
      </Page>
      <O.Dialog open={open} onClose={() => setOpen(false)} title="New discount" footer={<><O.Button onClick={() => setOpen(false)}>Cancel</O.Button><O.Button variant="primary" onClick={() => (setCodes((c) => [...c, { code: code.toUpperCase(), kind: '20% off', used: 0, limit: 500, active: true, ends: 'Nov 28' }]), setOpen(false), toast({ title: `${code.toUpperCase()} created`, tone: 'success' }))}>Create</O.Button></>}>
        <O.VStack gap={4}>
          <O.Field label="Code"><O.TextInput value={code} onChange={(e) => setCode(e.target.value)} data-autofocus /></O.Field>
          <O.RadioGroup label="Type" defaultValue="pct" options={[{ value: 'pct', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }, { value: 'ship', label: 'Free shipping' }]} />
          <O.Field label="Ends"><O.DateInput defaultValue={new Date(2026, 10, 28)} /></O.Field>
        </O.VStack>
      </O.Dialog>
    </Screen>
  );
}

// ───────── Inventory
export function ShopInventoryScreen() {
  const toast = O.useToast();
  const [stock, setStock] = useState(Object.fromEntries(products.map((p) => [p.id, p.stock])));
  return (
    <Screen product={kiln} active="inventory" topbar={<O.Text weight="medium">Inventory</O.Text>}>
      <Page title="Inventory" subtitle="Lisbon studio" actions={<O.Button onClick={() => toast({ title: 'Stock saved', tone: 'success' })} variant="primary">Save changes</O.Button>}>
        {Object.values(stock).some((s) => s === 0) && <O.Banner tone="warning" title="Some items are out of stock">Customers see “Sold out” on those products.</O.Banner>}
        <O.Card padding="none">
          <O.Table label="Inventory" rows={products} rowKey={(p) => p.id} columns={[
            { key: 'p', header: 'Product', render: (p) => <O.HStack gap={2}><O.Thumbnail src={sampleImages[p.img].src} alt={p.name} size="sm" />{p.name}</O.HStack> },
            { key: 's', header: 'SKU', hideBelow: 'sm', render: (p) => <O.Text as="span" size="sm" mono tone="muted">{p.sku}</O.Text> },
            { key: 'l', header: 'Level', hideBelow: 'md', render: (p) => <div style={{ width: 120 }}><O.ProgressBar value={Math.min(100, stock[p.id])} showValue={false} tone={stock[p.id] === 0 ? 'danger' : stock[p.id] < 20 ? 'warning' : 'success'} /></div> },
            { key: 'q', header: 'Available', align: 'right', render: (p) => <div style={{ width: 130, marginLeft: 'auto' }}><O.NumberInput size="sm" label={`${p.name} stock`} value={stock[p.id]} min={0} onChange={(v) => setStock({ ...stock, [p.id]: v })} /></div> },
          ]} />
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Payouts
export function ShopPayoutsScreen() {
  return (
    <Screen product={kiln} active="payouts" topbar={<O.Text weight="medium">Payouts</O.Text>}>
      <Page title="Payouts" subtitle="Every Thursday to account ending 4021" max={1080}>
        <Cols template="minmax(0, 1fr) minmax(0, 1.4fr)" stretch>
          <O.TrendCard label="Available" ranges={{ '4W': [9800, 10400, 11200, 12480], '3M': [7200, 8100, 8800, 9600, 9100, 10200, 11000, 11800, 12480], '1Y': [3000, 4200, 5100, 6600, 7100, 8800, 9200, 10100, 11000, 12480] }} period="next payout" />
          <O.Well title="Upcoming" fill>
            <O.Card grow>
              <O.Calendar value={new Date(2026, 10, 20)} />
            </O.Card>
          </O.Well>
        </Cols>
        <O.Well title="History">
          <O.Card padding="none">
            <O.Table label="Payouts" rows={['Nov 13', 'Nov 6', 'Oct 30', 'Oct 23', 'Oct 16']} rowKey={(d) => d} renderExpanded={(d) => <O.Text size="sm" tone="muted">412 orders · fees $318.20 · refunds $96.00 · paid {d}</O.Text>} columns={[{ key: 'd', header: 'Date', render: (d) => d }, { key: 's', header: 'Status', render: () => <O.StatusChip size="sm" tone="success">Paid</O.StatusChip> }, { key: 'a', header: 'Amount', align: 'right', render: (d) => money(11000 + d.length * 211, 2) }]} />
          </O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}

// ───────── Shipping zones
export function ShopShippingScreen() {
  const toast = O.useToast();
  const zones = [
    { id: 'pt', name: 'Portugal', rates: ['Standard · €4.90 · 2–3 days', 'Express · €9.90 · next day'], countries: 1 },
    { id: 'eu', name: 'Europe', rates: ['Standard · €9.90 · 4–7 days'], countries: 26 },
    { id: 'world', name: 'Rest of world', rates: ['Tracked · €24 · 7–14 days'], countries: 182 },
  ];
  return (
    <Screen product={kiln} active="shipping" topbar={<O.Text weight="medium">Shipping</O.Text>}>
      <Page title="Shipping" subtitle="Zones and rates customers see at checkout." max={900}>
        <O.CollapsibleGroup
          single={false}
          defaultOpen={['pt']}
          items={zones.map((z) => ({
            id: z.id,
            title: <O.HStack gap={2}><Globe size={15} />{z.name}<O.Badge variant="outline">{z.countries} {z.countries === 1 ? 'country' : 'countries'}</O.Badge></O.HStack>,
            content: (
              <O.VStack gap={2}>
                {z.rates.map((r) => (
                  <O.HStack key={r} justify="between"><O.Text size="sm">{r}</O.Text><O.Button size="xs" variant="soft" onClick={() => toast({ title: 'Rate editor is coming soon' })}>Edit</O.Button></O.HStack>
                ))}
                <div><O.Button size="sm" variant="ghost" iconStart={<Plus />} onClick={() => toast({ title: 'Rate added', tone: 'success' })}>Add rate</O.Button></div>
              </O.VStack>
            ),
          }))}
        />
        <O.Card>
          <O.CardHeader title="Free shipping threshold" subtitle="Orders above this ship free in Portugal." />
          <O.Slider defaultValue={60} min={0} max={150} step={5} format={(n) => `€${n}`} label="Free shipping threshold" />
        </O.Card>
      </Page>
    </Screen>
  );
}
