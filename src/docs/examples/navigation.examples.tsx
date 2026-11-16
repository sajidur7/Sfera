import { useState } from 'react';
import { Calendar, ChartLine, FileCode, Folder, House, Inbox, Megaphone, Settings, ShoppingBag, Users, Wallet } from 'lucide-react';
import { Breadcrumbs, Button, HStack, MobileNav, Outline, Pagination, SideNav, SideNavItem, SideNavSection, Stepper, Tabs, Text, TopNav, TreeList, VStack, colors } from '../../sfera';

// #region SideNavExample
export function SideNavExample() {
  const [active, setActive] = useState('home');
  return (
    <div style={{ width: 240, maxWidth: '100%' }}>
      <SideNav>
        <SideNavSection>
          <SideNavItem item={{ id: 'home', label: 'Home', icon: <House size={17} />, count: 152 }} active={active} onSelect={setActive} />
          <SideNavItem item={{ id: 'inbox', label: 'Inbox', icon: <Inbox size={17} />, count: 8 }} active={active} onSelect={setActive} />
          <SideNavItem item={{ id: 'calendar', label: 'Calendar', icon: <Calendar size={17} /> }} active={active} onSelect={setActive} />
        </SideNavSection>
        <SideNavSection title="Workspace">
          <SideNavItem
            item={{
              id: 'projects',
              label: 'Projects',
              icon: <Folder size={17} />,
              children: [
                { id: 'p-launch', label: 'Q3 launch' },
                { id: 'p-site', label: 'Website' },
              ],
            }}
            active={active}
            onSelect={setActive}
          />
          <SideNavItem item={{ id: 'marketing', label: 'Marketing', icon: <Megaphone size={17} /> }} active={active} onSelect={setActive} />
          <SideNavItem item={{ id: 'reports', label: 'Reports', icon: <ChartLine size={17} /> }} active={active} onSelect={setActive} />
          <SideNavItem item={{ id: 'team', label: 'Team', icon: <Users size={17} /> }} active={active} onSelect={setActive} />
          <SideNavItem item={{ id: 'settings', label: 'Settings', icon: <Settings size={17} /> }} active={active} onSelect={setActive} />
        </SideNavSection>
      </SideNav>
    </div>
  );
}
// #endregion

// #region TabsExample
export function TabsExample() {
  return (
    <Tabs
      label="Record"
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'activity', label: 'Activity', count: 24 },
        { id: 'emails', label: 'Emails', count: 6 },
        { id: 'notes', label: 'Notes' },
        { id: 'files', label: 'Files', count: 3 },
        { id: 'tasks', label: 'Tasks' },
      ]}
      maxVisible={4}
    >
      {(t) => <Text tone="muted">Showing the “{t}” panel.</Text>}
    </Tabs>
  );
}
// #endregion

// #region BreadcrumbsExample
export function BreadcrumbsExample() {
  const [trail, setTrail] = useState(['workspace', 'companies', 'linear']);
  const labels: Record<string, string> = { workspace: 'Northwind', companies: 'Companies', linear: 'Linear' };
  return (
    <VStack gap={3}>
      <Breadcrumbs items={trail.map((id) => ({ id, label: labels[id] }))} onNavigate={(id) => setTrail(trail.slice(0, trail.indexOf(id) + 1))} />
      {trail.length < 3 && (
        <Text size="sm" tone="muted">
          <a href="#" onClick={(e) => (e.preventDefault(), setTrail(['workspace', 'companies', 'linear']))}>Reset trail</a>
        </Text>
      )}
    </VStack>
  );
}
// #endregion

// #region PaginationExample
export function PaginationExample() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} total={10} onChange={setPage} />;
}
// #endregion

