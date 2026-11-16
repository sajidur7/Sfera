import type { ReactNode } from 'react';
import { Bell, ChevronDown, Ellipsis, Inbox, Plus, Search, Settings } from 'lucide-react';
import * as O from '../sfera';
import type { FileKey } from './source';
import * as EA from './examples/action.examples';
import * as EF from './examples/forms.examples';
import * as EO from './examples/overlay.examples';
import * as EB from './examples/feedback.examples';
import * as EC from './examples/content.examples';
import * as EL from './examples/layout.examples';
import * as EN from './examples/navigation.examples';
import * as ED from './examples/data.examples';
import * as EH from './examples/charts.examples';
import { levels, orderStatus, sampleImages } from '../data/mock';
import * as EDt from './examples/dates.examples';
import * as ECh from './examples/chat.examples';
import * as EEd from './examples/editor.examples';
import * as ESt from './examples/stats.examples';
import * as EAp from './examples/app.examples';
import { Calendar as CalIcon, Folder, Search as SearchIcon, House, Inbox as InboxIcon, Bold, Italic, List as ListIcon } from 'lucide-react';

export type Example = { title: string; description: string; region: string; file: string; render: () => ReactNode; align?: 'center' | 'stretch' };
export type ApiRow = [prop: string, type: string, def: string, desc: string];
export type CompDoc = {
  slug: string;
  name: string;
  group: string;
  file: FileKey;
  regions: string[];
  description: string;
  imports: string[];
  examples: Example[];
  api?: ApiRow[];
  playground?: 'button' | 'chip' | 'segmented' | 'avatar' | 'switch';
  preview: () => ReactNode;
};

const ex = (file: string, region: string, title: string, description: string, render: () => ReactNode, align: 'center' | 'stretch' = 'center'): Example => ({ file, region, title, description, render, align });

export const groups = ['Action', 'Forms', 'Dates & time', 'Overlay', 'Feedback', 'Content', 'Layout', 'Navigation', 'Data', 'Stats', 'Charts', 'Chat', 'Editor', 'App shell'] as const;

