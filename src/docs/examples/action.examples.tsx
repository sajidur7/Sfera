import { useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Download, Italic, Plus, Search, Settings, Trash2, Underline, ChartColumn, List, LayoutGrid } from 'lucide-react';
import { Button, ButtonGroup, HStack, IconButton, Link, MoreMenu, SegmentedControl, ToggleButton, Toolbar, ToolbarSeparator, Text, VStack } from '../../sfera';

// #region ButtonVariants
export function ButtonVariants() {
  return (
    <HStack gap={2} wrap justify="center">
      <Button variant="primary">Publish</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="soft">Preview</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </HStack>
  );
}
// #endregion

// #region ButtonSizes
export function ButtonSizes() {
  return (
    <HStack gap={2} wrap justify="center">
      <Button size="xs" variant="primary" iconStart={<Plus />}>XS · 24</Button>
      <Button size="sm" variant="primary" iconStart={<Plus />}>Small · 32</Button>
      <Button size="md" variant="primary" iconStart={<Plus />}>Medium · 36</Button>
      <Button size="lg" variant="primary" iconStart={<Plus />}>Large · 40</Button>
    </HStack>
  );
}
// #endregion

// #region ButtonIcons
export function ButtonIcons() {
  const [saving, setSaving] = useState(false);
  return (
    <HStack gap={2} wrap justify="center">
      <Button variant="primary" iconStart={<Plus size={16} />}>New record</Button>
      <Button iconStart={<Download size={15} />}>Export</Button>
      <Button
        variant="secondary"
        loading={saving}
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1400);
        }}
      >
        {saving ? 'Saving' : 'Click to save'}
      </Button>
      <Button disabled>Disabled</Button>
    </HStack>
  );
}
// #endregion

// #region IconButtons
export function IconButtons() {
  return (
    <HStack gap={2} wrap justify="center">
      <IconButton label="Search" icon={<Search size={16} />} />
      <IconButton label="Settings" variant="secondary" icon={<Settings size={16} />} />
      <IconButton label="Add" variant="primary" shape="circle" icon={<Plus size={16} />} />
      <IconButton label="Delete" variant="soft" size="sm" icon={<Trash2 size={14} />} />
    </HStack>
  );
}
// #endregion

// #region ButtonGroupExample
export function ButtonGroupExample() {
  return (
    <HStack gap={4} wrap justify="center">
      <ButtonGroup label="Alignment">
        <Button iconStart={<AlignLeft size={15} />}>Left</Button>
        <Button iconStart={<AlignCenter size={15} />}>Center</Button>
        <Button iconStart={<AlignRight size={15} />}>Right</Button>
      </ButtonGroup>
      <ButtonGroup attached={false}>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Continue</Button>
      </ButtonGroup>
    </HStack>
  );
}
// #endregion

// #region ToggleButtons
export function ToggleButtons() {
  const [bold, setBold] = useState(true);
  return (
    <HStack gap={2} justify="center">
      <ButtonGroup label="Text style">
        <ToggleButton pressed={bold} onPressedChange={setBold} iconStart={<Bold size={15} />} aria-label="Bold" />
        <ToggleButton defaultPressed={false} iconStart={<Italic size={15} />} aria-label="Italic" />
        <ToggleButton defaultPressed={false} iconStart={<Underline size={15} />} aria-label="Underline" />
      </ButtonGroup>
      <Text size="sm" tone="muted">Bold is {bold ? 'on' : 'off'}</Text>
    </HStack>
  );
}
// #endregion

// #region Segmented
export function Segmented() {
  const [view, setView] = useState('weekly');
  return (
    <HStack gap={4} wrap justify="center">
      <SegmentedControl
        label="Range"
        value={view}
        onChange={setView}
        options={[
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
      <SegmentedControl
        label="Layout"
        size="sm"
        options={[
          { value: 'chart', label: 'Chart', icon: <ChartColumn size={13} /> },
          { value: 'list', label: 'List', icon: <List size={13} /> },
          { value: 'grid', label: 'Grid', icon: <LayoutGrid size={13} /> },
        ]}
      />
    </HStack>
  );
}
// #endregion

// #region Links
export function Links() {
  return (
    <Text>
      Read the <Link href="#docs-installation">installation guide</Link>, open the{' '}
      <Link href="https://stylexjs.com" external>StyleX docs</Link>, or <Link subtle href="#components">browse components</Link>.
    </Text>
  );
}
// #endregion

// #region ToolbarExample
export function ToolbarExample() {
  const [align, setAlign] = useState('left');
  return (
    <VStack gap={3} align="center">
      <Toolbar label="Text formatting">
        <IconButton size="sm" label="Bold" icon={<Bold size={15} />} />
        <IconButton size="sm" label="Italic" icon={<Italic size={15} />} />
        <IconButton size="sm" label="Underline" icon={<Underline size={15} />} />
        <ToolbarSeparator />
        {(['left', 'center', 'right'] as const).map((a) => (
          <IconButton key={a} size="sm" label={`Align ${a}`} aria-pressed={align === a} variant={align === a ? 'soft' : 'ghost'} onClick={() => setAlign(a)} icon={a === 'left' ? <AlignLeft size={15} /> : a === 'center' ? <AlignCenter size={15} /> : <AlignRight size={15} />} />
        ))}
      </Toolbar>
      <Text size="sm" tone="muted">Aligned {align}. Use arrow keys inside the toolbar.</Text>
    </VStack>
  );
}
// #endregion

// #region MoreMenuExample
export function MoreMenuExample() {
  const [last, setLast] = useState('none');
  return (
    <HStack gap={3}>
      <Text size="sm">Linear · Enterprise rollout</Text>
      <MoreMenu items={[{ label: 'Duplicate', onSelect: () => setLast('Duplicate') }, { label: 'Move to…', onSelect: () => setLast('Move') }, { type: 'divider' }, { label: 'Delete', danger: true, onSelect: () => setLast('Delete') }]} />
      <Text size="sm" tone="muted">Last: {last}</Text>
    </HStack>
  );
}
// #endregion
