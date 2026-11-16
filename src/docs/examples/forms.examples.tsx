import { useState } from 'react';
import { AtSign, Globe, Lock } from 'lucide-react';
import { Button, Checkbox, CheckboxList, Field, FileInput, Grid, HStack, MultiSelect, NumberInput, RadioGroup, SearchInput, Select, Slider, Switch, Text, TextArea, TextInput, Tokenizer, Typeahead, VStack } from '../../sfera';

// #region FieldBasics
export function FieldBasics() {
  const [email, setEmail] = useState('mira@');
  const bad = !/^\S+@\S+\.\S+$/.test(email);
  return (
    <Grid min={220} gap={4}>
      <Field label="Workspace name" help="Shown in the sidebar and invites.">
        <TextInput placeholder="Acme Inc." />
      </Field>
      <Field label="Work email" error={bad ? 'Add a domain, e.g. mira@acme.com' : undefined}>
        <TextInput type="email" autoComplete="email" iconStart={<AtSign size={15} />} value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Website" optional>
        <TextInput iconStart={<Globe size={15} />} placeholder="acme.com" />
      </Field>
      <Field label="Password">
        <TextInput type="password" autoComplete="new-password" iconStart={<Lock size={15} />} defaultValue="hunter22" />
      </Field>
    </Grid>
  );
}
// #endregion

// #region SearchAndNumber
export function SearchAndNumber() {
  const [q, setQ] = useState('');
  return (
    <Grid min={220} gap={4}>
      <Field label="Search">
        <SearchInput value={q} onValueChange={setQ} placeholder="Search people" />
      </Field>
      <Field label="Seats">
        <NumberInput defaultValue={12} min={1} max={500} />
      </Field>
    </Grid>
  );
}
// #endregion

// #region TextAreaExample
export function TextAreaExample() {
  const [v, setV] = useState('');
  return (
    <Field label="Reply" help={`${v.length}/280`}>
      <TextArea value={v} maxLength={280} onChange={(e) => setV(e.target.value)} placeholder="Write a short reply…" />
    </Field>
  );
}
// #endregion

// #region Checkboxes
export function Checkboxes() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <VStack gap={3}>
      <Checkbox
        label="All notifications"
        checked={a && b ? true : a || b ? 'mixed' : false}
        onChange={(v) => {
          setA(v);
          setB(v);
        }}
      />
      <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Checkbox label="Mentions" description="When someone @mentions you" checked={a} onChange={setA} />
        <Checkbox label="Weekly digest" description="Every Monday at 9:00" checked={b} onChange={setB} />
      </div>
      <Checkbox label="Disabled option" disabled />
    </VStack>
  );
}
// #endregion

// #region Radios
export function Radios() {
  const [plan, setPlan] = useState('team');
  return (
    <RadioGroup
      label="Plan"
      value={plan}
      onChange={setPlan}
      options={[
        { value: 'starter', label: 'Starter', description: 'Up to 3 seats' },
        { value: 'team', label: 'Team', description: 'Unlimited seats, SSO' },
        { value: 'enterprise', label: 'Enterprise', description: 'Audit log, SLA', disabled: true },
      ]}
    />
  );
}
// #endregion

// #region Switches
export function Switches() {
  const [on, setOn] = useState(true);
  return (
    <VStack gap={3} align="start">
      <Switch label={`Auto-assign tickets (${on ? 'on' : 'off'})`} checked={on} onChange={setOn} />
      <Switch label="Compact rows" size="sm" />
      <Switch label="Locked" disabled defaultChecked />
    </VStack>
  );
}
// #endregion

// #region SelectExample
export function SelectExample() {
  const [region, setRegion] = useState('eu');
  return (
    <Grid min={220} gap={4}>
      <Field label="Data region" help={`Selected: ${region}`}>
        <Select
          value={region}
          onChange={setRegion}
          options={[
            { value: 'us', label: 'United States', description: 'Virginia' },
            { value: 'eu', label: 'Europe', description: 'Frankfurt' },
            { value: 'ap', label: 'Asia Pacific', description: 'Singapore' },
          ]}
        />
      </Field>
      <Field label="Owner">
        <Select placeholder="Choose owner" options={['Mira Chen', 'Theo Park', 'Ana Ruiz'].map((n) => ({ value: n, label: n }))} />
      </Field>
    </Grid>
  );
}
// #endregion