// #region TopNavExample
export function TopNavExample() {
  const [active, setActive] = useState('product');
  return (
    <div style={{ width: '100%', position: 'relative', minHeight: 300 }}>
      <TopNav
        brand={<><span style={{ width: 22, height: 22, borderRadius: 7, background: colors.text, display: 'inline-block' }} />Kiln</>}
        active={active}
        onSelect={setActive}
        links={[
          {
            id: 'product',
            label: 'Product',
            menu: [
              { id: 'orders', label: 'Orders', description: 'Track and fulfil', icon: <ShoppingBag size={15} /> },
              { id: 'analytics', label: 'Analytics', description: 'Revenue and cohorts', icon: <ChartLine size={15} /> },
              { id: 'customers', label: 'Customers', description: 'Profiles and segments', icon: <Users size={15} /> },
              { id: 'payouts', label: 'Payouts', description: 'Weekly transfers', icon: <Wallet size={15} /> },
            ],
            featured: { title: 'New: glaze drops', description: 'Schedule limited releases.' },
          },
          { id: 'pricing', label: 'Pricing' },
          { id: 'docs', label: 'Docs' },
        ]}
        end={<Text size="sm" tone="muted">Page: {active}</Text>}
      />
      <Text size="sm" tone="muted">
        <span style={{ display: 'block', padding: 16 }}>Open “Product” to see the mega menu.</span>
      </Text>
    </div>
  );
}
// #endregion

// #region MobileNavExample
export function MobileNavExample() {
  const [tab, setTab] = useState('inbox');
  return (
    <div style={{ width: 360, maxWidth: '100%', border: `1px solid ${colors.border}`, borderRadius: 24, overflow: 'hidden' }}>
      <div style={{ height: 120, display: 'grid', placeItems: 'center', fontSize: 14 }}>{tab[0].toUpperCase() + tab.slice(1)} screen</div>
      <MobileNav
        active={tab}
        onSelect={setTab}
        items={[
          { id: 'home', label: 'Home', icon: <House size={20} /> },
          { id: 'inbox', label: 'Inbox', icon: <Inbox size={20} />, badge: 3 },
          { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
        ]}
      />
    </div>
  );
}
// #endregion

// #region StepperExample
export function StepperExample() {
  const [step, setStep] = useState(1);
  const steps = [{ label: 'Account', description: 'Email and password' }, { label: 'Workspace', description: 'Name and URL' }, { label: 'Invite', description: 'Add teammates' }, { label: 'Done' }];
  return (
    <VStack gap={5}>
      <Stepper steps={steps} current={step} onStepClick={setStep} />
      <HStack justify="between">
        <Button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button variant="primary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Continue</Button>
      </HStack>
    </VStack>
  );
}
// #endregion

// #region OutlineExample
export function OutlineExample() {
  const items = [
    { id: 'ol-intro', label: 'Introduction' },
    { id: 'ol-setup', label: 'Setup' },
    { id: 'ol-tokens', label: 'Tokens', depth: 2 as const },
    { id: 'ol-usage', label: 'Usage' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 160px', gap: 20, width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {items.map((i) => (
          <section key={i.id} id={i.id} style={{ scrollMarginTop: 80 }}>
            <Text weight="medium">{i.label}</Text>
            <Text size="sm" tone="muted">Click this section in the outline to scroll here; the outline tracks what is in view.</Text>
          </section>
        ))}
      </div>
      <Outline items={items} />
    </div>
  );
}
// #endregion

// #region TreeListExample
export function TreeListExample() {
  const [sel, setSel] = useState('forms');
  return (
    <div style={{ width: 280, maxWidth: '100%' }}>
      <TreeList
        label="Files"
        selected={sel}
        onSelect={setSel}
        defaultExpanded={['src', 'sfera']}
        nodes={[
          {
            id: 'src',
            label: 'src',
            icon: <Folder size={15} />,
            children: [
              { id: 'sfera', label: 'sfera', icon: <Folder size={15} />, children: [{ id: 'action', label: 'action.tsx', icon: <FileCode size={15} />, meta: '12k' }, { id: 'forms', label: 'forms.tsx', icon: <FileCode size={15} />, meta: '38k' }, { id: 'tokens', label: 'tokens.stylex.ts', icon: <FileCode size={15} />, meta: '3k' }] },
              { id: 'docs', label: 'docs', icon: <Folder size={15} />, children: [{ id: 'app', label: 'App.tsx', icon: <FileCode size={15} /> }] },
            ],
          },
          { id: 'pkg', label: 'package.json', icon: <FileCode size={15} /> },
        ]}
      />
      <Text size="sm" tone="muted">Selected: {sel}</Text>
    </div>
  );
}
// #endregion
