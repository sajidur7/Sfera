import { useEffect, useState } from 'react';
import { sampleImages } from '../../data/mock';
import { Archive, Building2, Copy, Ellipsis, Pencil, Plus, Search, Settings, Share2, Trash2, SlidersHorizontal, Info, UserPlus } from 'lucide-react';
import {
  AlertDialog,
  Avatar,
  BottomSheet,
  Button,
  CommandPalette,
  ContextMenu,
  HoverCard,
  InfoTip,
  Lightbox,
  RadioGroup,
  Thumbnail,
  colors,
  Checkbox,
  Dialog,
  Drawer,
  DropdownMenu,
  Field,
  HStack,
  IconButton,
  Kbd,
  MetadataList,
  Popover,
  StatusChip,
  Switch,
  Text,
  TextInput,
  Tooltip,
  VStack,
  useToast,
} from '../../sfera';

// #region DialogExample
export function DialogExample() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Q3 launch');
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Rename project</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rename project"
        description="Everyone in the workspace will see the new name."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <Field label="Project name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} data-autofocus />
        </Field>
      </Dialog>
    </>
  );
}
// #endregion

// #region AlertDialogExample
export function AlertDialogExample() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  return (
    <HStack gap={3} justify="center" wrap>
      <Button variant="danger" iconStart={<Trash2 size={15} />} onClick={() => setOpen(true)} disabled={deleted}>
        Delete workspace
      </Button>
      {deleted && <StatusChip tone="danger">Deleted</StatusChip>}
      {deleted && <Button variant="ghost" onClick={() => setDeleted(false)}>Undo</Button>}
      <AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setDeleted(true)}
        destructive
        title="Delete “Northwind”?"
        description="All 1,204 records and their history go with it. You can undo for 30 days."
        confirmLabel="Delete workspace"
      />
    </HStack>
  );
}
// #endregion

// #region DrawerExample
export function DrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open record</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Linear"
        description="Company · added 3 days ago"
        footer={<Button variant="primary" onClick={() => setOpen(false)}>Done</Button>}
      >
        <MetadataList
          items={[
            { label: 'Domain', value: 'linear.app' },
            { label: 'Stage', value: <StatusChip tone="info">Negotiation</StatusChip> },
            { label: 'Employees', value: '120' },
            { label: 'Owner', value: 'Mira Chen' },
          ]}
        />
      </Drawer>
    </>
  );
}
// #endregion

// #region PopoverExample
export function PopoverExample() {
  const [cols, setCols] = useState({ owner: true, stage: true, value: false });
  return (
    <Popover label="Columns" trigger={<Button iconStart={<SlidersHorizontal size={15} />}>Columns</Button>}>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, width: 220 }}>
        <Text size="sm" weight="medium">Visible columns</Text>
        {(Object.keys(cols) as (keyof typeof cols)[]).map((k) => (
          <Checkbox key={k} label={k[0].toUpperCase() + k.slice(1)} checked={cols[k]} onChange={(v) => setCols({ ...cols, [k]: v })} />
        ))}
      </div>
    </Popover>
  );
}
// #endregion

// #region TooltipExample
export function TooltipExample() {
  return (
    <HStack gap={3} justify="center">
      <Tooltip content="Copy link">
        <IconButton label="Copy link" variant="secondary" icon={<Copy size={15} />} />
      </Tooltip>
      <Tooltip content={<>Search <Kbd keys={['mod', 'k']} onAccent /></>}>
        <Button>Hover me</Button>
      </Tooltip>
      <Tooltip content="Shown on focus too" placement="right">
        <IconButton label="More info" icon={<Info size={16} />} />
      </Tooltip>
    </HStack>
  );
}
// #endregion

// #region MenuExample
export function MenuExample() {
  const [last, setLast] = useState('nothing yet');
  const [pinned, setPinned] = useState(true);
  const [sort, setSort] = useState('recent');
  return (
    <VStack gap={3} align="center">
      <DropdownMenu
        label="Record actions"
        trigger={<IconButton label="Record actions" variant="secondary" icon={<Ellipsis size={16} />} />}
        items={[
          { label: 'Edit', icon: <Pencil size={15} />, shortcut: <Kbd keys={['e']} />, onSelect: () => setLast('Edit') },
          { label: 'Share', icon: <Share2 size={15} />, onSelect: () => setLast('Share') },
          { type: 'submenu', label: 'Move to', icon: <Archive size={15} />, items: [{ label: 'Pipeline', onSelect: () => setLast('Moved to Pipeline') }, { label: 'Archive', onSelect: () => setLast('Moved to Archive') }, { label: 'Partners', onSelect: () => setLast('Moved to Partners') }] },
          { label: 'Archive', icon: <Archive size={15} />, shortcut: <Kbd keys={['mod', 'backspace']} />, onSelect: () => setLast('Archive') },
          { type: 'divider' },
          { type: 'checkbox', label: 'Pinned', checked: pinned, onChange: setPinned },
          { type: 'label', label: 'Sort' },
          { type: 'radio', label: 'Most recent', value: 'recent', group: 's', current: sort, onChange: setSort },
          { type: 'radio', label: 'Name', value: 'name', group: 's', current: sort, onChange: setSort },
          { type: 'divider' },
          { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onSelect: () => setLast('Delete') },
        ]}
      />
      <Text size="sm" tone="muted">Last action: {last} · sort: {sort} · pinned: {String(pinned)}</Text>
    </VStack>
  );
}
// #endregion

