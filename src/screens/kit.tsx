import { createContext, useContext, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Search } from 'lucide-react';
import { AppShell, IconButton, Kbd, SearchInput, SideNav, SideNavItem, SideNavSection, Tooltip, UserCard, WorkspaceSwitcher, useToast, Icon } from '../sfera';

/** Lets screens open each other, flag unbuilt pages, and leave to the docs. */
export const ScreenNav = createContext<{ open: (id: string, params?: Record<string, string>) => void; params: Record<string, string>; exit: () => void }>({
  open: () => {},
  params: {},
  exit: () => {},
});
export const useScreenNav = () => useContext(ScreenNav);

export type ProductNavItem = { id: string; label: string; icon: LucideIcon; count?: number; screen?: string; children?: { id: string; label: string; screen?: string }[] };
export type Product = { name: string; subtitle: string; color: string; mark?: ReactNode; sections: { title?: string; items: ProductNavItem[] }[]; user: [string, string] };

/**
 * Product sidebar. An item opens its screen if one is designed; otherwise it
 * shows a "coming soon" toast and stays on the current screen.
 */
export function ProductSidebar({ product, active }: { product: Product; active: string }) {
  const { open } = useScreenNav();
  const toast = useToast();
  const lookup = new Map<string, { label: string; screen?: string }>();
  product.sections.forEach((s) =>
    s.items.forEach((i) => {
      lookup.set(i.id, i);
      i.children?.forEach((c) => lookup.set(c.id, c));
    }),
  );
  const select = (id: string) => {
    const it = lookup.get(id);
    if (it?.screen) open(it.screen);
    else toast({ title: `${it?.label ?? 'This page'} is coming soon`, description: 'Not designed yet — you are still on this screen.' });
  };
  return (
    <>
      <WorkspaceSwitcher name={product.name} subtitle={product.subtitle} color={product.color} mark={product.mark} onClick={() => toast({ title: 'Workspace switcher is coming soon' })} />
      <SearchInput size="sm" placeholder="Quick search" end={<Kbd keys={['mod', 'k']} />} aria-label="Quick search" />
      <SideNav label={product.name}>
        {product.sections.map((s, i) => (
          <SideNavSection key={i} title={s.title}>
            {s.items.map((it) => (
              <SideNavItem
                key={it.id}
                item={{ id: it.id, label: it.label, icon: <Icon as={it.icon} />, count: it.count, children: it.children?.map((c) => ({ id: c.id, label: c.label })) }}
                active={active}
                onSelect={select}
              />
            ))}
          </SideNavSection>
        ))}
      </SideNav>
      <UserCard name={product.user[0]} email={product.user[1]} />
    </>
  );
}

export function ExitButton() {
  const { exit } = useScreenNav();
  return (
    <Tooltip content="Back to screens">
      <IconButton label="Back to screens" icon={<ArrowLeft size={17} />} onClick={exit} />
    </Tooltip>
  );
}

/** Standard frame used by every screen: product sidebar + top bar with exit. */
export function Screen({ product, active, topbar, children, flush }: { product: Product; active: string; topbar?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <AppShell
      flush={flush}
      sidebar={<ProductSidebar product={product} active={active} />}
      topbar={
        <>
          <ExitButton />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{topbar}</div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}

export { Search };
