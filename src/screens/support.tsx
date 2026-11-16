import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CircleCheck, Clock, Mail, MapPin, Paperclip, PanelRight, Phone, Send, Tag } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  EmptyState,
  HStack,
  IconButton,
  Kbd,
  MetadataList,
  SearchInput,
  SegmentedControl,
  StatusSelect,
  Text,
  Tooltip,
  VStack,
  useMediaQuery,
  useToast,
  type StatusOption,
} from '../sfera';
import { accent, colors, font, motion } from '../sfera/tokens.stylex';
import { Screen } from './kit';
import { harbor } from './products';

const convStatus: StatusOption[] = [
  { value: 'open', label: 'Open', tone: 'info' },
  { value: 'snoozed', label: 'Snoozed', tone: 'warning' },
  { value: 'closed', label: 'Closed', tone: 'success' },
];
type Msg = { from: 'them' | 'me' | 'note'; text: string; at: string };
type Conv = { id: string; name: string; email: string; subject: string; status: string; unread: boolean; at: string; plan: string; city: string; tags: string[]; msgs: Msg[] };
const seed: Conv[] = [
  {
    id: 'c1', name: 'Lea Moss', email: 'lea@moss.studio', subject: 'Refund for duplicate charge', status: 'open', unread: true, at: '9:41', plan: 'Team · 12 seats', city: 'Lisbon', tags: ['billing', 'priority'],
    msgs: [
      { from: 'them', text: 'Hi! I was charged twice for November — can you refund one of them?', at: '9:32' },
      { from: 'note', text: 'Stripe shows two captures 4 seconds apart. Safe to refund the second.', at: '9:36' },
      { from: 'them', text: 'Invoice numbers are INV-2041 and INV-2042. Thanks!', at: '9:41' },
    ],
  },
  { id: 'c2', name: 'Sam Ito', email: 'sam@ito.jp', subject: 'SSO setup with Okta', status: 'open', unread: true, at: '9:12', plan: 'Enterprise', city: 'Tokyo', tags: ['sso'], msgs: [{ from: 'them', text: 'Our IdP rejects the ACS URL. Which one should we use?', at: '9:12' }] },
  { id: 'c3', name: 'Nadia Karim', email: 'nadia@karim.ae', subject: 'Export stuck at 80%', status: 'snoozed', unread: false, at: 'Yesterday', plan: 'Team · 4 seats', city: 'Dubai', tags: ['bug'], msgs: [{ from: 'them', text: 'The CSV export has been at 80% for an hour.', at: 'Yesterday' }, { from: 'me', text: 'Looking into it — I have re-queued the job.', at: 'Yesterday' }] },
  { id: 'c4', name: 'Owen Hale', email: 'owen@hale.uk', subject: 'How do I add a teammate?', status: 'closed', unread: false, at: 'Mon', plan: 'Starter', city: 'Leeds', tags: [], msgs: [{ from: 'them', text: 'Where do I invite a teammate?', at: 'Mon' }, { from: 'me', text: 'Settings → Members → Invite. Done!', at: 'Mon' }] },
  { id: 'c5', name: 'Priya Nair', email: 'priya@nair.in', subject: 'API rate limits', status: 'open', unread: false, at: 'Mon', plan: 'Team · 30 seats', city: 'Bengaluru', tags: ['api'], msgs: [{ from: 'them', text: 'We hit 429s at about 40 req/s. Can we raise it?', at: 'Mon' }] },
];