// #region ToastExample
export function ToastExample() {
  const toast = useToast();
  const [auto, setAuto] = useState(true);
  return (
    <HStack gap={2} wrap justify="center">
      <Button variant="primary" onClick={() => toast({ title: 'Invoice sent', description: 'INV-2041 to ap@northwind.com', tone: 'success', duration: auto ? 4000 : 60000 })}>
        Success toast
      </Button>
      <Button onClick={() => toast({ title: 'Record archived', action: { label: 'Undo', onClick: () => toast({ title: 'Restored' }) }, duration: auto ? 4000 : 60000 })}>
        With undo
      </Button>
      <Button variant="soft" onClick={() => toast({ title: 'Sync failed', description: 'Retry in a minute.', tone: 'danger', duration: auto ? 4000 : 60000 })}>
        Error toast
      </Button>
      <Switch size="sm" label="Auto-dismiss after 4s" checked={auto} onChange={setAuto} />
    </HStack>
  );
}
// #endregion

// #region ContextMenuExample
export function ContextMenuExample() {
  const [last, setLast] = useState('nothing yet');
  return (
    <ContextMenu
      items={[
        { label: 'Open', onSelect: () => setLast('Open') },
        { label: 'Rename', icon: <Pencil size={15} />, onSelect: () => setLast('Rename') },
        { label: 'Copy link', icon: <Copy size={15} />, onSelect: () => setLast('Copy link') },
        { type: 'divider' },
        { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onSelect: () => setLast('Delete') },
      ]}
    >
      <div style={{ padding: '36px 24px', border: `1px dashed ${colors.borderStrong}`, borderRadius: 16, textAlign: 'center', minWidth: 260 }}>
        <Text weight="medium">Right-click here</Text>
        <Text size="sm" tone="muted">Long-press on touch · Shift+F10 on keyboard</Text>
        <Text size="sm" tone="muted">Last action: {last}</Text>
      </div>
    </ContextMenu>
  );
}
// #endregion

// #region HoverCardExample
export function HoverCardExample() {
  return (
    <Text>
      Assigned to{' '}
      <HoverCard trigger={<button style={{ border: 0, background: 'none', padding: 0, font: 'inherit', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', color: 'inherit' }}>Mira Chen</button>}>
        <VStack gap={3}>
          <HStack gap={3}>
            <Avatar name="Mira Chen" size="lg" presence="online" />
            <VStack gap={0}>
              <Text weight="medium">Mira Chen</Text>
              <Text size="sm" tone="muted">Design lead · Lisbon</Text>
            </VStack>
          </HStack>
          <Text size="sm" tone="muted">Owns 42 companies and 6 open deals.</Text>
        </VStack>
      </HoverCard>{' '}
      since Monday.
    </Text>
  );
}
// #endregion

// #region InfoTipExample
export function InfoTipExample() {
  return (
    <HStack gap={1}>
      <Text size="sm" weight="medium">Annual recurring revenue</Text>
      <InfoTip>Monthly recurring revenue × 12, excluding one-off fees.</InfoTip>
    </HStack>
  );
}
// #endregion

// #region BottomSheetExample
export function BottomSheetExample() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState('recent');
  return (
    <VStack gap={2} align="center">
      <Button onClick={() => setOpen(true)}>Sort: {sort}</Button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Sort conversations">
        <RadioGroup value={sort} onChange={(v) => (setSort(v), setOpen(false))} options={[{ value: 'recent', label: 'Most recent' }, { value: 'oldest', label: 'Oldest first' }, { value: 'priority', label: 'Priority' }]} />
      </BottomSheet>
      <Text size="xs" tone="muted">Drag the grip down to close.</Text>
    </VStack>
  );
}
// #endregion

// #region CommandPaletteExample
export function CommandPaletteExample() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') (e.preventDefault(), setOpen((o) => !o));
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  const go = (label: string) => () => toast({ title: label });
  return (
    <VStack gap={2} align="center">
      <Button iconStart={<Search size={15} />} iconEnd={<Kbd keys={['mod', 'k']} />} onClick={() => setOpen(true)}>Search or run a command</Button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        footer={<><span>Arrows to move</span><span>Enter to run</span><span>Esc to close</span></>}
        commands={[
          { id: 'new', group: 'Actions', label: 'New company', icon: <Plus size={15} />, shortcut: <Kbd keys={['c']} />, run: go('New company') },
          { id: 'invite', group: 'Actions', label: 'Invite teammate', icon: <UserPlus size={15} />, run: go('Invite sent') },
          { id: 'theme', group: 'Actions', label: 'Switch theme', icon: <SlidersHorizontal size={15} />, keywords: 'dark light', run: go('Theme switched') },
          { id: 'linear', group: 'Companies', label: 'Linear', icon: <Building2 size={15} />, run: go('Opened Linear') },
          { id: 'fjord', group: 'Companies', label: 'Fjord Freight', icon: <Building2 size={15} />, run: go('Opened Fjord Freight') },
          { id: 'settings', group: 'Go to', label: 'Settings', icon: <Settings size={15} />, run: go('Opened Settings') },
        ]}
      />
    </VStack>
  );
}
// #endregion

// #region LightboxExample
export function LightboxExample() {
  const [i, setI] = useState<number | null>(null);
  return (
    <HStack gap={2} wrap justify="center">
      {sampleImages.map((im, k) => (
        <Thumbnail key={k} src={im.src} alt={im.alt} size="lg" onClick={() => setI(k)} />
      ))}
      <Lightbox items={sampleImages} index={i} onIndexChange={setI} onClose={() => setI(null)} />
    </HStack>
  );
}
// #endregion
