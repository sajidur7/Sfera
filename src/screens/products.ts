import {
  AtSign, BarChart3, Bell, BookOpen, Bot, Boxes, Briefcase, Building2, Calendar, ChartLine, ChartPie, CircleAlert, Contact, CreditCard, FileText, Flag, FolderKanban,
  GitBranch, Handshake, House, Inbox, KeyRound, Landmark, LayoutList, Library, ListChecks, Megaphone, MessageSquare, Network, Package, Receipt, Rocket, ScrollText,
  Settings, ShoppingBag, SlidersHorizontal, SquareKanban, Tag, Target, Terminal, Timer, Truck, UserCheck, UserPlus, Users, Wallet, Webhook, Workflow, Zap, Gauge, FileStack, ClipboardList, Palmtree, PiggyBank, Map, Wand2,
} from 'lucide-react';
import type { Product } from './kit';


export const relay: Product = {
  name: 'Relay',
  subtitle: 'CRM · Northwind',
  color: '#121214',
  user: ['Mira Chen', 'mira@northwind.com'],
  sections: [
    { items: [{ id: 'home', label: 'Home', icon: House, screen: 'crm-home' }, { id: 'inbox', label: 'Inbox', icon: Inbox, count: 4 }] },
    {
      title: 'Records',
      items: [
        { id: 'companies', label: 'Companies', icon: Building2, count: 1204, screen: 'crm-companies' },
        { id: 'people', label: 'People', icon: Contact, screen: 'crm-people' },
        { id: 'deals', label: 'Deals', icon: Handshake, screen: 'crm-deals' },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { id: 'workflows', label: 'Workflows', icon: Workflow, screen: 'crm-workflows' },
        { id: 'reports', label: 'Reports', icon: ChartPie, children: [{ id: 'r-pipeline', label: 'Pipeline', screen: 'crm-reports' }, { id: 'r-activity', label: 'Activity' }] },
        { id: 'import', label: 'Import', icon: FileStack, screen: 'crm-import' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
      ],
    },
  ],
};

export const harbor: Product = {
  name: 'Harbor',
  subtitle: 'Support desk',
  color: '#0E7C66',
  user: ['Theo Park', 'theo@harbor.help'],
  sections: [
    {
      items: [
        { id: 'inbox', label: 'Inbox', icon: Inbox, count: 12, screen: 'support-inbox' },
        { id: 'tickets', label: 'Tickets', icon: LayoutList, screen: 'support-tickets' },
        { id: 'mentions', label: 'Mentions', icon: AtSign, count: 2 },
        { id: 'assigned', label: 'Assigned to me', icon: UserCheck },
      ],
    },
    {
      title: 'Desk',
      items: [
        { id: 'contacts', label: 'Contacts', icon: Users, screen: 'support-contacts' },
        { id: 'kb', label: 'Help center', icon: BookOpen, screen: 'support-kb' },
        { id: 'macros', label: 'Macros', icon: Zap, screen: 'support-macros' },
        { id: 'sla', label: 'SLA policies', icon: Timer, screen: 'support-sla' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, screen: 'support-analytics' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
      ],
    },
  ],
};

export const kiln: Product = {
  name: 'Kiln',
  subtitle: 'Commerce',
  color: '#C2560A',
  user: ['Ana Ruiz', 'ana@kiln.shop'],
  sections: [
    { items: [{ id: 'home', label: 'Home', icon: House, screen: 'shop-home' }, { id: 'orders', label: 'Orders', icon: ShoppingBag, count: 38, screen: 'commerce-orders' }] },
    {
      title: 'Store',
      items: [
        { id: 'products', label: 'Products', icon: Package, screen: 'shop-products' },
        { id: 'inventory', label: 'Inventory', icon: Boxes, screen: 'shop-inventory' },
        { id: 'customers', label: 'Customers', icon: Users, screen: 'shop-customers' },
        { id: 'discounts', label: 'Discounts', icon: Tag, screen: 'shop-discounts' },
        { id: 'shipping', label: 'Shipping', icon: Truck, screen: 'shop-shipping' },
        { id: 'payouts', label: 'Payouts', icon: Receipt, screen: 'shop-payouts' },
      ],
    },
    { title: 'Insights', items: [{ id: 'analytics', label: 'Analytics', icon: ChartLine, screen: 'analytics-overview' }, { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }] },
  ],
};

export const signal: Product = {
  name: 'Signal',
  subtitle: 'Marketing',
  color: '#6D4DE6',
  user: ['Jonas Weber', 'jonas@signal.so'],
  sections: [
    {
      items: [
        { id: 'overview', label: 'Overview', icon: ChartLine, screen: 'analytics-overview' },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: 6, screen: 'mkt-campaigns' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, screen: 'mkt-calendar' },
      ],
    },
    {
      title: 'Audience',
      items: [
        { id: 'audiences', label: 'Audiences', icon: Target, screen: 'mkt-audiences' },
        { id: 'forms', label: 'Forms', icon: ClipboardList, screen: 'mkt-forms' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { id: 'emails', label: 'Email builder', icon: FileText, screen: 'mkt-email' },
        { id: 'experiments', label: 'Experiments', icon: Flag, screen: 'mkt-abtest' },
        { id: 'links', label: 'Link builder', icon: GitBranch, screen: 'mkt-utm' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
      ],
    },
  ],
};

export const crew: Product = {
  name: 'Crew',
  subtitle: 'People',
  color: '#17804F',
  user: ['Nadia Karim', 'nadia@crew.hr'],
  sections: [
    {
      items: [
        { id: 'directory', label: 'Directory', icon: Users, screen: 'hr-directory' },
        { id: 'org', label: 'Org chart', icon: Network, screen: 'hr-org' },
        { id: 'timeoff', label: 'Time off', icon: Palmtree, count: 3, screen: 'hr-timeoff' },
      ],
    },
    {
      title: 'Talent',
      items: [
        { id: 'hiring', label: 'Hiring', icon: UserPlus, screen: 'hr-hiring' },
        { id: 'onboarding', label: 'Onboarding', icon: ListChecks, screen: 'hr-onboarding' },
        { id: 'reviews', label: 'Reviews', icon: Briefcase, screen: 'hr-reviews' },
      ],
    },
    { title: 'Admin', items: [{ id: 'payroll', label: 'Payroll', icon: Wallet, screen: 'hr-payroll' }, { id: 'policies', label: 'Policies', icon: ScrollText, screen: 'hr-policies' }, { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }] },
  ],
};

export const stack: Product = {
  name: 'Stack',
  subtitle: 'Projects',
  color: '#2E64F0',
  user: ['Sam Ito', 'sam@stack.dev'],
  sections: [
    { items: [{ id: 'home', label: 'Home', icon: House, screen: 'pm-home' }, { id: 'inbox', label: 'Inbox', icon: Bell, count: 5, screen: 'pm-inbox' }] },
    {
      title: 'Launch v2',
      items: [
        { id: 'board', label: 'Board', icon: SquareKanban, screen: 'pm-board' },
        { id: 'list', label: 'List', icon: LayoutList, screen: 'pm-list' },
        { id: 'timeline', label: 'Timeline', icon: FolderKanban, screen: 'pm-timeline' },
        { id: 'sprint', label: 'Sprint', icon: Rocket, screen: 'pm-sprint' },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { id: 'roadmap', label: 'Roadmap', icon: Map, screen: 'pm-roadmap' },
        { id: 'docs', label: 'Docs', icon: FileText, screen: 'pm-docs' },
        { id: 'workload', label: 'Workload', icon: Gauge, screen: 'pm-workload' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
      ],
    },
  ],
};

export const ledger: Product = {
  name: 'Ledger',
  subtitle: 'Finance',
  color: '#1F2A44',
  user: ['Owen Hale', 'owen@ledger.money'],
  sections: [
    { items: [{ id: 'overview', label: 'Overview', icon: House, screen: 'fin-overview' }, { id: 'transactions', label: 'Transactions', icon: Landmark, screen: 'fin-transactions' }] },
    {
      title: 'Money in & out',
      items: [
        { id: 'invoices', label: 'Invoices', icon: FileText, count: 4, screen: 'fin-invoices' },
        { id: 'bills', label: 'Bills', icon: Receipt, screen: 'fin-bills' },
        { id: 'expenses', label: 'Expenses', icon: Wallet, screen: 'fin-expenses' },
        { id: 'cards', label: 'Cards', icon: CreditCard, screen: 'fin-cards' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { id: 'budgets', label: 'Budgets', icon: PiggyBank, screen: 'fin-budgets' },
        { id: 'reports', label: 'Reports', icon: ChartPie, screen: 'fin-reports' },
        { id: 'accounts', label: 'Accounts', icon: Library, screen: 'fin-accounts' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
      ],
    },
  ],
};

export const forge: Product = {
  name: 'Forge',
  subtitle: 'Developer platform',
  color: '#121214',
  user: ['Kofi Mensah', 'kofi@forge.run'],
  sections: [
    {
      items: [
        { id: 'projects', label: 'Projects', icon: Boxes, screen: 'dev-projects' },
        { id: 'deployments', label: 'Deployments', icon: Rocket, screen: 'dev-deployments' },
        { id: 'logs', label: 'Logs', icon: Terminal, screen: 'dev-logs' },
        { id: 'metrics', label: 'Metrics', icon: Gauge, screen: 'dev-metrics' },
        { id: 'incidents', label: 'Incidents', icon: CircleAlert, count: 1, screen: 'dev-incidents' },
      ],
    },
    {
      title: 'Configure',
      items: [
        { id: 'env', label: 'Environment', icon: SlidersHorizontal, screen: 'dev-env' },
        { id: 'keys', label: 'API keys', icon: KeyRound, screen: 'dev-keys' },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook, screen: 'dev-webhooks' },
        { id: 'usage', label: 'Usage', icon: ChartLine, screen: 'dev-usage' },
        { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
      ],
    },
  ],
};

export const muse: Product = {
  name: 'Muse',
  subtitle: 'AI assistant',
  color: '#D23A70',
  user: ['Elena Rossi', 'elena@muse.ai'],
  sections: [
    { items: [{ id: 'chat', label: 'New chat', icon: MessageSquare, screen: 'ai-chat' }, { id: 'history', label: 'History', icon: ScrollText, screen: 'ai-history' }] },
    {
      title: 'Build',
      items: [
        { id: 'agents', label: 'Agents', icon: Bot, screen: 'ai-agents' },
        { id: 'builder', label: 'Agent builder', icon: Wand2, screen: 'ai-builder' },
        { id: 'knowledge', label: 'Knowledge', icon: Library, screen: 'ai-knowledge' },
        { id: 'prompts', label: 'Prompt library', icon: BookOpen, screen: 'ai-prompts' },
      ],
    },
    { title: 'Admin', items: [{ id: 'usage', label: 'Usage', icon: ChartLine, screen: 'ai-usage' }, { id: 'models', label: 'Models', icon: SlidersHorizontal, screen: 'ai-models' }, { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }] },
  ],
};

export const system: Product = {
  name: 'Northwind',
  subtitle: 'Workspace',
  color: '#2E64F0',
  user: ['Mira Chen', 'mira@northwind.com'],
  sections: [
    {
      items: [
        { id: 'home', label: 'Apps', icon: House, screen: 'auth-workspaces' },
        { id: 'notifications', label: 'Notifications', icon: Bell, count: 6, screen: 'sys-notifications' },
        { id: 'profile', label: 'Profile', icon: Contact, screen: 'sys-profile' },
      ],
    },
    { title: 'Admin', items: [{ id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' }, { id: 'plans', label: 'Plans', icon: CreditCard, screen: 'sys-pricing' }] },
    { title: 'Pages', items: [{ id: 'auth', label: 'Sign-in pages', icon: KeyRound, children: [{ id: 'p-signin', label: 'Sign in', screen: 'auth-signin' }, { id: 'p-signup', label: 'Sign up', screen: 'auth-signup' }, { id: 'p-onb', label: 'Onboarding', screen: 'auth-onboarding' }] }, { id: 'errors', label: 'Error pages', icon: CircleAlert, children: [{ id: 'p-404', label: 'Not found', screen: 'sys-404' }, { id: 'p-500', label: 'Server error', screen: 'sys-500' }, { id: 'p-maint', label: 'Maintenance', screen: 'sys-maintenance' }] }] },
  ],
};