// #region SliderExample
export function SliderExample() {
  const [budget, setBudget] = useState(40);
  return (
    <VStack gap={4}>
      <Field label="Daily budget">
        <Slider value={budget} onChange={setBudget} min={0} max={200} step={5} format={(n) => `$${n}`} />
      </Field>
      <Field label="Effort">
        <Slider defaultValue={2} min={0} max={4} format={(n) => ['Off', 'Low', 'Medium', 'High', 'Max'][n]} />
      </Field>
    </VStack>
  );
}
// #endregion

// #region FormLayout
export function FormLayout() {
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <VStack gap={4}>
        <Grid min={200} gap={3}>
          <Field label="First name">
            <TextInput autoComplete="given-name" defaultValue="Mira" />
          </Field>
          <Field label="Last name">
            <TextInput autoComplete="family-name" defaultValue="Chen" />
          </Field>
        </Grid>
        <Field label="Role">
          <Select defaultValue="design" options={[{ value: 'design', label: 'Design' }, { value: 'eng', label: 'Engineering' }, { value: 'ops', label: 'Operations' }]} />
        </Field>
        <HStack justify="between" wrap>
          <Text size="sm" tone="muted">{sent ? 'Saved just now.' : 'Changes are not saved yet.'}</Text>
          <Button type="submit" variant="primary">Save changes</Button>
        </HStack>
      </VStack>
    </form>
  );
}
// #endregion

// #region CheckboxListExample
export function CheckboxListExample() {
  const [v, setV] = useState(['orders', 'refunds']);
  return (
    <CheckboxList
      label="Webhook events"
      value={v}
      onChange={setV}
      items={[
        { value: 'orders', label: 'order.created', description: 'A customer places an order', meta: '1.2k/day' },
        { value: 'refunds', label: 'refund.issued', description: 'A refund is sent', meta: '14/day' },
        { value: 'customers', label: 'customer.updated', description: 'Profile or address changes', meta: '320/day' },
        { value: 'payouts', label: 'payout.paid', description: 'Enterprise plan only', disabled: true },
      ]}
    />
  );
}
// #endregion

// #region FileInputExample
export function FileInputExample() {
  const [n, setN] = useState(0);
  return (
    <Field label="Attachments" help={`${n} file${n === 1 ? '' : 's'} ready to upload`}>
      <FileInput onChange={(f) => setN(f.length)} />
    </Field>
  );
}
// #endregion

// #region TypeaheadExample
export function TypeaheadExample() {
  const [v, setV] = useState<string | null>('fjord');
  return (
    <Field label="Company" help={v ? `Selected id: ${v}` : 'Start typing a company name'}>
      <Typeahead
        value={v}
        onChange={setV}
        placeholder="Search companies"
        options={[
          { value: 'linear', label: 'Linear', description: 'linear.app' },
          { value: 'fjord', label: 'Fjord Freight', description: 'fjordfreight.no' },
          { value: 'nimbus', label: 'Nimbus Labs', description: 'nimbuslabs.ai' },
          { value: 'cobalt', label: 'Cobalt Health', description: 'cobalt.health' },
          { value: 'paper', label: 'Paperhill', description: 'paperhill.co' },
        ]}
      />
    </Field>
  );
}
// #endregion

// #region MultiSelectExample
export function MultiSelectExample() {
  const [v, setV] = useState(['mira', 'theo']);
  return (
    <Grid min={240} gap={4}>
      <Field label="Assignees">
        <MultiSelect
          value={v}
          onChange={setV}
          placeholder="Add people"
          options={[
            { value: 'mira', label: 'Mira Chen', description: 'Design' },
            { value: 'theo', label: 'Theo Park', description: 'Support' },
            { value: 'ana', label: 'Ana Ruiz', description: 'Commerce' },
            { value: 'jonas', label: 'Jonas Weber', description: 'Marketing' },
          ]}
        />
      </Field>
      <Field label="Labels" help="Type a new label and press Enter to create it">
        <MultiSelect allowCreate defaultValue={['bug']} placeholder="Add labels" options={['bug', 'billing', 'feature', 'sso'].map((l) => ({ value: l, label: l }))} />
      </Field>
    </Grid>
  );
}
// #endregion

// #region TokenizerExample
export function TokenizerExample() {
  const [emails, setEmails] = useState(['lea@moss.studio']);
  return (
    <Field label="Invite by email" help={`${emails.length} recipient${emails.length === 1 ? '' : 's'} · press Enter or comma`}>
      <Tokenizer value={emails} onChange={setEmails} validate={(s) => /^\S+@\S+\.\S+$/.test(s)} placeholder="name@company.com" label="Emails" />
    </Field>
  );
}
// #endregion