export const components: CompDoc[] = [
  // ───────── Action
  {
    slug: 'button', name: 'Button', group: 'Action', file: 'action', regions: ['Button'], imports: ['Button'],
    description: 'The main action control: 36px tall, 10px radius, 18px icons, soft shadow on filled buttons. Five variants, four sizes, loading state; disabled buttons keep their fill and fade the label.',
    playground: 'button',
    examples: [
      ex('action', 'ButtonVariants', 'Variants', 'One primary per view. Secondary for the rest; ghost for low-weight actions.', EA.ButtonVariants),
      ex('action', 'ButtonSizes', 'Sizes', 'XS 24, small 32, medium 36 (default), large 40. Icons are sized by the button.', EA.ButtonSizes),
      ex('action', 'ButtonIcons', 'Icons and states', 'Icons sit before or after the label. Loading disables the button and shows a spinner.', EA.ButtonIcons),
    ],
    api: [
      ['variant', "'primary' | 'secondary' | 'soft' | 'ghost' | 'danger'", "'secondary'", 'Visual weight.'],
      ['size', "'xs' | 'sm' | 'md' | 'lg'", "'md'", '24 / 32 / 36 / 40px tall; radius 6 / 8 / 10 / 12; icons 14 / 16 / 18px.'],
      ['iconStart / iconEnd', 'ReactNode', '—', 'Lucide icon before / after the label.'],
      ['loading', 'boolean', 'false', 'Shows a spinner, sets aria-busy, disables clicks.'],
      ['fullWidth', 'boolean', 'false', 'Stretch to the container.'],
      ['xstyle', 'StyleXStyles', '—', 'Extra StyleX styles merged last.'],
    ],
    preview: () => <O.HStack gap={2}><O.Button variant="primary">Publish</O.Button><O.Button>Draft</O.Button></O.HStack>,
  },
  {
    slug: 'icon-button', name: 'Icon Button', group: 'Action', file: 'action', regions: ['IconButton'], imports: ['IconButton'],
    description: 'Icon-only button. The required label is its accessible name and native tooltip.',
    examples: [ex('action', 'IconButtons', 'Variants and shapes', 'Ghost by default. Use circle for floating actions.', EA.IconButtons)],
    api: [
      ['label', 'string', 'required', 'Accessible name.'],
      ['icon', 'ReactNode', 'required', 'A Lucide icon.'],
      ['shape', "'square' | 'circle'", "'square'", 'Corner shape.'],
      ['variant / size', 'as Button', "'ghost' / 'md'", ''],
    ],
    preview: () => <O.HStack gap={2}><O.IconButton label="Search" variant="secondary" icon={<Search size={16} />} /><O.IconButton label="Add" variant="primary" shape="circle" icon={<Plus size={16} />} /></O.HStack>,
  },
  {
    slug: 'button-group', name: 'Button Group', group: 'Action', file: 'action', regions: ['ButtonGroup'], imports: ['ButtonGroup'],
    description: 'Joins related buttons into one strip, or spaces them evenly.',
    examples: [ex('action', 'ButtonGroupExample', 'Attached and spaced', 'Attached groups share one outline; spaced groups keep an 8px gap.', EA.ButtonGroupExample)],
    api: [['attached', 'boolean', 'true', 'Join into one strip.'], ['label', 'string', '—', 'aria-label for the group.']],
    preview: () => <O.ButtonGroup><O.Button>Day</O.Button><O.Button>Week</O.Button><O.Button>Month</O.Button></O.ButtonGroup>,
  },
  {
    slug: 'toggle-button', name: 'Toggle Button', group: 'Action', file: 'action', regions: ['ToggleButton'], imports: ['ToggleButton'],
    description: 'A button that stays on or off. Exposes aria-pressed.',
    examples: [ex('action', 'ToggleButtons', 'Formatting toggles', 'Group toggles with ButtonGroup. Controlled or uncontrolled.', EA.ToggleButtons)],
    api: [['pressed', 'boolean', '—', 'Controlled state.'], ['defaultPressed', 'boolean', 'false', 'Initial state.'], ['onPressedChange', '(p: boolean) => void', '—', '']],
    preview: () => <O.ToggleButton defaultPressed>Bold</O.ToggleButton>,
  },
  {
    slug: 'segmented-control', name: 'Segmented Control', group: 'Action', file: 'action', regions: ['SegmentedControl'], imports: ['SegmentedControl'],
    description: 'Pill switch between a few views. The white thumb slides to the choice; arrow keys move it.',
    playground: 'segmented',
    examples: [ex('action', 'Segmented', 'Text and icons', 'Use for 2–5 options that change a view, not for navigation.', EA.Segmented)],
    api: [['options', '{ value, label, icon? }[]', 'required', ''], ['value / defaultValue', 'string', 'first', ''], ['onChange', '(v: string) => void', '—', ''], ['size', "'sm' | 'md'", "'md'", ''], ['fullWidth', 'boolean', 'false', 'Stretch items evenly.']],
    preview: () => <O.SegmentedControl size="sm" options={[{ value: 'w', label: 'Weekly' }, { value: 'm', label: 'Monthly' }, { value: 'y', label: 'Yearly' }]} />,
  },
  {
    slug: 'link', name: 'Link', group: 'Action', file: 'action', regions: ['Link'], imports: ['Link'],
    description: 'Inline text link in the accent ink. External links get an arrow and open in a new tab.',
    examples: [ex('action', 'Links', 'In a sentence', 'Subtle links drop the colour until hover.', EA.Links)],
    preview: () => <O.Link href="#components">Browse components</O.Link>,
  },
  // ───────── Forms
  {
    slug: 'field', name: 'Field', group: 'Forms', file: 'forms', regions: ['Field'], imports: ['Field', 'TextInput'],
    description: 'Label, control, and help or error text. Connects ids and aria-describedby automatically.',
    examples: [ex('forms', 'FieldBasics', 'Labels, help and errors', 'Errors say what to fix, sit under the field and are announced.', EF.FieldBasics, 'stretch'), ex('forms', 'FormLayout', 'A small form', 'Two columns on wide screens, one on phones.', EF.FormLayout, 'stretch')],
    api: [['label', 'ReactNode', 'required', 'Visible label (never placeholder-only).'], ['help', 'ReactNode', '—', ''], ['error', 'ReactNode', '—', 'Replaces help and marks the control invalid.'], ['optional', 'boolean', 'false', 'Shows an “optional” tag.']],
    preview: () => <div style={{ width: 200 }}><O.Field label="Email"><O.TextInput placeholder="you@acme.com" /></O.Field></div>,
  },
  {
    slug: 'text-input', name: 'Text Input', group: 'Forms', file: 'forms', regions: ['TextInput'], imports: ['TextInput'],
    description: 'Single-line input with optional leading icon and trailing slot. 16px text on phones to stop zoom.',
    examples: [ex('forms', 'FieldBasics', 'Inside fields', 'Use semantic types and autocomplete.', EF.FieldBasics, 'stretch')],
    api: [['size', "'sm' | 'md' | 'lg'", "'md'", ''], ['iconStart', 'ReactNode', '—', ''], ['end', 'ReactNode', '—', 'Trailing content (unit, button).'], ['invalid', 'boolean', 'from Field', ''], ['…input props', '', '', 'Passed to <input>.']],
    preview: () => <div style={{ width: 200 }}><O.TextInput iconStart={<Search size={15} />} placeholder="Search" /></div>,
  },
  {
    slug: 'search-input', name: 'Search Input', group: 'Forms', file: 'forms', regions: ['SearchInput'], imports: ['SearchInput'],
    description: 'Text input with a search icon and a clear button once there is text.',
    examples: [ex('forms', 'SearchAndNumber', 'Search and number', 'Type to see the clear button.', EF.SearchAndNumber, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.SearchInput defaultValue="Linear" /></div>,
  },
  {
    slug: 'number-input', name: 'Number Input', group: 'Forms', file: 'forms', regions: ['NumberInput'], imports: ['NumberInput'],
    description: 'Numeric field with steppers and arrow-key support, clamped to min/max.',
    examples: [ex('forms', 'SearchAndNumber', 'Seats', 'Arrow up/down also step.', EF.SearchAndNumber, 'stretch')],
    preview: () => <div style={{ width: 140 }}><O.NumberInput defaultValue={12} label="Seats" /></div>,
  },
  {
    slug: 'text-area', name: 'Text Area', group: 'Forms', file: 'forms', regions: ['TextArea'], imports: ['TextArea'],
    description: 'Multi-line input that resizes vertically.',
    examples: [ex('forms', 'TextAreaExample', 'With a counter', 'Help text doubles as a live character count.', EF.TextAreaExample, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.TextArea placeholder="Write a reply…" rows={2} /></div>,
  },
  {
    slug: 'checkbox', name: 'Checkbox', group: 'Forms', file: 'forms', regions: ['Checkbox'], imports: ['Checkbox'],
    description: 'On, off or mixed. The tick scales in. Label and description are part of the hit area.',
    examples: [ex('forms', 'Checkboxes', 'Parent and children', 'The parent shows mixed when only some children are on.', EF.Checkboxes, 'stretch')],
    api: [['checked', "boolean | 'mixed'", '—', ''], ['defaultChecked', 'boolean', 'false', ''], ['onChange', '(v: boolean) => void', '—', ''], ['label / description', 'ReactNode', '—', '']],
    preview: () => <O.VStack gap={2}><O.Checkbox label="Mentions" defaultChecked /><O.Checkbox label="Digest" /></O.VStack>,
  },
  {
    slug: 'radio-group', name: 'Radio Group', group: 'Forms', file: 'forms', regions: ['RadioGroup'], imports: ['RadioGroup'],
    description: 'Pick one of a few options. Native radios underneath, so arrow keys work.',
    examples: [ex('forms', 'Radios', 'Plans', 'Options can carry a description and be disabled.', EF.Radios, 'stretch')],
    preview: () => <O.RadioGroup defaultValue="a" options={[{ value: 'a', label: 'Starter' }, { value: 'b', label: 'Team' }]} />,
  },
  {
    slug: 'switch', name: 'Switch', group: 'Forms', file: 'forms', regions: ['Switch'], imports: ['Switch'],
    description: 'Instant on/off setting. The thumb stretches while pressed and slides with the system curve.',
    playground: 'switch',
    examples: [ex('forms', 'Switches', 'Sizes and states', 'Press and hold to feel the thumb stretch.', EF.Switches, 'stretch')],
    api: [['checked / defaultChecked', 'boolean', 'false', ''], ['onChange', '(v: boolean) => void', '—', ''], ['size', "'sm' | 'md'", "'md'", ''], ['label', 'ReactNode', '—', '']],
    preview: () => <O.Switch defaultChecked label="Auto-assign" />,
  },
  {
    slug: 'select', name: 'Select', group: 'Forms', file: 'forms', regions: ['Select'], imports: ['Select'],
    description: 'Custom listbox with keyboard support. Stays inside the viewport on phones.',
    examples: [ex('forms', 'SelectExample', 'Regions and owners', 'Options can carry a description.', EF.SelectExample, 'stretch')],
    api: [['options', '{ value, label, icon?, description? }[]', 'required', ''], ['value / defaultValue', 'string', '—', ''], ['onChange', '(v: string) => void', '—', ''], ['placeholder', 'string', "'Select…'", ''], ['size', "'sm' | 'md'", "'md'", ''], ['width', "'full' | 'auto'", "'full'", '']],
    preview: () => <div style={{ width: 180 }}><O.Select defaultValue="eu" options={[{ value: 'eu', label: 'Europe' }, { value: 'us', label: 'United States' }]} /></div>,
  },
  {
    slug: 'slider', name: 'Slider', group: 'Forms', file: 'forms', regions: ['Slider'], imports: ['Slider'],
    description: 'Range input with a flat accent fill and a formatted value.',
    examples: [ex('forms', 'SliderExample', 'Budget and effort', 'Use `format` to show units or named steps.', EF.SliderExample, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.Slider defaultValue={60} label="Volume" /></div>,
  },
  // ───────── Overlay
  {
    slug: 'dialog', name: 'Dialog', group: 'Overlay', file: 'overlay', regions: ['Dialog'], imports: ['Dialog'],
    description: 'Modal with title, description, body and footer. Traps focus, closes on Escape or scrim, becomes a bottom sheet on phones.',
    examples: [ex('overlay', 'DialogExample', 'Rename', 'Focus goes to the field marked data-autofocus.', EO.DialogExample)],
    api: [['open', 'boolean', 'required', ''], ['onClose', '() => void', 'required', ''], ['title / description', 'ReactNode', '—', ''], ['footer', 'ReactNode', '—', 'Actions, right-aligned on a grey strip.'], ['size', "'sm' | 'md' | 'lg' | 'xl'", "'md'", ''], ['flush', 'boolean', 'false', 'Remove body padding.']],
    preview: () => <O.Button variant="primary">Open dialog</O.Button>,
  },
  {
    slug: 'alert-dialog', name: 'Alert Dialog', group: 'Overlay', file: 'overlay', regions: ['AlertDialog'], imports: ['AlertDialog'],
    description: 'Confirm a destructive or irreversible action. Cancel is focused first.',
    examples: [ex('overlay', 'AlertDialogExample', 'Delete with undo', 'Confirm first, then offer undo.', EO.AlertDialogExample)],
    preview: () => <O.Button variant="danger">Delete</O.Button>,
  },
  {
    slug: 'drawer', name: 'Drawer', group: 'Overlay', file: 'overlay', regions: ['Drawer'], imports: ['Drawer'],
    description: 'Side panel for details and edits without leaving the page. Full width on phones.',
    examples: [ex('overlay', 'DrawerExample', 'Record panel', 'Slides in from the right; left drawers are used for mobile nav.', EO.DrawerExample)],
    preview: () => <O.Button>Open record</O.Button>,
  },
  {
    slug: 'popover', name: 'Popover', group: 'Overlay', file: 'overlay', regions: ['Popover'], imports: ['Popover'],
    description: 'Floating panel anchored to a trigger. Flips and clamps to stay on screen.',
    examples: [ex('overlay', 'PopoverExample', 'Column picker', 'Popovers hold small, interactive content.', EO.PopoverExample)],
    preview: () => <O.Button iconEnd={<ChevronDown size={14} />}>Columns</O.Button>,
  },
  {
    slug: 'tooltip', name: 'Tooltip', group: 'Overlay', file: 'overlay', regions: ['Tooltip'], imports: ['Tooltip'],
    description: 'Short hint on hover or focus. Delayed in, instant out.',
    examples: [ex('overlay', 'TooltipExample', 'Placements', 'Tooltips never hold the only copy of important information.', EO.TooltipExample)],
    preview: () => <O.HStack gap={2}><O.IconButton label="Notifications" variant="secondary" icon={<Bell size={15} />} /><span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 7, background: O.colors.text, color: O.colors.page }}>Notifications</span></O.HStack>,
  },
  {
    slug: 'dropdown-menu', name: 'Dropdown Menu', group: 'Overlay', file: 'overlay', regions: ['DropdownMenu'], imports: ['DropdownMenu'],
    description: 'Actions, checkboxes, radio groups, submenus, labels and dividers. Full keyboard support; shortcuts drawn as key caps.',
    examples: [ex('overlay', 'MenuExample', 'Record actions', 'Destructive items sit last, in red.', EO.MenuExample)],
    api: [['trigger', 'ReactElement', 'required', 'Any button; gets aria-expanded.'], ['items', 'MenuItem[]', 'required', 'item | checkbox | radio | divider | label'], ['placement', 'Placement', "'bottom-start'", '']],
    preview: () => <O.IconButton label="More" variant="secondary" icon={<Ellipsis size={16} />} />,
  },
  {
    slug: 'toast', name: 'Toast', group: 'Overlay', file: 'overlay', regions: ['Toast'], imports: ['useToast'],
    description: 'Brief confirmation in the corner. Polite live region, 4s auto-dismiss, optional undo action.',
    examples: [ex('overlay', 'ToastExample', 'Tones and actions', 'Toasts rise in with the system curve and never steal focus.', EO.ToastExample)],
    api: [['title', 'ReactNode', 'required', ''], ['description', 'ReactNode', '—', ''], ['tone', "'neutral' | 'success' | 'danger' | 'info'", "'neutral'", ''], ['action', '{ label, onClick }', '—', ''], ['duration', 'number', '4000', 'ms']],
    preview: () => <O.Banner tone="success" title="Invoice sent" />,
  },
  // ───────── Feedback
  {
    slug: 'badge', name: 'Badge', group: 'Feedback', file: 'feedback', regions: ['Badge'], imports: ['Badge'],
    description: 'Small count or label in a pill.',
    examples: [ex('feedback', 'BadgeExample', 'Tones and variants', 'Soft by default; solid for counts that need attention.', EB.BadgeExample)],
    preview: () => <O.HStack gap={1}><O.Badge tone="success">Paid</O.Badge><O.Badge tone="danger">Overdue</O.Badge><O.Badge variant="solid">152</O.Badge></O.HStack>,
  },
  {
    slug: 'status-chip', name: 'Status Chip', group: 'Feedback', file: 'feedback', regions: ['StatusChip'], imports: ['StatusChip'],
    description: 'Status as words plus colour: a soft tinted fill, or an outlined pill with a dot.',
    playground: 'chip',
    examples: [ex('feedback', 'StatusChips', 'Soft and dot', 'Waiting, failed, shipped, processing.', EB.StatusChips)],
    api: [['tone', "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'", "'neutral'", ''], ['variant', "'soft' | 'dot'", "'soft'", ''], ['size', "'sm' | 'md'", "'md'", '']],
    preview: () => <O.HStack gap={1}><O.StatusChip tone="success">Shipped</O.StatusChip><O.StatusChip tone="danger">Failed</O.StatusChip></O.HStack>,
  },
  {
    slug: 'status-dot', name: 'Status Dot', group: 'Feedback', file: 'feedback', regions: ['StatusDot'], imports: ['StatusDot'],
    description: 'A coloured dot. Always pair it with a text label.',
    examples: [ex('feedback', 'StatusDots', 'System status', '`live` pulses softly.', EB.StatusDots)],
    preview: () => <O.HStack gap={2}><O.StatusDot tone="success" live /><O.Text size="sm">Operational</O.Text></O.HStack>,
  },
  {
    slug: 'banner', name: 'Banner', group: 'Feedback', file: 'feedback', regions: ['Banner'], imports: ['Banner'],
    description: 'Inline message for a page or section, with optional action and dismiss.',
    examples: [ex('feedback', 'Banners', 'Tones', 'Warnings and errors use role="alert".', EB.Banners, 'stretch')],
    preview: () => <div style={{ width: 220 }}><O.Banner tone="warning" title="Card expires soon" /></div>,
  },
  {
    slug: 'progress-bar', name: 'Progress Bar', group: 'Feedback', file: 'feedback', regions: ['ProgressBar'], imports: ['ProgressBar'],
    description: 'Determinate progress. Animates with transform only.',
    examples: [ex('feedback', 'Progress', 'Values and tones', 'Use tone to flag quota or error levels.', EB.Progress, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.ProgressBar label="Storage" value={62} /></div>,
  },
  {
    slug: 'spinner', name: 'Spinner', group: 'Feedback', file: 'feedback', regions: ['Spinner', 'Skeleton'], imports: ['Spinner', 'Skeleton'],
    description: 'Spinner for short waits; Skeleton placeholders for anything over a second.',
    examples: [ex('feedback', 'Loading', 'Spinner and skeleton', 'Skeleton cross-fades to content.', EB.Loading, 'stretch')],
    preview: () => <O.HStack gap={3}><O.Spinner /><div style={{ width: 120 }}><O.VStack gap={2}><O.Skeleton shape="text" width="80%" /><O.Skeleton shape="text" /></O.VStack></div></O.HStack>,
  },
  {
    slug: 'empty-state', name: 'Empty State', group: 'Feedback', file: 'feedback', regions: ['EmptyState'], imports: ['EmptyState'],
    description: 'Dashed panel that says what is empty and offers the next step.',
    examples: [ex('feedback', 'Empty', 'Inbox', 'One primary action, one secondary.', EB.Empty, 'stretch')],
    preview: () => <div style={{ width: 220 }}><O.EmptyState icon={<Inbox size={16} />} title="No conversations" /></div>,
  },
  {
    slug: 'animated-number', name: 'Animated Number', group: 'Feedback', file: 'feedback', regions: ['AnimatedNumber'], imports: ['AnimatedNumber'],
    description: 'Digits roll on a drum to the new value. Screen readers get the final text.',
    examples: [ex('feedback', 'NumberRoll', 'Rolling digits', 'Use on numbers that change while the user watches.', EB.NumberRoll)],
    preview: () => <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.04em' }}><O.AnimatedNumber value={31600} /></span>,
  },
  // ───────── Content
  {
    slug: 'heading', name: 'Heading', group: 'Content', file: 'content', regions: ['Heading', 'Text'], imports: ['Heading', 'Text'],
    description: 'Big, light headings (weight 500, tight tracking) and body text with tone and size.',
    examples: [ex('content', 'Headings', 'Heading scale', '`level` sets the tag; `size` sets the look.', EC.Headings, 'stretch'), ex('content', 'TextExample', 'Text', 'Muted for secondary, mono for labels, numeric for figures.', EC.TextExample, 'stretch')],
    preview: () => <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.03em' }}>Aa Heading</span>,
  },
  {
    slug: 'avatar', name: 'Avatar', group: 'Content', file: 'content', regions: ['Avatar', 'AvatarGroup'], imports: ['Avatar', 'AvatarGroup'],
    description: 'Initials tinted per name, or an image. Groups overlap and show +N.',
    playground: 'avatar',
    examples: [ex('content', 'Avatars', 'Presence, sizes and groups', 'Online, away, busy and offline each have their own shape, so they read without colour. Hover a group member to lift it.', EC.Avatars)],
    preview: () => <O.AvatarGroup names={['Mira Chen', 'Theo Park', 'Ana Ruiz', 'Jonas Weber', 'Lea Moss']} size="md" max={3} />,
  },
  {
    slug: 'kbd', name: 'Kbd', group: 'Content', file: 'content', regions: ['Kbd'], imports: ['Kbd'],
    description: 'Keyboard shortcuts as key caps. Modifiers are Lucide icons, never text symbols.',
    examples: [ex('content', 'KeyCaps', 'Shortcuts', 'Names: mod, shift, alt, ctrl, enter, backspace, arrows, space.', EC.KeyCaps)],
    preview: () => <O.Kbd keys={['mod', 'shift', 'k']} />,
  },
  {
    slug: 'divider', name: 'Divider', group: 'Content', file: 'content', regions: ['Divider'], imports: ['Divider'],
    description: 'Hairline separators, horizontal, vertical or with a label.',
    examples: [ex('content', 'Dividers', 'Orientations', '', EC.Dividers, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.Divider label="or" /></div>,
  },
  {
    slug: 'code', name: 'Code', group: 'Content', file: 'content', regions: ['Code'], imports: ['Code', 'CodeBlock'],
    description: 'Inline code and code blocks in Geist Mono.',
    examples: [ex('content', 'CodeExample', 'Inline and block', '', EC.CodeExample, 'stretch')],
    preview: () => <O.Code>npm run build</O.Code>,
  },
  {
    slug: 'icon', name: 'Icon', group: 'Content', file: 'icons', regions: ['Icon'], imports: ['Icon'],
    description: 'Lucide icons drawn as SVG at fixed sizes with one stroke width. See Iconography for the set.',
    examples: [ex('content', 'KeyCaps', 'Icons inside key caps', 'Icons are decorative unless given a label.', EC.KeyCaps)],
    preview: () => <O.HStack gap={3}><Inbox size={18} /><Settings size={18} /><Bell size={18} /><Search size={18} /></O.HStack>,
  },
  // ───────── Layout
  {
    slug: 'well', name: 'Well', group: 'Layout', file: 'layout', regions: ['Well'], imports: ['Well', 'Card'],
    description: 'The signature container: a soft grey well (24px radius, 8px padding) holding white cards. Use it to group real things.',
    examples: [ex('layout', 'WellExample', 'Chart wells', 'Header row with title, subtitle and a date stepper; equal heights in a row.', EL.WellExample, 'stretch')],
    api: [['title / subtitle', 'ReactNode', '—', 'Header row inside the well.'], ['actions', 'ReactNode', '—', 'Right side of the header.'], ['fill', 'boolean', 'false', 'Stretch to row height.']],
    preview: () => <div style={{ width: 200 }}><O.Well title="Steps"><O.Card padding="sm"><O.Text size="sm">31,600</O.Text></O.Card></O.Well></div>,
  },
  {
    slug: 'card', name: 'Card', group: 'Layout', file: 'layout', regions: ['Card', 'CardHeader'], imports: ['Card', 'CardHeader'],
    description: 'White inner card (16px radius, hairline) with an optional header: eyebrow, big value, actions.',
    examples: [ex('layout', 'CardExample', 'Cards', 'Pass onClick to make the whole card a button.', EL.CardExample, 'stretch')],
    preview: () => <div style={{ width: 180 }}><O.Card padding="sm"><O.CardHeader eyebrow="Revenue" value="$48,210" /></O.Card></div>,
  },
  {
    slug: 'stack', name: 'Stack', group: 'Layout', file: 'layout', regions: ['Stack'], imports: ['HStack', 'VStack'],
    description: 'Flex rows and columns on the 4px spacing scale.',
    examples: [ex('layout', 'StackExample', 'Rows and columns', '`gap` is in 4px steps.', EL.StackExample, 'stretch')],
    preview: () => <O.HStack gap={1}>{[1, 2, 3].map((i) => <span key={i} style={{ width: 28, height: 28, borderRadius: 8, border: '1px dashed currentColor', opacity: 0.5 }} />)}</O.HStack>,
  },
  {
    slug: 'grid', name: 'Grid', group: 'Layout', file: 'layout', regions: ['Grid'], imports: ['Grid', 'GridItem'],
    description: 'Responsive grid with equal-height rows. Fixed columns step down to 2 then 1. GridItem spans columns.',
    examples: [ex('layout', 'GridExample', 'Four columns', 'Resize the window to see it step down.', EL.GridExample, 'stretch')],
    preview: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: 4 }}>{Array.from({ length: 6 }, (_, i) => <span key={i} style={{ height: 20, borderRadius: 6, border: '1px dashed currentColor', opacity: 0.5 }} />)}</div>,
  },
  {
    slug: 'page-header', name: 'Page Header', group: 'Layout', file: 'layout', regions: ['PageHeader'], imports: ['PageHeader'],
    description: 'Page title, one-line subtitle and actions. Wraps on phones.',
    examples: [ex('layout', 'PageHeaderExample', 'Records page', '', EL.PageHeaderExample, 'stretch')],
    preview: () => <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>Companies</span>,
  },
  // ───────── Navigation
  {
    slug: 'side-nav', name: 'Side Nav', group: 'Navigation', file: 'navigation', regions: ['SideNav'], imports: ['SideNav', 'SideNavSection', 'SideNavItem'],
    description: 'Sidebar navigation. Active item is filled with the accent and white text, with an optional count. Items can expand to sub-navigation.',
    examples: [ex('navigation', 'SideNavExample', 'Sections and sub-items', 'Sub-items use a soft grey active state.', EN.SideNavExample)],
    api: [['item', '{ id, label, icon?, count?, children? }', 'required', ''], ['active', 'string', '—', 'Active id.'], ['onSelect', '(id) => void', 'required', ''], ['soft', 'boolean', 'false', 'Grey active state.']],
    preview: () => <div style={{ width: 180 }}><O.SideNavItem item={{ id: 'h', label: 'Home', icon: <Inbox size={16} />, count: 152 }} active="h" onSelect={() => {}} /><O.SideNavItem item={{ id: 'p', label: 'Projects', icon: <Settings size={16} /> }} active="h" onSelect={() => {}} /></div>,
  },
  {
    slug: 'tabs', name: 'Tabs', group: 'Navigation', file: 'navigation', regions: ['Tabs'], imports: ['Tabs'],
    description: 'Underline tabs with a sliding indicator and counts. Extra tabs go into a More menu (maxVisible).',
    examples: [ex('navigation', 'TabsExample', 'Record tabs', 'Arrow keys move between tabs.', EN.TabsExample, 'stretch')],
    preview: () => <div style={{ width: 220 }}><O.Tabs tabs={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Activity' }]} /></div>,
  },
  {
    slug: 'breadcrumbs', name: 'Breadcrumbs', group: 'Navigation', file: 'navigation', regions: ['Breadcrumbs'], imports: ['Breadcrumbs'],
    description: 'Where you are in a hierarchy three or more levels deep.',
    examples: [ex('navigation', 'BreadcrumbsExample', 'Record trail', 'Click a crumb to go back up.', EN.BreadcrumbsExample, 'stretch')],
    preview: () => <O.Breadcrumbs items={[{ id: 'a', label: 'Companies' }, { id: 'b', label: 'Linear' }]} />,
  },
  {
    slug: 'pagination', name: 'Pagination', group: 'Navigation', file: 'navigation', regions: ['Pagination'], imports: ['Pagination'],
    description: 'Prev / pages / Next. Collapses to “Page 3 of 10” on phones.',
    examples: [ex('navigation', 'PaginationExample', 'Ten pages', '', EN.PaginationExample, 'stretch')],
    preview: () => <div style={{ width: 230 }}><O.Pagination page={2} total={5} onChange={() => {}} /></div>,
  },
  // ───────── Data
  {
    slug: 'table', name: 'Table', group: 'Data', file: 'data', regions: ['Table'], imports: ['Table', 'type Column'],
    description: 'Calm data table: hairline rows, sortable headers, row selection, expandable rows, columns that hide on small screens.',
    examples: [ex('data', 'TableExample', 'Orders', 'Purchase status changes from the dropdown; sort by customer, date or price.', ED.TableExample, 'stretch')],
    api: [['columns', 'Column<T>[]', 'required', '{ key, header, render, sortValue?, align?, hideBelow? }'], ['rows', 'T[]', 'required', ''], ['rowKey', '(row) => string', 'required', ''], ['selectable', 'boolean', 'false', ''], ['onRowClick', '(row) => void', '—', ''], ['compact', 'boolean', 'false', '40px rows.']],
    preview: () => <div style={{ width: 230, fontSize: 12 }}>{['Lea Moss', 'Theo Park', 'Ana Ruiz'].map((n, i) => <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? `1px solid ${O.colors.border}` : 0 }}><span>{n}</span><O.StatusChip size="sm" tone={(['warning', 'success', 'info'] as const)[i]}>{['Waiting', 'Shipped', 'Processing'][i]}</O.StatusChip></div>)}</div>,
  },
  {
    slug: 'stat-group', name: 'Stat Group', group: 'Data', file: 'data', regions: ['StatGroup'], imports: ['StatGroup'],
    description: 'Key numbers in cells divided by hairlines — one surface, not a card per number.',
    examples: [ex('data', 'StatGroupExample', 'Usage stats', 'Two columns on phones.', ED.StatGroupExample, 'stretch')],
    preview: () => <div style={{ width: 230 }}><O.StatGroup stats={[{ label: 'Peak', value: '562M' }, { label: 'Streak', value: '62d' }]} /></div>,
  },
  {
    slug: 'metadata-list', name: 'Metadata List', group: 'Data', file: 'data', regions: ['MetadataList'], imports: ['MetadataList'],
    description: 'Label and value rows for record attributes.',
    examples: [ex('data', 'MetadataExample', 'Company attributes', '', ED.MetadataExample, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.MetadataList items={[{ label: 'Born', value: '28 Jul 1997' }, { label: 'Blood', value: 'A rh+' }]} alignValues="right" /></div>,
  },
  {
    slug: 'status-select', name: 'Status Select', group: 'Data', file: 'data', regions: ['StatusSelect'], imports: ['StatusSelect'],
    description: 'Status shown as dot + label inside a select. Pick to change it.',
    examples: [ex('data', 'StatusSelectExample', 'Order status', '', ED.StatusSelectExample)],
    preview: () => <O.StatusSelect options={orderStatus} value="waiting" onChange={() => {}} />,
  },
  // ───────── Charts
  {
    slug: 'bar-chart', name: 'Bar Chart', group: 'Charts', file: 'charts', regions: ['BarChart'], imports: ['BarChart'],
    description: 'Soft bars in grey tracks. Hover or focus a bar to read its value.',
    examples: [ex('charts', 'BarChartExample', 'Steps per day', 'The date stepper changes the data.', EH.BarChartExample, 'stretch')],
    api: [['data', '{ label, value }[]', 'required', ''], ['height', 'number', '180', ''], ['highlight', 'number', '—', 'Index drawn in full accent.'], ['format', '(n) => string', 'toLocaleString', '']],
    preview: () => <div style={{ width: 200 }}><O.BarChart height={70} data={[4, 2, 1.5, 4.5, 5, 3.5, 2].map((v, i) => ({ label: 'MTWTFSS'[i], value: v }))} /></div>,
  },
  {
    slug: 'ring-score', name: 'Ring Score', group: 'Charts', file: 'charts', regions: ['RingScore'], imports: ['RingScore'],
    description: 'Ring or segmented donut with a big number in the middle.',
    examples: [ex('charts', 'RingScoreExample', 'Sleep score', 'Segments sum to the score.', EH.RingScoreExample)],
    preview: () => <O.RingScore value={98} size={84} thickness={8} />,
  },
  {
    slug: 'heatmap', name: 'Heatmap', group: 'Charts', file: 'charts', regions: ['Heatmap'], imports: ['Heatmap'],
    description: 'Week × day activity grid in five accent levels.',
    examples: [ex('charts', 'HeatmapExample', 'Token usage', 'The segmented control changes the range.', EH.HeatmapExample, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.Heatmap values={levels(16 * 7)} /></div>,
  },
  {
    slug: 'line-chart', name: 'Line Chart', group: 'Charts', file: 'charts', regions: ['LineChart'], imports: ['LineChart'],
    description: 'Thin lines on hairline gridlines. Flat strokes, no area fills.',
    examples: [ex('charts', 'LineChartExample', 'Visitors vs last period', 'Hover to read values.', EH.LineChartExample, 'stretch')],
    preview: () => <div style={{ width: 200 }}><O.LineChart height={60} series={[{ name: 'a', values: [3, 4, 3.5, 5, 6, 5.5, 7] }]} /></div>,
  },
  {
    slug: 'date-stepper', name: 'Date Stepper', group: 'Charts', file: 'charts', regions: ['DateStepper'], imports: ['DateStepper'],
    description: '‹ 29 Jun – 5 Jul › range stepper for card headers.',
    examples: [ex('charts', 'BarChartExample', 'In a chart card', 'Step the range to change the chart.', EH.BarChartExample, 'stretch')],
    preview: () => <O.DateStepper />,
  },
  {
    slug: 'meter', name: 'Meter', group: 'Charts', file: 'charts', regions: ['Meter'], imports: ['Meter'],
    description: 'Tiny 4-bar meter for confidence or signal.',
    examples: [ex('charts', 'MeterExample', 'Confidence', '', EH.MeterExample)],
    preview: () => <O.HStack gap={2}><O.Meter level={3} /><O.Text size="sm">High</O.Text></O.HStack>,
  },
  // ───────── App shell
  {
    slug: 'app-shell', name: 'App Shell', group: 'App shell', file: 'shell', regions: ['AppShell', 'WorkspaceSwitcher', 'UserCard'], imports: ['AppShell', 'WorkspaceSwitcher', 'UserCard'],
    description: 'Sidebar + sticky top bar + content. The sidebar becomes a drawer under 900px. Every screen uses it.',
    examples: [ex('navigation', 'SideNavExample', 'Sidebar contents', 'Open any screen to see the full shell.', EN.SideNavExample)],
    preview: () => <div style={{ width: 200, display: 'flex', gap: 6, height: 70 }}><span style={{ width: 50, borderRadius: 8, border: `1px solid ${O.colors.border}` }} /><span style={{ flex: 1, borderRadius: 8, border: `1px solid ${O.colors.border}` }} /></div>,
  },
];

components.push(...more(), ...phase3());
// Keep library order = sidebar order so Previous / Next follow the groups.
components.sort((a, b) => groups.indexOf(a.group as (typeof groups)[number]) - groups.indexOf(b.group as (typeof groups)[number]));
export const bySlug = Object.fromEntries(components.map((c) => [c.slug, c]));

const box = (w: number, h: number) => <span style={{ width: w, height: h, borderRadius: 8, border: `1px solid ${O.colors.border}`, display: 'inline-block' }} />;

function more(): CompDoc[] {
  return [
    // ───────── Action
    { slug: 'toolbar', name: 'Toolbar', group: 'Action', file: 'action', regions: ['Toolbar'], imports: ['Toolbar', 'ToolbarSeparator'], description: 'A row of related controls with roving arrow-key focus and separators.', examples: [ex('action', 'ToolbarExample', 'Formatting toolbar', 'Left/Right arrows move between buttons.', EA.ToolbarExample)], preview: () => <O.Toolbar label="Preview"><O.IconButton size="sm" label="Bold" icon={<Bold size={14} />} /><O.IconButton size="sm" label="Italic" icon={<Italic size={14} />} /><O.ToolbarSeparator /><O.IconButton size="sm" label="List" icon={<ListIcon size={14} />} /></O.Toolbar> },
    { slug: 'more-menu', name: 'More Menu', group: 'Action', file: 'overlay', regions: ['MoreMenu'], imports: ['MoreMenu'], description: 'The “…” button for secondary actions, opening a DropdownMenu.', examples: [ex('action', 'MoreMenuExample', 'Row actions', '', EA.MoreMenuExample)], preview: () => <O.IconButton label="More" variant="secondary" icon={<Ellipsis size={16} />} /> },
    // ───────── Forms
    { slug: 'checkbox-list', name: 'Checkbox List', group: 'Forms', file: 'forms', regions: ['CheckboxList'], imports: ['CheckboxList'], description: 'Bordered list of checkbox rows with a select-all header and per-row meta.', examples: [ex('forms', 'CheckboxListExample', 'Webhook events', 'Disabled rows are skipped by select-all.', EF.CheckboxListExample, 'stretch')], preview: () => <div style={{ width: 200 }}><O.CheckboxList label="Events" defaultValue={['a']} items={[{ value: 'a', label: 'order.created' }, { value: 'b', label: 'refund.issued' }]} /></div> },
    { slug: 'file-input', name: 'File Input', group: 'Forms', file: 'forms', regions: ['FileInput'], imports: ['FileInput'], description: 'Drop zone and file picker that lists chosen files with sizes and remove buttons.', examples: [ex('forms', 'FileInputExample', 'Attachments', 'Drop files or click to choose.', EF.FileInputExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.FileInput hint="PDF up to 10 MB" /></div> },
    { slug: 'typeahead', name: 'Typeahead', group: 'Forms', file: 'forms', regions: ['Combobox', 'Typeahead'], imports: ['Typeahead'], description: 'Search field with suggestions (combobox). Arrow keys and Enter pick.', examples: [ex('forms', 'TypeaheadExample', 'Company search', '', EF.TypeaheadExample, 'stretch')], api: [['options', '{ value, label, description?, icon? }[]', 'required', ''], ['value / onChange', 'string | null', '—', ''], ['placeholder', 'string', "'Search…'", '']], preview: () => <div style={{ width: 200 }}><O.TextInput iconStart={<SearchIcon size={14} />} placeholder="Fjord Fr…" /></div> },
    { slug: 'multi-select', name: 'Multi Select', group: 'Forms', file: 'forms', regions: ['Combobox', 'MultiSelect'], imports: ['MultiSelect'], description: 'Pick several options; they show as removable tokens. Can create new values. Also covers multi and complex selectors.', examples: [ex('forms', 'MultiSelectExample', 'People and labels', 'Backspace removes the last token.', EF.MultiSelectExample, 'stretch')], api: [['options', 'ComboOption[]', 'required', ''], ['value / defaultValue', 'string[]', '[]', ''], ['allowCreate', 'boolean', 'false', 'Offer “Create …” for new text.']], preview: () => <div style={{ width: 210 }}><O.MultiSelect defaultValue={['a', 'b']} options={[{ value: 'a', label: 'Mira' }, { value: 'b', label: 'Theo' }]} /></div> },
    { slug: 'tokenizer', name: 'Tokenizer', group: 'Forms', file: 'forms', regions: ['Tokenizer'], imports: ['Tokenizer'], description: 'Free-text token input for emails or tags, with validation.', examples: [ex('forms', 'TokenizerExample', 'Invite emails', 'Invalid emails turn the field red and are not added.', EF.TokenizerExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.Tokenizer defaultValue={['lea@moss.studio']} /></div> },
    // ───────── Dates
    { slug: 'calendar', name: 'Calendar', group: 'Dates & time', file: 'dates', regions: ['Calendar'], imports: ['Calendar'], description: 'Month grid for a single date or a range. Monday first, min/max, arrow-key navigation.', examples: [ex('dates', 'CalendarExample', 'Single and range', 'Days before 3 Nov are disabled in the first calendar.', EDt.CalendarExample)], api: [['mode', "'single' | 'range'", "'single'", ''], ['value / onChange', 'Date', '—', 'Single mode.'], ['range / onRangeChange', '[Date|null, Date|null]', '—', 'Range mode.'], ['min / max', 'Date', '—', '']], preview: () => <div style={{ transform: 'scale(.62)', transformOrigin: 'center' }}><O.Calendar value={new Date(2026, 10, 18)} /></div> },
    { slug: 'date-input', name: 'Date Input', group: 'Dates & time', file: 'dates', regions: ['DateInput', 'DateRangeInput', 'DateTimeInput'], imports: ['DateInput', 'DateRangeInput', 'DateTimeInput'], description: 'Date, date range (with presets) and date + time fields that open a Calendar.', examples: [ex('dates', 'DateInputs', 'Due date, range, time, meeting', '', EDt.DateInputs, 'stretch')], preview: () => <div style={{ width: 200 }}><O.DateInput defaultValue={new Date(2026, 10, 28)} /></div> },
    { slug: 'time-input', name: 'Time Input', group: 'Dates & time', file: 'dates', regions: ['TimeInput'], imports: ['TimeInput'], description: 'Time field in the Sfera input frame, built on the native time input for accessibility.', examples: [ex('dates', 'DateInputs', 'In a form', '', EDt.DateInputs, 'stretch')], preview: () => <div style={{ width: 150 }}><O.TimeInput /></div> },
    { slug: 'timestamp', name: 'Timestamp', group: 'Dates & time', file: 'dates', regions: ['Timestamp'], imports: ['Timestamp'], description: 'Relative time that refreshes every minute, with the full date on hover.', examples: [ex('dates', 'TimestampExample', 'Relative and absolute', '', EDt.TimestampExample, 'stretch')], preview: () => <O.Timestamp date={new Date(Date.now() - 3 * 3600e3)} /> },
    { slug: 'timer', name: 'Timer', group: 'Dates & time', file: 'dates', regions: ['Timer'], imports: ['Timer'], description: 'Stopwatch or countdown with start, pause and reset.', examples: [ex('dates', 'TimerExample', 'Stopwatch and countdown', 'The countdown shows a toast when it ends.', EDt.TimerExample)], preview: () => <O.Timer /> },
    // ───────── Overlay
    { slug: 'context-menu', name: 'Context Menu', group: 'Overlay', file: 'overlay', regions: ['ContextMenu'], imports: ['ContextMenu'], description: 'Right-click menu for an area. Also opens on long-press and Shift+F10.', examples: [ex('overlay', 'ContextMenuExample', 'File actions', '', EO.ContextMenuExample)], preview: () => <div style={{ padding: '14px 18px', border: `1px dashed ${O.colors.borderStrong}`, borderRadius: 12, fontSize: 12 }}>Right-click</div> },
    { slug: 'hover-card', name: 'Hover Card', group: 'Overlay', file: 'overlay', regions: ['HoverCard'], imports: ['HoverCard'], description: 'Rich preview on hover or focus, with a short grace period so you can move into it.', examples: [ex('overlay', 'HoverCardExample', 'Person preview', 'Hover or tab to the name.', EO.HoverCardExample)], preview: () => <O.HStack gap={2}><O.Avatar name="Mira Chen" /><O.Text size="sm" weight="medium">Mira Chen</O.Text></O.HStack> },
    { slug: 'info-tip', name: 'Info Tip', group: 'Overlay', file: 'overlay', regions: ['InfoTip'], imports: ['InfoTip'], description: 'Small (i) button that explains a term on hover or focus.', examples: [ex('overlay', 'InfoTipExample', 'Metric definition', '', EO.InfoTipExample)], preview: () => <O.HStack gap={1}><O.Text size="sm">ARR</O.Text><O.InfoTip>Annual recurring revenue</O.InfoTip></O.HStack> },
    { slug: 'bottom-sheet', name: 'Bottom Sheet', group: 'Overlay', file: 'overlay', regions: ['BottomSheet'], imports: ['BottomSheet'], description: 'Sheet that rises from the bottom; drag the grip down to close. Best on phones.', examples: [ex('overlay', 'BottomSheetExample', 'Sort options', '', EO.BottomSheetExample)], preview: () => <div style={{ width: 160, height: 90, borderRadius: 14, border: `1px solid ${O.colors.border}`, position: 'relative', overflow: 'hidden' }}><span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, background: O.colors.well, borderRadius: '14px 14px 0 0' }} /></div> },
    { slug: 'command-palette', name: 'Command Palette', group: 'Overlay', file: 'overlay', regions: ['CommandPalette'], imports: ['CommandPalette'], description: 'Search-and-run dialog, grouped results, full keyboard control. Bind it to mod+K.', examples: [ex('overlay', 'CommandPaletteExample', 'Commands', 'Press mod+K anywhere on this page.', EO.CommandPaletteExample)], api: [['open / onClose', 'boolean / () => void', 'required', ''], ['commands', '{ id, label, group, icon?, shortcut?, keywords?, run }[]', 'required', ''], ['footer', 'ReactNode | null', '—', 'null hides it.']], preview: () => <O.Button iconStart={<SearchIcon size={14} />} iconEnd={<O.Kbd keys={['mod', 'k']} />}>Search</O.Button> },
    { slug: 'lightbox', name: 'Lightbox', group: 'Overlay', file: 'overlay', regions: ['Lightbox'], imports: ['Lightbox'], description: 'Full-screen image viewer with arrows, captions and keyboard control.', examples: [ex('overlay', 'LightboxExample', 'Gallery', 'Click a thumbnail; use Left/Right/Escape.', EO.LightboxExample)], preview: () => <O.HStack gap={1}>{sampleImages.slice(0, 3).map((im) => <O.Thumbnail key={im.src} src={im.src} alt={im.alt} size="sm" />)}</O.HStack> },
    // ───────── Content
    { slug: 'blockquote', name: 'Blockquote', group: 'Content', file: 'content', regions: ['Blockquote'], imports: ['Blockquote'], description: 'Quoted text with an attribution line.', examples: [ex('content', 'BlockquoteExample', 'Customer quote', '', EC.BlockquoteExample, 'stretch')], preview: () => <div style={{ width: 200 }}><O.Blockquote>Calm screens, fewer tickets.</O.Blockquote></div> },
    { slug: 'citation', name: 'Citation', group: 'Content', file: 'content', regions: ['Citation'], imports: ['Citation'], description: 'Numbered inline citations and source pills for assistant answers.', examples: [ex('content', 'CitationExample', 'Inline and source', '', EC.CitationExample, 'stretch')], preview: () => <O.Text size="sm">Compiled at build time<O.Citation n={1} href="https://stylexjs.com" title="StyleX" /></O.Text> },
    { slug: 'markdown', name: 'Markdown', group: 'Content', file: 'content', regions: ['Markdown'], imports: ['Markdown'], description: 'Small, safe Markdown renderer: headings, lists, quotes, code, links. No raw HTML.', examples: [ex('content', 'MarkdownExample', 'Release notes', '', EC.MarkdownExample, 'stretch')], preview: () => <div style={{ width: 200 }}><O.Markdown source={'**Release 0.2**\n- Calendar\n- Chat'} /></div> },
    { slug: 'thumbnail', name: 'Thumbnail', group: 'Content', file: 'content', regions: ['Thumbnail', 'AspectRatio'], imports: ['Thumbnail', 'AspectRatio'], description: 'Square image previews in three sizes, and an AspectRatio box for media.', examples: [ex('content', 'MediaExample', 'Media', '', EC.MediaExample, 'stretch')], preview: () => <O.HStack gap={2}><O.Thumbnail src={sampleImages[1].src} alt="" size="md" /><O.Thumbnail alt="File" size="md" /></O.HStack> },
    { slug: 'token', name: 'Token', group: 'Content', file: 'content', regions: ['Token', 'VisuallyHidden'], imports: ['Token', 'VisuallyHidden'], description: 'Pill for a value (tag, filter, mention), optionally removable. VisuallyHidden adds screen-reader text.', examples: [ex('content', 'TokenExample', 'Tags', '', EC.TokenExample)], preview: () => <O.HStack gap={1}><O.Token>Enterprise</O.Token><O.Token selected>Owner</O.Token></O.HStack> },
    { slug: 'carousel', name: 'Carousel', group: 'Content', file: 'content', regions: ['Carousel'], imports: ['Carousel'], description: 'Scroll-snap carousel with arrows and dots. Never auto-plays.', examples: [ex('content', 'CarouselExample', 'Two per view', 'Swipe, scroll, or use the arrows.', EC.CarouselExample, 'stretch')], preview: () => <O.HStack gap={1}>{sampleImages.slice(0, 2).map((im) => <img key={im.src} src={im.src} alt="" style={{ width: 90, height: 60, borderRadius: 10, objectFit: 'cover' }} />)}</O.HStack> },
    // ───────── Layout
    { slug: 'section', name: 'Section', group: 'Layout', file: 'layout', regions: ['Section', 'Center'], imports: ['Section', 'Center'], description: 'Titled page block without a fill; Center places content in the middle of its box.', examples: [ex('layout', 'SectionExample', 'Section with Center', '', EL.SectionExample, 'stretch')], preview: () => <span style={{ fontSize: 15, fontWeight: 500 }}>Open deals</span> },
    { slug: 'form-layout', name: 'Form Layout', group: 'Layout', file: 'layout', regions: ['FormLayout'], imports: ['FormLayout'], description: 'Settings-style form: label column on the left, fields on the right. Stacks on phones.', examples: [ex('layout', 'FormLayoutExample', 'Workspace settings', '', EL.FormLayoutExample, 'stretch')], preview: () => <div style={{ display: 'grid', gridTemplateColumns: '60px 120px', gap: 8 }}>{box(60, 10)}{box(120, 24)}{box(60, 10)}{box(120, 24)}</div> },
    { slug: 'collapsible', name: 'Collapsible', group: 'Layout', file: 'layout', regions: ['Collapsible'], imports: ['Collapsible', 'CollapsibleGroup'], description: 'Show/hide blocks and accordions. Height animates with the system curve.', examples: [ex('layout', 'CollapsibleExample', 'FAQ accordion', 'Only one item stays open.', EL.CollapsibleExample, 'stretch')], preview: () => <div style={{ width: 200 }}><O.Collapsible title="Is dark mode automatic?">Yes.</O.Collapsible></div> },
    { slug: 'resizable', name: 'Resizable', group: 'Layout', file: 'layout', regions: ['Resizable', 'ScrollableArea'], imports: ['Resizable', 'ScrollableArea'], description: 'Two panes with a draggable, keyboard-operable divider; ScrollableArea gives a pane its own scroll.', examples: [ex('layout', 'ScrollResizeExample', 'Folders and preview', '', EL.ScrollResizeExample, 'stretch')], preview: () => <O.HStack gap={1}>{box(60, 60)}<span style={{ width: 4, height: 28, borderRadius: 4, background: O.colors.borderStrong }} />{box(100, 60)}</O.HStack> },
    { slug: 'selectable-card', name: 'Selectable Card', group: 'Layout', file: 'layout', regions: ['SelectableCard'], imports: ['SelectableCard'], description: 'A card that acts as a radio or checkbox option, e.g. plans and templates.', examples: [ex('layout', 'SelectableCardExample', 'Plans', '', EL.SelectableCardExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.SelectableCard selected onSelect={() => {}} title="Team" description="Unlimited seats" /></div> },
    // ───────── Navigation
    { slug: 'top-nav', name: 'Top Nav', group: 'Navigation', file: 'navigation', regions: ['TopNav'], imports: ['TopNav'], description: 'Horizontal navigation with an optional mega menu (grid of links + featured card).', examples: [ex('navigation', 'TopNavExample', 'Site header', '', EN.TopNavExample, 'stretch')], preview: () => <O.HStack gap={2}><O.Text size="sm" weight="medium">Kiln</O.Text><O.Badge variant="outline">Product</O.Badge><O.Text size="xs" tone="muted">Pricing</O.Text></O.HStack> },
    { slug: 'mobile-nav', name: 'Mobile Nav', group: 'Navigation', file: 'navigation', regions: ['MobileNav'], imports: ['MobileNav'], description: 'Bottom tab bar for phones: up to five destinations, icon + label, badges.', examples: [ex('navigation', 'MobileNavExample', 'Phone tabs', '', EN.MobileNavExample)], preview: () => <div style={{ width: 200 }}><O.MobileNav active="i" onSelect={() => {}} items={[{ id: 'h', label: 'Home', icon: <House size={18} /> }, { id: 'i', label: 'Inbox', icon: <InboxIcon size={18} /> }, { id: 'c', label: 'Calendar', icon: <CalIcon size={18} /> }]} /></div> },
    { slug: 'stepper', name: 'Stepper', group: 'Navigation', file: 'navigation', regions: ['Stepper'], imports: ['Stepper'], description: 'Progress through a multi-step flow; finished steps are clickable to go back.', examples: [ex('navigation', 'StepperExample', 'Onboarding', 'Labels hide under 560px; numbers stay.', EN.StepperExample, 'stretch')], preview: () => <div style={{ width: 220 }}><O.Stepper current={1} steps={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]} /></div> },
    { slug: 'outline', name: 'Outline', group: 'Navigation', file: 'navigation', regions: ['Outline'], imports: ['Outline'], description: '“On this page” list that tracks the section in view and scrolls to it.', examples: [ex('navigation', 'OutlineExample', 'Page outline', '', EN.OutlineExample, 'stretch')], preview: () => <div style={{ width: 150 }}><O.Outline title="On this page" items={[{ id: 'x-a', label: 'Introduction' }, { id: 'x-b', label: 'Setup' }]} /></div> },
    { slug: 'tree-list', name: 'Tree List', group: 'Navigation', file: 'navigation', regions: ['TreeList'], imports: ['TreeList'], description: 'Nested, collapsible tree for files and hierarchies. Right/Left arrows open and close.', examples: [ex('navigation', 'TreeListExample', 'Files', '', EN.TreeListExample)], preview: () => <div style={{ width: 170 }}><O.TreeList label="Files" defaultExpanded={['s']} nodes={[{ id: 's', label: 'src', icon: <Folder size={14} />, children: [{ id: 'f', label: 'forms.tsx' }] }]} /></div> },
    // ───────── Data
    { slug: 'list', name: 'List', group: 'Data', file: 'data', regions: ['List'], imports: ['List', 'ListItem'], description: 'Rows with leading, title/subtitle and trailing slots. Also covers Item.', examples: [ex('data', 'ListExample', 'Conversations', '', ED.ListExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.List><O.ListItem last leading={<O.Avatar name="Lea Moss" size="sm" />} title="Lea Moss" subtitle="Refund request" /></O.List></div> },
    { slug: 'overflow-list', name: 'Overflow List', group: 'Data', file: 'data', regions: ['OverflowList'], imports: ['OverflowList'], description: 'Shows what fits on one line, then a “+N” menu with the rest.', examples: [ex('data', 'OverflowListExample', 'Tags', 'Drag the box corner to resize it.', ED.OverflowListExample, 'stretch')], preview: () => <O.HStack gap={1}><O.StatusChip size="sm">Enterprise</O.StatusChip><O.StatusChip size="sm">SSO</O.StatusChip><O.Badge variant="outline">+4</O.Badge></O.HStack> },
    { slug: 'power-search', name: 'Power Search', group: 'Data', file: 'data', regions: ['PowerSearch'], imports: ['PowerSearch'], description: 'Search with filter chips: field · is/is not · value, each part editable.', examples: [ex('data', 'PowerSearchExample', 'Company filters', 'Click “is” to flip it; click the value to change it.', ED.PowerSearchExample, 'stretch')], preview: () => <O.HStack gap={1}><O.Token>Stage is Won</O.Token><O.Token>Owner is Mira</O.Token></O.HStack> },
    // ───────── Chat
    { slug: 'chat', name: 'Chat Layout', group: 'Chat', file: 'chat', regions: ['ChatLayout', 'ChatMessage', 'ChatSystemMessage', 'ChatTokenizedText', 'useStreamingText'], imports: ['ChatLayout', 'ChatMessage', 'ChatSystemMessage', 'ChatTokenizedText', 'useStreamingText'], description: 'Assistant conversation: sticky-bottom scroll, jump-to-latest, user bubbles, assistant messages with copy/retry/feedback, streaming caret.', examples: [ex('chat', 'ChatExample', 'Store assistant', 'Watch it stream, then send your own message.', ECh.ChatExample, 'stretch')], preview: () => <O.VStack gap={1} align="end"><span style={{ padding: '6px 10px', borderRadius: 14, background: O.colors.well, fontSize: 12 }}>How did we do?</span><O.Text size="xs" tone="muted">Revenue grew 12%…</O.Text></O.VStack> },
    { slug: 'chat-tool-calls', name: 'Chat Tool Calls', group: 'Chat', file: 'chat', regions: ['ChatToolCalls'], imports: ['ChatToolCalls'], description: 'Collapsible summary of tool calls with running, done and failed states.', examples: [ex('chat', 'ToolCallsExample', 'Agent steps', '', ECh.ToolCallsExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.ChatToolCalls calls={[{ id: '1', name: 'Run', detail: 'npm run build', status: 'done' }]} /></div> },
    { slug: 'chat-composer', name: 'Chat Composer', group: 'Chat', file: 'chat', regions: ['ChatComposer'], imports: ['ChatComposer'], description: 'Auto-growing message box with attach, dictation (Web Speech where available), send and stop.', examples: [ex('chat', 'ComposerExample', 'Composer', '', ECh.ComposerExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.ChatComposer onSend={() => {}} placeholder="Message…" /></div> },
    // ───────── Editor
    { slug: 'rich-text-editor', name: 'Rich Text Editor', group: 'Editor', file: 'editor', regions: ['RichTextEditor', 'RichTextView', 'sanitize'], imports: ['RichTextEditor', 'RichTextView'], description: 'Formatting toolbar, shortcuts, sanitised paste and an auto-link plugin; RichTextView renders the result safely.', examples: [ex('editor', 'EditorExample', 'Meeting notes', 'Type a URL and press space to see auto-linking.', EEd.EditorExample, 'stretch')], preview: () => <O.Toolbar label="Format"><O.IconButton size="sm" label="Bold" icon={<Bold size={14} />} /><O.IconButton size="sm" label="Italic" icon={<Italic size={14} />} /></O.Toolbar> },
  ];
}

function phase3(): CompDoc[] {
  return [
    { slug: 'stat-tile', name: 'Stat Tile', group: 'Stats', file: 'stats', regions: ['StatTile', 'DeltaPill'], imports: ['StatTile', 'DeltaPill'], description: 'KPI tile: label and tinted icon on the grey well; the white card holds the value, the change in words (“↑16% vs October”) and a tiny trend.', examples: [ex('stats', 'StatTilesExample', 'Store KPIs', 'Refunds going down counts as good (good="up" flips the colour).', ESt.StatTilesExample, 'stretch')], api: [['icon / color', 'ReactNode / string', '—', 'Flat colour, never a gradient.'], ['value', 'ReactNode', 'required', ''], ['delta', 'number', 'required', 'Percent change.'], ['good', "'up' | 'down'", "'up'", 'Which direction is good.'], ['info', 'ReactNode', '—', 'InfoTip text.']], preview: () => <div style={{ width: 200 }}><O.StatTile icon={<O.Icon as={O.iconCatalog.DollarSign} />} label="Revenue" value="$152k" delta={16} /></div> },
    { slug: 'kpi-strip', name: 'KPI Strip', group: 'Stats', file: 'stats', regions: ['KpiStrip', 'MiniViz'], imports: ['KpiStrip', 'KpiStrong', 'QuotaBar', 'SparkBars', 'WaffleGrid', 'RangeMarker'], description: 'A well of KPI cards, each in its own colour: icon and label, a period pill, value + change, a tiny chart (quota ticks, spark bars, waffle, range) and a one-line note.', examples: [ex('stats', 'KpiStripExample', 'Sales KPIs', 'Four cells on desktop, two on tablets, one on phones.', ESt.KpiStripExample, 'stretch')], preview: () => <div style={{ width: 210 }}><O.QuotaBar value={0.83} max={1} ticks={22} /></div> },
    { slug: 'usage-meter', name: 'Usage Meter', group: 'Stats', file: 'stats', regions: ['UsageMeter'], imports: ['UsageMeter'], description: 'Stacked usage bar (e.g. a context window) with legend chips; click a chip to focus its segment.', examples: [ex('stats', 'UsageMeterExample', 'Context usage', 'Compact shrinks the chat, file and tool segments.', ESt.UsageMeterExample)], preview: () => <div style={{ display: 'flex', gap: 3, width: 200, height: 26 }}>{[45, 28, 8, 3, 3].map((w, i) => <span key={i} style={{ width: `${w}%`, borderRadius: 6, background: Object.values(O.seriesColors)[i] }} />)}<span style={{ flex: 1, borderRadius: 6, background: O.colors.track }} /></div> },
    { slug: 'stacked-bar-chart', name: 'Stacked Bar Chart', group: 'Stats', file: 'stats', regions: ['StackedBarChart'], imports: ['StackedBarChart'], description: 'Stacked bars with an optional negative series under the axis. Hover or focus a column for the breakdown.', examples: [ex('stats', 'StackedBarsExample', 'Traffic by source', 'Bounced visits sit below the line.', ESt.StackedBarsExample, 'stretch')], preview: () => <O.HStack gap={1} align="end">{[5, 7, 4, 8, 6].map((h, i) => <span key={i} style={{ width: 14, height: h * 8, borderRadius: 4, background: O.seriesColors.violet, opacity: 0.4 + i * 0.12 }} />)}</O.HStack> },
    { slug: 'trend-card', name: 'Trend Card', group: 'Stats', file: 'stats', regions: ['TrendCard'], imports: ['TrendCard'], description: 'Big value with faded decimals, change line, smooth trend with an endpoint ring, and a range switcher.', examples: [ex('stats', 'TrendCardExample', 'Portfolio', '', ESt.TrendCardExample)], preview: () => <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.04em' }}>$58,834<span style={{ opacity: 0.4 }}>.75</span></span> },
    { slug: 'insight-card', name: 'Insight Card', group: 'Stats', file: 'stats', regions: ['InsightCard'], imports: ['InsightCard', 'InsightMention', 'InsightNumber'], description: 'Paged insights: a sentence with a mention and mono numbers, two compared items, a trend snapshot with an empty state, and a follow-up question.', examples: [ex('stats', 'InsightCardExample', 'Store insights', 'Page through all three; the first has no trend data.', ESt.InsightCardExample)], preview: () => <O.Text size="sm">Ash Grey is down <O.InsightNumber>−6%</O.InsightNumber></O.Text> },
    { slug: 'condition-builder', name: 'Condition Builder', group: 'Stats', file: 'stats', regions: ['ConditionBuilder'], imports: ['ConditionBuilder'], description: 'If / Else rule editor: entity · field · is · value rows, add and remove, reorder with the grip (arrow keys).', examples: [ex('stats', 'ConditionBuilderExample', 'Order rule', '', ESt.ConditionBuilderExample, 'stretch')], preview: () => <O.HStack gap={1}><O.Badge tone="warning">If / Else</O.Badge><O.Token>order</O.Token><O.Text size="xs">glaze is Ash Grey</O.Text></O.HStack> },
    { slug: 'kanban-board', name: 'Kanban Board', group: 'Data', file: 'data', regions: ['KanbanBoard'], imports: ['KanbanBoard'], description: 'Columns of cards. Drag between columns, or use each card’s menu as the keyboard and touch alternative.', examples: [ex('app', 'KanbanExample', 'Tasks', '', EAp.KanbanExample, 'stretch')], preview: () => <O.HStack gap={1} align="start">{[3, 2, 1].map((n, i) => <span key={i} style={{ width: 54, padding: 4, borderRadius: 10, background: O.colors.well, display: 'flex', flexDirection: 'column', gap: 3 }}>{Array.from({ length: n }, (_, k) => <span key={k} style={{ height: 14, borderRadius: 5, background: O.colors.surface }} />)}</span>)}</O.HStack> },
    { slug: 'activity-feed', name: 'Activity Feed', group: 'Data', file: 'data', regions: ['ActivityFeed'], imports: ['ActivityFeed'], description: 'Vertical timeline of events with icons and a connecting rail.', examples: [ex('app', 'ActivityExample', 'Record activity', '', EAp.ActivityExample, 'stretch')], preview: () => <div style={{ width: 200 }}><O.ActivityFeed items={[{ id: 'a', who: 'Ana', action: 'won a deal', when: '3h' }]} /></div> },
    { slug: 'gantt-chart', name: 'Gantt Chart', group: 'Charts', file: 'charts', regions: ['GanttChart'], imports: ['GanttChart'], description: 'Tasks on a timeline with owners, progress and a today line. Scrolls sideways inside itself.', examples: [ex('app', 'GanttExample', 'Launch plan', '', EAp.GanttExample, 'stretch')], preview: () => <O.VStack gap={1}>{[[0, 60], [30, 70], [60, 50]].map(([l, w], i) => <span key={i} style={{ marginLeft: l, width: w, height: 12, borderRadius: 4, background: O.colors.track, boxShadow: `inset 3px 0 0 ${O.accent.base}` }} />)}</O.VStack> },
    { slug: 'event-calendar', name: 'Event Calendar', group: 'Dates & time', file: 'dates', regions: ['EventCalendar'], imports: ['EventCalendar'], description: 'Month view with coloured events. Click a day to add, an event to open. Phones show dots.', examples: [ex('app', 'EventCalendarExample', 'Content calendar', 'Click any day to add a post.', EAp.EventCalendarExample, 'stretch')], preview: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 22px)', gap: 2 }}>{Array.from({ length: 21 }, (_, i) => <span key={i} style={{ height: 16, borderRadius: 3, background: [3, 10, 17].includes(i) ? O.accent.base : O.colors.track }} />)}</div> },
    { slug: 'flow-canvas', name: 'Flow Canvas', group: 'Charts', file: 'flow', regions: ['FlowCanvas'], imports: ['FlowCanvas'], description: 'Workflow canvas: tagged nodes joined by curved edges. Drag nodes; arrow keys nudge the selected one. Plain well background, no dot grid.', examples: [ex('app', 'FlowExample', 'Order automation', '', EAp.FlowExample, 'stretch')], preview: () => <O.VStack gap={1} align="center"><O.Badge tone="accent">Trigger</O.Badge><span style={{ width: 1, height: 14, background: O.colors.borderStrong }} /><O.Badge tone="warning">If / Else</O.Badge></O.VStack> },
    { slug: 'log-viewer', name: 'Log Viewer', group: 'Content', file: 'content', regions: ['LogViewer'], imports: ['LogViewer'], description: 'Monospace log stream with level colours; follows new lines while you are at the bottom.', examples: [ex('app', 'LogExample', 'Build log', '', EAp.LogExample, 'stretch')], preview: () => <O.Code>INFO ✓ built in 5.1s</O.Code> },
    { slug: 'password-input', name: 'Password & Code', group: 'Forms', file: 'forms', regions: ['PasswordInput', 'OtpInput'], imports: ['PasswordInput', 'OtpInput'], description: 'Password field with show/hide and strength meter; one-time code boxes where paste fills every digit.', examples: [ex('app', 'AuthInputsExample', 'Sign-up inputs', '', EAp.AuthInputsExample, 'stretch')], preview: () => <div style={{ width: 200 }}><O.PasswordInput defaultValue="hunter22!" /></div> },
    { slug: 'auth-shell', name: 'Auth Shell', group: 'App shell', file: 'shell', regions: ['AuthShell'], imports: ['AuthShell'], description: 'Sign-in and sign-up frame: form column and a showcase well that hides on small screens.', examples: [ex('app', 'AuthShellExample', 'Scaled preview', 'See the Auth screens for full size.', EAp.AuthShellExample, 'stretch')], preview: () => <O.HStack gap={1}>{box(70, 70)}<span style={{ width: 70, height: 70, borderRadius: 12, background: O.colors.well }} /></O.HStack> },
  ];
}