const s = stylex.create({
  panes: { display: 'grid', gridTemplateColumns: { default: '320px minmax(0, 1fr) 300px', '@media (max-width: 1280px)': '300px minmax(0, 1fr)', '@media (max-width: 760px)': 'minmax(0, 1fr)' }, width: '100%', height: 'calc(100dvh - 53px)', minHeight: 0 },
  list: { display: 'flex', flexDirection: 'column', minHeight: 0, borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: colors.border },
  listHead: { display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  listScroll: { overflowY: 'auto', flexGrow: 1, padding: 6 },
  hideMobile: { display: { default: 'flex', '@media (max-width: 760px)': 'none' } },
  item: {
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr)',
    gap: 10,
    width: '100%',
    padding: 10,
    borderWidth: 0,
    borderRadius: 12,
    textAlign: 'left',
    cursor: 'pointer',
    color: colors.text,
    backgroundColor: { default: 'transparent', ':hover': colors.hover },
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  itemOn: { backgroundColor: { default: colors.well, ':hover': colors.well } },
  row: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
  name: { fontSize: font.md, fontWeight: 500, flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  time: { fontSize: font.xs, color: colors.textSubtle, flexShrink: 0 },
  subj: { fontSize: font.sm, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadDot: { width: 7, height: 7, borderRadius: '50%', backgroundColor: accent.base, flexShrink: 0 },
  conv: { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 },
  convHead: { display: 'flex', alignItems: 'center', gap: { default: 10, '@media (max-width: 640px)': 6 }, padding: { default: '10px 14px', '@media (max-width: 640px)': '8px 8px' }, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.border },
  convTitle: { display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 },
  msgs: { flexGrow: 1, overflowY: 'auto', padding: { default: '20px 24px', '@media (max-width: 640px)': '16px 12px' }, display: 'flex', flexDirection: 'column', gap: 14 },
  bubbleRow: { display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: '100%' },
  mine: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: 'min(520px, 80%)', padding: '9px 12px', borderRadius: 16, fontSize: font.md, lineHeight: 1.5, backgroundColor: colors.well, color: colors.text, overflowWrap: 'anywhere' },
  bubbleMine: { backgroundColor: accent.base, color: accent.onAccent, borderBottomRightRadius: 6 },
  bubbleThem: { borderBottomLeftRadius: 6 },
  note: { alignSelf: 'center', maxWidth: 520, padding: '8px 12px', borderRadius: 12, fontSize: font.sm, color: colors.text, backgroundColor: `color-mix(in oklab, ${colors.warning} 14%, transparent)`, borderWidth: 1, borderStyle: 'dashed', borderColor: `color-mix(in oklab, ${colors.warning} 40%, transparent)` },
  stamp: { fontSize: 11, color: colors.textSubtle, marginInline: 4 },
  composer: { margin: 12, padding: 8, borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: colors.borderStrong, backgroundColor: colors.surface, display: 'flex', flexDirection: 'column', gap: 6 },
  input: { width: '100%', minHeight: 44, maxHeight: 160, resize: 'none', borderWidth: 0, outlineStyle: 'none', backgroundColor: 'transparent', fontSize: { default: font.md, '@media (max-width: 640px)': font.lg }, lineHeight: 1.5, color: colors.text, padding: '4px 6px', '::placeholder': { color: colors.textSubtle } },
  contact: { display: { default: 'flex', '@media (max-width: 1280px)': 'none' }, flexDirection: 'column', gap: 14, padding: 16, overflowY: 'auto', borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: colors.border, minHeight: 0 },
  panelBtn: { display: { default: 'none', '@media (max-width: 1280px)': 'inline-flex' } },
  backBtn: { display: { default: 'none', '@media (max-width: 760px)': 'inline-flex' } },
});

function ContactPanel({ c }: { c: Conv }) {
  return (
    <VStack gap={4}>
      <VStack gap={2} align="center">
        <Avatar name={c.name} size="xl" />
        <VStack gap={0} align="center">
          <Text weight="medium">{c.name}</Text>
          <Text size="sm" tone="muted">{c.email}</Text>
        </VStack>
      </VStack>
      <MetadataList
        items={[
          { label: 'Plan', value: c.plan },
          { label: 'Location', icon: <MapPin size={14} />, value: c.city },
          { label: 'Local time', icon: <Clock size={14} />, value: '14:41' },
          { label: 'Phone', icon: <Phone size={14} />, value: '+351 21 000 4412' },
        ]}
      />
      <VStack gap={2}>
        <Text size="xs" tone="subtle" mono>TAGS</Text>
        <HStack gap={1} wrap>
          {c.tags.length ? c.tags.map((t) => <Badge key={t} tone={t === 'priority' ? 'danger' : 'neutral'}>{t}</Badge>) : <Text size="sm" tone="muted">No tags</Text>}
        </HStack>
      </VStack>
      <VStack gap={2}>
        <Text size="xs" tone="subtle" mono>PAST CONVERSATIONS</Text>
        {['Password reset · Aug', 'Invoice address · Jun'].map((p) => (
          <HStack key={p} gap={2}>
            <CircleCheck size={14} />
            <Text size="sm" tone="muted">{p}</Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

export function SupportInboxScreen() {
  const toast = useToast();
  const [convs, setConvs] = useState(seed);
  const [filter, setFilter] = useState('open');
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string | null>('c1');
  const [draft, setDraft] = useState('');
  const [panel, setPanel] = useState(false);
  const phone = useMediaQuery('(max-width: 760px)');
  const msgsRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => convs.filter((c) => (filter === 'all' || c.status === filter) && (c.name + c.subject).toLowerCase().includes(q.toLowerCase())), [convs, filter, q]);
  const cur = convs.find((c) => c.id === active) ?? null;
  useEffect(() => {
    msgsRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' });
  }, [cur?.msgs.length, active]);
  const update = (id: string, patch: Partial<Conv>) => setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const send = () => {
    if (!cur || !draft.trim()) return;
    update(cur.id, { msgs: [...cur.msgs, { from: 'me', text: draft.trim(), at: 'now' }] });
    setDraft('');
  };
  const showList = !phone || !active;
  const showConv = !phone || !!active;
  return (
    <Screen
      product={harbor}
      active="inbox"
      flush
      topbar={
        <HStack gap={2} grow>
          <Text weight="medium">Inbox</Text>
          <Badge>{convs.filter((c) => c.status === 'open').length} open</Badge>
        </HStack>
      }
    >
      <div {...stylex.props(s.panes)}>
        {showList && (
          <section {...stylex.props(s.list)} aria-label="Conversations">
            <div {...stylex.props(s.listHead)}>
              <SegmentedControl fullWidth size="sm" label="Filter" value={filter} onChange={setFilter} options={[{ value: 'open', label: 'Open' }, { value: 'snoozed', label: 'Snoozed' }, { value: 'closed', label: 'Closed' }, { value: 'all', label: 'All' }]} />
              <SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Search conversations" />
            </div>
            <div {...stylex.props(s.listScroll)}>
              {list.length ? (
                list.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-current={c.id === active ? 'true' : undefined}
                    onClick={() => {
                      setActive(c.id);
                      update(c.id, { unread: false });
                    }}
                    {...stylex.props(s.item, c.id === active && s.itemOn)}
                  >
                    <Avatar name={c.name} size="md" />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span {...stylex.props(s.row)}>
                        <span {...stylex.props(s.name)}>{c.name}</span>
                        {c.unread && <span {...stylex.props(s.unreadDot)} aria-label="Unread" />}
                        <span {...stylex.props(s.time)}>{c.at}</span>
                      </span>
                      <span {...stylex.props(s.subj)}>{c.subject}</span>
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: 8 }}>
                  <EmptyState icon={<CircleCheck size={18} />} title="Inbox zero" description={`No ${filter === 'all' ? '' : filter} conversations${q ? ` match “${q}”` : ''}.`} />
                </div>
              )}
            </div>
          </section>
        )}
        {showConv &&
          (cur ? (
            <section {...stylex.props(s.conv)} aria-label="Conversation">
              <div {...stylex.props(s.convHead)}>
                <span {...stylex.props(s.backBtn)}>
                  <IconButton label="Back to list" icon={<ArrowLeft size={17} />} onClick={() => setActive(null)} />
                </span>
                <div {...stylex.props(s.convTitle)}>
                  <Text weight="medium" truncate>{cur.subject}</Text>
                  <Text size="xs" tone="muted" truncate>{cur.name} · {cur.email}</Text>
                </div>
                <StatusSelect label="Conversation status" options={convStatus} value={cur.status} onChange={(v) => (update(cur.id, { status: v }), toast({ title: `Marked ${v}`, tone: v === 'closed' ? 'success' : 'neutral' }))} />
                <span {...stylex.props(s.panelBtn)}>
                  <IconButton label="Contact details" variant="secondary" icon={<PanelRight size={16} />} onClick={() => setPanel(true)} />
                </span>
              </div>
              <div ref={msgsRef} {...stylex.props(s.msgs)}>
                {cur.msgs.map((m, i) =>
                  m.from === 'note' ? (
                    <div key={i} {...stylex.props(s.note)}>
                      <strong style={{ fontWeight: 500 }}>Internal note · </strong>
                      {m.text}
                    </div>
                  ) : (
                    <div key={i} {...stylex.props(s.bubbleRow, m.from === 'me' && s.mine)}>
                      <Avatar name={m.from === 'me' ? harbor.user[0] : cur.name} size="sm" />
                      <div {...stylex.props(s.bubble, m.from === 'me' ? s.bubbleMine : s.bubbleThem)}>{m.text}</div>
                      <span {...stylex.props(s.stamp)}>{m.at}</span>
                    </div>
                  ),
                )}
              </div>
              <div {...stylex.props(s.composer)}>
                <textarea
                  aria-label="Reply"
                  placeholder={`Reply to ${cur.name.split(' ')[0]}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) (e.preventDefault(), send());
                  }}
                  {...stylex.props(s.input)}
                />
                <HStack justify="between">
                  <HStack gap={1}>
                    <Tooltip content="Attach file">
                      <IconButton size="sm" label="Attach file" icon={<Paperclip size={15} />} onClick={() => toast({ title: 'Attachments are coming soon' })} />
                    </Tooltip>
                    <Tooltip content="Add tag">
                      <IconButton size="sm" label="Add tag" icon={<Tag size={15} />} onClick={() => toast({ title: 'Tagging is coming soon' })} />
                    </Tooltip>
                  </HStack>
                  <HStack gap={2}>
                    <Kbd keys={['mod', 'enter']} />
                    <Button size="sm" variant="primary" iconEnd={<Send size={14} />} disabled={!draft.trim()} onClick={send}>
                      Send
                    </Button>
                  </HStack>
                </HStack>
              </div>
            </section>
          ) : (
            <section {...stylex.props(s.conv, s.hideMobile)} style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <EmptyState bordered={false} icon={<Mail size={18} />} title="Pick a conversation" description="Choose one from the list to read and reply." />
            </section>
          ))}
        {cur && (
          <aside {...stylex.props(s.contact)} aria-label="Contact">
            <ContactPanel c={cur} />
          </aside>
        )}
      </div>
      {cur && (
        <Drawer open={panel} onClose={() => setPanel(false)} title="Contact">
          <ContactPanel c={cur} />
        </Drawer>
      )}
    </Screen>
  );
}
