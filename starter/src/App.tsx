import { useState } from 'react';
import { CircleDollarSign, House, Inbox, Moon, Plus, Settings, ShoppingBasket, Sun, Users } from 'lucide-react';
import {
  AppShell,
  Button,
  Card,
  CardHeader,
  Grid,
  HStack,
  Icon,
  IconButton,
  PageHeader,
  SideNav,
  SideNavItem,
  SideNavSection,
  StatTile,
  StatusSelect,
  Table,
  UserCard,
  VStack,
  Well,
  WorkspaceSwitcher,
  seriesColors,
  useSfera,
  useToast,
  type StatusOption,
} from './sfera';

const statuses: StatusOption[] = [
  { value: 'waiting', label: 'Waiting', tone: 'warning' },
  { value: 'processing', label: 'Processing', tone: 'info' },
  { value: 'completed', label: 'Completed', tone: 'success' },
];

/** A small working app built only from Sfera UI components. Replace it with your own. */
export function App() {
  const { mode, setMode } = useSfera();
  const toast = useToast();
  const [page, setPage] = useState('home');
  const [orders, setOrders] = useState([
    { id: 'ORD-2041', customer: 'Lea Moss', status: 'waiting', total: 3412 },
    { id: 'ORD-2040', customer: 'Theo Park', status: 'processing', total: 1899 },
    { id: 'ORD-2039', customer: 'Ana Ruiz', status: 'completed', total: 2752 },
  ]);
  return (
    <AppShell
      sidebar={
        <>
          <WorkspaceSwitcher name="Acme" subtitle="Starter workspace" color={seriesColors.blue} />
          <SideNav>
            <SideNavSection>
              <SideNavItem item={{ id: 'home', label: 'Home', icon: <Icon as={House} />, count: 3 }} active={page} onSelect={setPage} />
              <SideNavItem item={{ id: 'inbox', label: 'Inbox', icon: <Icon as={Inbox} /> }} active={page} onSelect={setPage} />
              <SideNavItem item={{ id: 'customers', label: 'Customers', icon: <Icon as={Users} /> }} active={page} onSelect={setPage} />
              <SideNavItem item={{ id: 'settings', label: 'Settings', icon: <Icon as={Settings} /> }} active={page} onSelect={setPage} />
            </SideNavSection>
          </SideNav>
          <UserCard name="You" email="you@acme.com" />
        </>
      }
      topbar={
        <HStack justify="between" grow>
          <span>{page[0].toUpperCase() + page.slice(1)}</span>
          <IconButton label={mode === 'dark' ? 'Light mode' : 'Dark mode'} icon={mode === 'dark' ? <Sun /> : <Moon />} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
        </HStack>
      }
    >
      <VStack gap={4}>
        <PageHeader
          title="Welcome to Sfera UI"
          subtitle="Edit src/App.tsx — everything on this page is a Sfera UI component."
          actions={<Button variant="primary" iconStart={<Plus />} onClick={() => toast({ title: 'It works', tone: 'success' })}>Try a toast</Button>}
        />
        <Grid min={240} gap={3}>
          <StatTile icon={<CircleDollarSign size={20} />} color={seriesColors.blue} label="Revenue" value="$48,210" delta={12} />
          <StatTile icon={<ShoppingBasket size={20} />} color={seriesColors.amber} label="Orders" value="1,204" delta={6} />
        </Grid>
        <Well title="Orders" subtitle="Change a status from its dropdown">
          <Card padding="none">
            <Table
              label="Orders"
              rows={orders}
              rowKey={(o) => o.id}
              columns={[
                { key: 'c', header: 'Customer', render: (o) => o.customer },
                { key: 's', header: 'Status', render: (o) => <StatusSelect options={statuses} value={o.status} onChange={(v) => setOrders((x) => x.map((y) => (y.id === o.id ? { ...y, status: v } : y)))} /> },
                { key: 't', header: 'Total', align: 'right', render: (o) => `$${o.total.toLocaleString('en-US')}` },
              ]}
            />
          </Card>
        </Well>
        <Card>
          <CardHeader title="Next steps" subtitle="Browse the docs for every component, then build your screens." />
        </Card>
      </VStack>
    </AppShell>
  );
}
