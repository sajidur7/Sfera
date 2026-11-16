import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, Building2, Check, CircleAlert, Clock, CreditCard, Globe, Inbox, KeyRound, Mail, MessageSquare, Plus, RefreshCw, Search, Settings, ShieldCheck, Users, Wrench } from 'lucide-react';
import * as O from '../sfera';
import { Screen, useScreenNav, ExitButton } from './kit';
import { system } from './products';
import { Cols, Page } from './ui';

function Brand() {
  return (
    <O.HStack gap={2}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: '#2E64F0', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>N</span>
      <O.Text weight="medium">Northwind</O.Text>
    </O.HStack>
  );
}

function Showcase() {
  return (
    <>
      <O.Card>
        <O.VStack gap={3}>
          <O.Text size="sm" tone="muted">This week across your apps</O.Text>
          <O.StatGroup stats={[{ label: 'Deals won', value: 7, delta: 12 }, { label: 'Tickets solved', value: 284, delta: 9 }]} />
        </O.VStack>
      </O.Card>
      <O.Card>
        <O.ActivityFeed items={[{ id: 'a', who: 'Ana Ruiz', action: 'won Fjord Freight', when: '3h' }, { id: 'b', who: 'Theo Park', action: 'closed 12 tickets', when: '5h' }]} />
      </O.Card>
      <O.Blockquote cite="Ingrid Dahl, COO at Fjord Freight">One workspace for sales, support and finance. Our Monday meeting got 20 minutes shorter.</O.Blockquote>
    </>
  );
}

// ───────── Sign in
export function AuthSigninScreen() {
  const { open } = useScreenNav();
  const [email, setEmail] = useState('mira@northwind.com');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <O.AuthShell brand={<Brand />} topRight={<ExitButton />} aside={<Showcase />} footer="Protected by single sign-on and 2FA">
      <O.VStack gap={1}>
        <O.Heading level={1} size="h2">Sign in</O.Heading>
        <O.Text size="sm" tone="muted">Welcome back. Use your work email.</O.Text>
      </O.VStack>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.length < 6) return setErr('Password is at least 6 characters. Check it and try again.');
          setErr('');
          setBusy(true);
          setTimeout(() => (setBusy(false), open('auth-verify')), 700);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <O.Field label="Work email"><O.TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></O.Field>
        <O.Field label="Password" error={err || undefined}>
          <O.PasswordInput value={pw} onChange={setPw} aria-label="Password" />
        </O.Field>
        <O.HStack justify="between"><O.Checkbox label="Keep me signed in" defaultChecked /><O.Link href="#screens-auth-forgot" onClick={(e) => (e.preventDefault(), open('auth-forgot'))}>Forgot password?</O.Link></O.HStack>
        <O.Button type="submit" variant="primary" fullWidth loading={busy}>Sign in</O.Button>
      </form>
      <O.Divider label="or" />
      <O.Button fullWidth iconStart={<KeyRound />} onClick={() => open('auth-workspaces')}>Continue with SSO</O.Button>
      <O.Text size="sm" tone="muted">New here? <O.Link href="#screens-auth-signup" onClick={(e) => (e.preventDefault(), open('auth-signup'))}>Create an account</O.Link></O.Text>
    </O.AuthShell>
  );
}

// ───────── Sign up
export function AuthSignupScreen() {
  const { open } = useScreenNav();
  const [pw, setPw] = useState('');
  const [agree, setAgree] = useState(false);
  return (
    <O.AuthShell brand={<Brand />} topRight={<ExitButton />} aside={<Showcase />}>
      <O.VStack gap={1}>
        <O.Heading level={1} size="h2">Create your account</O.Heading>
        <O.Text size="sm" tone="muted">Free for 14 days. No card needed.</O.Text>
      </O.VStack>
      <form onSubmit={(e) => (e.preventDefault(), open('auth-verify'))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <O.Grid min={150} gap={3}>
          <O.Field label="First name"><O.TextInput autoComplete="given-name" /></O.Field>
          <O.Field label="Last name"><O.TextInput autoComplete="family-name" /></O.Field>
        </O.Grid>
        <O.Field label="Work email"><O.TextInput type="email" autoComplete="email" /></O.Field>
        <O.Field label="Password"><O.PasswordInput value={pw} onChange={setPw} showStrength autoComplete="new-password" aria-label="Password" /></O.Field>
        <O.Checkbox label="I agree to the terms and privacy policy" checked={agree} onChange={setAgree} />
        <O.Button type="submit" variant="primary" fullWidth disabled={!agree}>Create account</O.Button>
      </form>
      <O.Text size="sm" tone="muted">Already have an account? <O.Link href="#screens-auth-signin" onClick={(e) => (e.preventDefault(), open('auth-signin'))}>Sign in</O.Link></O.Text>
    </O.AuthShell>
  );
}

// ───────── Forgot password (single column)
export function AuthForgotScreen() {
  const { open } = useScreenNav();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  return (
    <O.AuthShell brand={<Brand />} topRight={<ExitButton />}>
      {sent ? (
        <O.VStack gap={4} align="center">
          <span style={{ width: 52, height: 52, borderRadius: 16, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={22} /></span>
          <O.Heading level={1} size="h3">Check your email</O.Heading>
          <O.Text size="sm" tone="muted">We sent a reset link to {email || 'your inbox'}. It expires in 30 minutes.</O.Text>
          <O.Button fullWidth onClick={() => setSent(false)}>Use a different email</O.Button>
        </O.VStack>
      ) : (
        <>
          <O.VStack gap={1}>
            <O.Heading level={1} size="h2">Reset your password</O.Heading>
            <O.Text size="sm" tone="muted">Enter your work email and we will send a link.</O.Text>
          </O.VStack>
          <form onSubmit={(e) => (e.preventDefault(), setSent(true))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <O.Field label="Work email"><O.TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></O.Field>
            <O.Button type="submit" variant="primary" fullWidth disabled={!/^\S+@\S+\.\S+$/.test(email)}>Send reset link</O.Button>
          </form>
        </>
      )}
      <O.Button variant="ghost" iconStart={<ArrowLeft />} onClick={() => open('auth-signin')}>Back to sign in</O.Button>
    </O.AuthShell>
  );
}

// ───────── Verify code
export function AuthVerifyScreen() {
  const { open } = useScreenNav();
  const [bad, setBad] = useState(false);
  const [left, setLeft] = useState(0);
  return (
    <O.AuthShell brand={<Brand />} topRight={<ExitButton />}>
      <O.VStack gap={1} align="center">
        <span style={{ width: 52, height: 52, borderRadius: 16, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={22} /></span>
        <O.Heading level={1} size="h2">Enter the code</O.Heading>
        <O.Text size="sm" tone="muted">We sent 6 digits to mira@northwind.com. Try 123456.</O.Text>
      </O.VStack>
      <O.OtpInput invalid={bad} onComplete={(c) => (c === '123456' ? open('auth-onboarding') : setBad(true))} />
      {bad && <O.Banner tone="danger" title="That code is not right">Check the latest email, or send a new code.</O.Banner>}
      <O.Button variant="ghost" iconStart={<RefreshCw />} disabled={left > 0} onClick={() => { setLeft(30); setBad(false); const t = setInterval(() => setLeft((l) => (l <= 1 ? (clearInterval(t), 0) : l - 1)), 1000); }}>
        {left ? `Send a new code in ${left}s` : 'Send a new code'}
      </O.Button>
    </O.AuthShell>
  );
}

// ───────── Onboarding wizard
export function AuthOnboardingScreen() {
  const { open } = useScreenNav();
  const toast = O.useToast();
  const [step, setStep] = useState(0);
  const [apps, setApps] = useState<string[]>(['crm', 'support']);
  const [size, setSize] = useState('11');
  const [invites, setInvites] = useState<string[]>([]);
  return (
    <O.AuthShell brand={<Brand />} topRight={<ExitButton />}>
      <O.Stepper current={step} onStepClick={setStep} steps={[{ label: 'Workspace' }, { label: 'Apps' }, { label: 'Team' }]} />
      {step === 0 && (
        <O.VStack gap={4}>
          <O.Heading level={1} size="h3">Name your workspace</O.Heading>
          <O.Field label="Workspace name"><O.TextInput defaultValue="Northwind" /></O.Field>
          <O.RadioGroup label="Company size" value={size} onChange={setSize} direction="row" options={[{ value: '1', label: '1–10' }, { value: '11', label: '11–50' }, { value: '51', label: '51–200' }, { value: '200', label: '200+' }]} />
        </O.VStack>
      )}
      {step === 1 && (
        <O.VStack gap={2}>
          <O.Heading level={1} size="h3">Pick your apps</O.Heading>
          {[['crm', 'Relay CRM', 'Companies, people and deals', <Building2 key="a" size={18} />], ['support', 'Harbor', 'Shared inbox and tickets', <Inbox key="b" size={18} />], ['finance', 'Ledger', 'Invoices, cards and budgets', <CreditCard key="c" size={18} />]].map(([id, t, d, ic]) => (
            <O.SelectableCard key={id as string} multiple icon={ic} selected={apps.includes(id as string)} onSelect={() => setApps((a) => (a.includes(id as string) ? a.filter((x) => x !== id) : [...a, id as string]))} title={t} description={d} />
          ))}
        </O.VStack>
      )}
      {step === 2 && (
        <O.VStack gap={4}>
          <O.Heading level={1} size="h3">Invite your team</O.Heading>
          <O.Field label="Emails" help="Press Enter after each"><O.Tokenizer value={invites} onChange={setInvites} validate={(s) => /^\S+@\S+\.\S+$/.test(s)} placeholder="name@company.com" label="Emails" /></O.Field>
        </O.VStack>
      )}
      <O.HStack justify="between">
        <O.Button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</O.Button>
        {step < 2 ? <O.Button variant="primary" iconEnd={<ArrowRight />} onClick={() => setStep(step + 1)} disabled={step === 1 && !apps.length}>Continue</O.Button> : <O.Button variant="primary" onClick={() => (toast({ title: invites.length ? `${invites.length} invites sent` : 'Workspace ready', tone: 'success' }), open('auth-workspaces'))}>Finish</O.Button>}
      </O.HStack>
    </O.AuthShell>
  );
}

// ───────── Workspace / app picker
export function AuthWorkspacesScreen() {
  const { open } = useScreenNav();
  const apps = [
    { id: 'crm-home', n: 'Relay', d: 'CRM', c: '#121214', icon: <Building2 size={18} /> },
    { id: 'support-inbox', n: 'Harbor', d: 'Support desk', c: '#0E7C66', icon: <Inbox size={18} /> },
    { id: 'shop-home', n: 'Kiln', d: 'Commerce', c: '#C2560A', icon: <CreditCard size={18} /> },
    { id: 'analytics-overview', n: 'Signal', d: 'Marketing', c: '#6D4DE6', icon: <Globe size={18} /> },
    { id: 'hr-directory', n: 'Crew', d: 'People', c: '#17804F', icon: <Users size={18} /> },
    { id: 'pm-home', n: 'Stack', d: 'Projects', c: '#2E64F0', icon: <Wrench size={18} /> },
    { id: 'fin-overview', n: 'Ledger', d: 'Finance', c: '#1F2A44', icon: <CreditCard size={18} /> },
    { id: 'dev-projects', n: 'Forge', d: 'Developer platform', c: '#121214', icon: <Wrench size={18} /> },
    { id: 'ai-chat', n: 'Muse', d: 'AI assistant', c: '#D23A70', icon: <MessageSquare size={18} /> },
  ];
  return (
    <Screen product={system} active="home" topbar={<O.Text weight="medium">Apps</O.Text>}>
      <Page title="Good morning, Mira" subtitle="Northwind · 9 apps" actions={<O.Button iconStart={<Plus />} onClick={() => open('auth-onboarding')}>New workspace</O.Button>}>
        <O.Grid min={220} gap={3}>
          {apps.map((a) => (
            <O.Card key={a.id} onClick={() => open(a.id)}>
              <O.HStack gap={3}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: a.c, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</span>
                <O.VStack gap={0} grow><O.Text weight="medium">{a.n}</O.Text><O.Text size="sm" tone="muted">{a.d}</O.Text></O.VStack>
                <ArrowRight size={16} />
              </O.HStack>
            </O.Card>
          ))}
        </O.Grid>
      </Page>
    </Screen>
  );
}

// ───────── Error and status pages (centered, no sidebar)
function Centered({ code, icon, title, text, actions }: { code: string; icon: React.ReactNode; title: string; text: string; actions: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: O.colors.page }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}><Brand /><ExitButton /></div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ maxWidth: 440, width: '100%' }}>
          <O.Well>
            <O.Card>
              <O.VStack gap={3} align="center">
                <O.Text size="xs" tone="subtle" mono>{code}</O.Text>
                <span style={{ width: 52, height: 52, borderRadius: 16, background: O.colors.well, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
                <O.Heading level={1} size="h2">{title}</O.Heading>
                <p style={{ margin: 0, textAlign: 'center', color: O.colors.textMuted, fontSize: 14, lineHeight: 1.55 }}>{text}</p>
              </O.VStack>
            </O.Card>
            <O.HStack justify="center" gap={2} wrap>{actions}</O.HStack>
          </O.Well>
        </div>
      </div>
    </div>
  );
}
export function Sys404Screen() {
  const { open } = useScreenNav();
  return <Centered code="404" icon={<Search size={22} />} title="Page not found" text="The link may be old or mistyped. Search for what you need, or go back to your apps." actions={<><O.Button onClick={() => open('auth-workspaces')}>Go to apps</O.Button><O.Button variant="primary" iconStart={<Search />} onClick={() => open('auth-workspaces')}>Search</O.Button></>} />;
}
export function Sys500Screen() {
  const toast = O.useToast();
  return <Centered code="500 · ref 8f3c2a1" icon={<CircleAlert size={22} />} title="Something went wrong on our side" text="Your data is safe. Try again in a moment; if it keeps happening, send us the reference above." actions={<><O.Button onClick={() => toast({ title: 'Reference copied' })}>Copy reference</O.Button><O.Button variant="primary" iconStart={<RefreshCw />} onClick={() => toast({ title: 'Retrying…' })}>Try again</O.Button></>} />;
}
export function SysMaintenanceScreen() {
  return <Centered code="Scheduled maintenance" icon={<Clock size={22} />} title="Back at 06:30 UTC" text="We are upgrading the database. It takes about 20 minutes; nothing you saved is affected." actions={<O.Timer countdownFrom={20 * 60 * 1000} autoStart />} />;
}

// ───────── Pricing
export function SysPricingScreen() {
  const toast = O.useToast();
  const [annual, setAnnual] = useState('year');
  const [seats, setSeats] = useState(12);
  const plans = [
    { id: 'starter', n: 'Starter', p: 0, d: 'For trying things out', f: ['3 seats', '2 apps', 'Community support'] },
    { id: 'team', n: 'Team', p: annual === 'year' ? 40 : 48, d: 'For growing teams', f: ['Unlimited seats', 'All 9 apps', 'SSO and 2FA', 'Priority support'], hi: true },
    { id: 'enterprise', n: 'Enterprise', p: -1, d: 'For large organisations', f: ['Audit log', 'SLA 99.95%', 'Data residency', 'Dedicated manager'] },
  ];
  return (
    <Screen product={system} active="plans" topbar={<O.Text weight="medium">Plans</O.Text>}>
      <Page title="Plans" subtitle="Change or cancel any time." actions={<O.SegmentedControl value={annual} onChange={setAnnual} options={[{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly · save 17%' }]} />}>
        <O.Grid min={260} gap={3}>
          {plans.map((p) => (
            <O.Well key={p.id} title={p.n} subtitle={p.d} actions={p.hi ? <O.Badge variant="solid">Current</O.Badge> : undefined} fill>
              <O.Card grow>
                <O.VStack gap={4}>
                  <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.04em' }}>{p.p < 0 ? 'Custom' : p.p === 0 ? 'Free' : <><O.AnimatedNumber value={p.p} format={(n) => `$${n}`} /><span style={{ fontSize: 14, color: O.colors.textMuted, letterSpacing: 0 }}> / seat / mo</span></>}</span>
                  <O.VStack gap={2}>{p.f.map((f) => <O.HStack key={f} gap={2}><Check size={15} /><O.Text size="sm">{f}</O.Text></O.HStack>)}</O.VStack>
                </O.VStack>
              </O.Card>
              <O.Button variant={p.hi ? 'secondary' : p.p < 0 ? 'secondary' : 'primary'} fullWidth disabled={p.hi} onClick={() => toast({ title: p.p < 0 ? 'Sales will reach out within a day' : `Switched to ${p.n}`, tone: 'success' })}>{p.hi ? 'Current plan' : p.p < 0 ? 'Talk to sales' : 'Switch'}</O.Button>
            </O.Well>
          ))}
        </O.Grid>
        <O.Card>
          <O.HStack justify="between" wrap gap={4}>
            <O.VStack gap={0}><O.Text weight="medium">Team plan estimate</O.Text><O.Text size="sm" tone="muted">{seats} seats, billed {annual === 'year' ? 'yearly' : 'monthly'}</O.Text></O.VStack>
            <div style={{ width: 160 }}><O.NumberInput label="Seats" value={seats} onChange={setSeats} min={1} max={500} /></div>
            <span style={{ fontSize: 24, fontWeight: 500 }}><O.AnimatedNumber value={seats * plans[1].p * (annual === 'year' ? 12 : 1)} format={(n) => `$${n.toLocaleString('en-US')}`} /> / {annual === 'year' ? 'yr' : 'mo'}</span>
          </O.HStack>
        </O.Card>
      </Page>
    </Screen>
  );
}

// ───────── Notification centre
export function SysNotificationsScreen() {
  const { open } = useScreenNav();
  const [items, setItems] = useState([
    { id: 'n1', app: 'Relay', who: 'Ana Ruiz', text: 'won Fjord Freight · $152,000', at: '3h', unread: true, go: 'crm-deals' },
    { id: 'n2', app: 'Harbor', who: 'Lea Moss', text: 'replied to “Refund for duplicate charge”', at: '4h', unread: true, go: 'support-inbox' },
    { id: 'n3', app: 'Forge', who: 'Forge monitor', text: 'opened incident INC-31', at: '5h', unread: true, go: 'dev-incident' },
    { id: 'n4', app: 'Ledger', who: 'Owen Hale', text: 'asked you to approve a bill', at: 'Yesterday', unread: false, go: 'fin-bills' },
    { id: 'n5', app: 'Crew', who: 'Lea Moss', text: 'requested time off 24–28 Nov', at: 'Yesterday', unread: false, go: 'hr-timeoff' },
  ]);
  const [app, setApp] = useState('all');
  const list = items.filter((i) => app === 'all' || i.app === app);
  return (
    <Screen product={system} active="notifications" topbar={<O.Text weight="medium">Notifications</O.Text>}>
      <Page title="Notifications" subtitle={`${items.filter((i) => i.unread).length} unread`} actions={<><O.Button size="sm" onClick={() => setItems((x) => x.map((i) => ({ ...i, unread: false })))}>Mark all read</O.Button><O.IconButton variant="secondary" label="Notification settings" icon={<Settings />} onClick={() => open('settings')} /></>} max={860}>
        <O.SegmentedControl size="sm" value={app} onChange={setApp} options={['all', 'Relay', 'Harbor', 'Forge', 'Ledger', 'Crew'].map((a) => ({ value: a, label: a === 'all' ? 'All' : a }))} />
        {list.length ? (
          <O.List>
            {list.map((n, k) => (
              <O.ListItem key={n.id} last={k === list.length - 1} leading={<O.Avatar name={n.who} />} title={<>{n.who} <span style={{ fontWeight: 400 }}>{n.text}</span></>} subtitle={`${n.app} · ${n.at}`} trailing={n.unread ? <O.StatusDot tone="accent" label="Unread" /> : null} onClick={() => (setItems((x) => x.map((i) => (i.id === n.id ? { ...i, unread: false } : i))), open(n.go))} />
            ))}
          </O.List>
        ) : (
          <O.EmptyState icon={<Bell size={18} />} title="Nothing here" description="Notifications from this app will show up here." />
        )}
      </Page>
    </Screen>
  );
}

// ───────── Profile
export function SysProfileScreen() {
  const toast = O.useToast();
  return (
    <Screen product={system} active="profile" topbar={<O.Text weight="medium">Profile</O.Text>}>
      <Page max={980}>
        <O.Well>
          <O.Card>
            <O.HStack gap={4} wrap>
              <O.Avatar name="Mira Chen" size="xl" presence="busy" />
              <O.VStack gap={1} grow><O.Heading level={1} size="h2">Mira Chen</O.Heading><O.Text tone="muted">Design lead · Northwind · Lisbon</O.Text></O.VStack>
              <O.Button onClick={() => toast({ title: 'Profile link copied' })}>Share profile</O.Button>
            </O.HStack>
          </O.Card>
        </O.Well>
        <Cols template="minmax(0, 1fr) minmax(0, 1fr)" stretch>
          <O.Well title="Status" fill>
            <O.Card grow>
              <O.VStack gap={3}>
                <O.Select defaultValue="focus" options={[{ value: 'online', label: 'Online' }, { value: 'focus', label: 'Focusing until 14:00' }, { value: 'away', label: 'Away' }]} label="Status" />
                <O.Switch label="Pause notifications while focusing" defaultChecked />
              </O.VStack>
            </O.Card>
          </O.Well>
          <O.Well title="Working hours" fill>
            <O.Card grow>
              <O.Grid min={120} gap={3}>
                <O.Field label="Start"><O.TimeInput defaultValue="09:00" /></O.Field>
                <O.Field label="End"><O.TimeInput defaultValue="17:30" /></O.Field>
              </O.Grid>
            </O.Card>
          </O.Well>
        </Cols>
        <O.Well title="Activity this year">
          <O.Card><O.Heatmap values={Array.from({ length: 40 * 7 }, (_, i) => (i * 7919) % 5)} label="Activity" unit="actions" /></O.Card>
        </O.Well>
      </Page>
    </Screen>
  );
}
