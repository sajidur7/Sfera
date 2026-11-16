import * as stylex from '@stylexjs/stylex';
import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Code2, Plus } from 'lucide-react';
import { accent, colors, font, motion } from '../sfera/tokens.stylex';
import * as O from '../sfera';
import { bySlug, components, groups, type CompDoc, type Example } from './registry';
import { exampleFiles, files, region, requires } from './source';
import { CodePopup, CopyButton, highlight } from './code';

export const doc = stylex.create({
  eyebrow: { fontFamily: font.mono, fontSize: 12, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 },
  h1: { margin: 0, fontSize: { default: 40, '@media (max-width: 640px)': 30 }, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.08, color: colors.text },
  lead: { margin: 0, fontSize: { default: 17, '@media (max-width: 640px)': 15 }, lineHeight: 1.55, color: colors.textMuted, maxWidth: 680 },
  head: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 },
  h2: { margin: '0 0 4px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: colors.text },
  section: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 44 },
  p: { margin: 0, fontSize: font.md, lineHeight: 1.65, color: colors.textMuted, maxWidth: 720 },
  path: { fontFamily: font.mono, fontSize: 12.5, color: colors.textMuted, overflowWrap: 'anywhere' },
  importBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 6px 6px 14px',
    borderRadius: 12,
    backgroundColor: colors.codeBg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    fontFamily: font.mono,
    fontSize: 12.5,
    maxWidth: 680,
    minWidth: 0,
  },
  importCode: { flexGrow: 1, minWidth: 0, overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' },
});

const exs = stylex.create({
  well: { display: 'flex', flexDirection: 'column', gap: 6, padding: 6, backgroundColor: colors.well, borderRadius: 22, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge, minWidth: 0 },
  bar: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px 4px 12px', minWidth: 0 },
  num: { fontFamily: font.mono, fontSize: 12, color: colors.textSubtle, flexShrink: 0 },
  title: { fontSize: font.md, fontWeight: 500, color: colors.text, flexShrink: { default: 0, '@media (max-width: 640px)': 1 }, flexGrow: { default: 0, '@media (max-width: 640px)': 1 }, minWidth: 0, textWrap: 'balance' },
  desc: { fontSize: font.sm, color: colors.textMuted, flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { default: 'nowrap', '@media (max-width: 640px)': 'normal' }, display: { default: 'block', '@media (max-width: 640px)': 'none' } },
  spacer: { flexGrow: 1 },
  stage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    padding: { default: '36px 32px', '@media (max-width: 640px)': '24px 16px' },
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
    minWidth: 0,
  },
  stretch: { alignItems: 'stretch', flexDirection: 'column' },
  mdesc: { margin: '0 12px 2px', fontSize: font.sm, color: colors.textMuted, display: { default: 'none', '@media (max-width: 640px)': 'block' } },
});

function ExampleBlock({ n, ex, comp }: { n: number; ex: Example; comp: CompDoc }) {
  const [open, setOpen] = useState(false);
  const f = files[comp.file];
  const usage = region(exampleFiles[ex.file], ex.region);
  const source = comp.regions.map((r) => region(f.text, r)).join('\n\n');
  const req = requires(f.text);
  return (
    <div {...stylex.props(exs.well)}>
      <div {...stylex.props(exs.bar)}>
        <span {...stylex.props(exs.num)}>{String(n).padStart(2, '0')}</span>
        <span {...stylex.props(exs.title)}>{ex.title}</span>
        <span {...stylex.props(exs.desc)}>{ex.description}</span>
        <span {...stylex.props(exs.spacer)} />
        <O.Button size="sm" variant="secondary" iconStart={<Code2 size={14} />} onClick={() => setOpen(true)}>
          Code
        </O.Button>
      </div>
      {ex.description && <p {...stylex.props(exs.mdesc)}>{ex.description}</p>}
      <div {...stylex.props(exs.stage, ex.align === 'stretch' && exs.stretch)}>{ex.render()}</div>
      <CodePopup
        open={open}
        onClose={() => setOpen(false)}
        title={`${comp.name} · ${ex.title}`}
        requires={`Requires ${req.packages.join(', ')} · imports ${req.local.join(', ')}`}
        install={`npm i @stylexjs/stylex lucide-react`}
        tabs={[
          { id: 'usage', label: 'Usage', code: usage, path: `src/docs/examples/${ex.file}.examples.tsx` },
          { id: 'source', label: 'Source', code: source, path: f.path },
        ]}
      />
    </div>
  );
}

// ───────── Playgrounds
const pg = stylex.create({
  grid: { display: 'grid', gridTemplateColumns: { default: 'minmax(0, 1fr) 260px', '@media (max-width: 760px)': 'minmax(0, 1fr)' }, gap: 6 },
  controls: { display: 'flex', flexDirection: 'column', gap: 14, padding: 16, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: colors.wellEdge },
  label: { fontSize: font.xs, fontFamily: font.mono, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.05em' },
  row: { display: 'flex', flexDirection: 'column', gap: 6 },
  code: { margin: 0, padding: '10px 12px', fontFamily: font.mono, fontSize: 12, lineHeight: 1.6, backgroundColor: colors.codeBg, borderRadius: 10, overflowX: 'auto', whiteSpace: 'pre', borderWidth: 1, borderStyle: 'solid', borderColor: colors.border },
});
function Ctl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div {...stylex.props(pg.row)}>
      <span {...stylex.props(pg.label)}>{label}</span>
      {children}
    </div>
  );
}
const seg = (vals: string[]) => vals.map((v) => ({ value: v, label: v }));
function Playground({ kind }: { kind: NonNullable<CompDoc['playground']> }) {
  const [variant, setVariant] = useState('primary');
  const [size, setSize] = useState('md');
  const [icon, setIcon] = useState(true);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [tone, setTone] = useState('success');
  const [chipVar, setChipVar] = useState('soft');
  const [label, setLabel] = useState('Shipped');
  const [avSize, setAvSize] = useState('lg');
  const [presence, setPresence] = useState('online');
  const [name, setName] = useState('Mira Chen');
  const [n, setN] = useState(3);
  const [segSize, setSegSize] = useState('md');
  const [full, setFull] = useState(false);
  const [checked, setChecked] = useState(true);
  let stage: ReactNode = null;
  let controls: ReactNode = null;
  let code = '';
  if (kind === 'button') {
    stage = (
      <O.Button variant={variant as O.ButtonVariant} size={size as O.ButtonSize} iconStart={icon ? <Plus size={15} /> : undefined} loading={loading} disabled={disabled}>
        New record
      </O.Button>
    );
    code = `<Button variant="${variant}" size="${size}"${icon ? ' iconStart={<Plus size={15} />}' : ''}${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}>\n  New record\n</Button>`;
    controls = (
      <>
        <Ctl label="Variant">
          <O.Select size="sm" value={variant} onChange={setVariant} options={seg(['primary', 'secondary', 'soft', 'ghost', 'danger'])} />
        </Ctl>
        <Ctl label="Size">
          <O.SegmentedControl size="sm" fullWidth value={size} onChange={setSize} options={seg(['xs', 'sm', 'md', 'lg'])} />
        </Ctl>
        <O.Switch size="sm" label="Icon" checked={icon} onChange={setIcon} />
        <O.Switch size="sm" label="Loading" checked={loading} onChange={setLoading} />
        <O.Switch size="sm" label="Disabled" checked={disabled} onChange={setDisabled} />
      </>
    );
  } else if (kind === 'chip') {
    stage = <O.StatusChip tone={tone as O.Tone} variant={chipVar as 'soft' | 'dot'}>{label || ' '}</O.StatusChip>;
    code = `<StatusChip tone="${tone}" variant="${chipVar}">${label}</StatusChip>`;
    controls = (
      <>
        <Ctl label="Tone">
          <O.Select size="sm" value={tone} onChange={setTone} options={seg(['neutral', 'accent', 'success', 'warning', 'danger', 'info'])} />
        </Ctl>
        <Ctl label="Variant">
          <O.SegmentedControl size="sm" fullWidth value={chipVar} onChange={setChipVar} options={seg(['soft', 'dot'])} />
        </Ctl>
        <Ctl label="Label">
          <O.TextInput size="sm" value={label} onChange={(e) => setLabel(e.target.value)} />
        </Ctl>
      </>
    );
  } else if (kind === 'avatar') {
    const pres = presence === 'none' ? undefined : (presence as O.Presence);
    stage = <O.Avatar name={name || '?'} size={avSize as O.AvatarSize} presence={pres} />;
    code = `<Avatar name="${name}" size="${avSize}"${pres ? ` presence="${pres}"` : ''} />`;
    controls = (
      <>
        <Ctl label="Name">
          <O.TextInput size="sm" value={name} onChange={(e) => setName(e.target.value)} />
        </Ctl>
        <Ctl label="Size">
          <O.SegmentedControl size="sm" fullWidth value={avSize} onChange={setAvSize} options={seg(['xs', 'sm', 'md', 'lg', 'xl', '2xl'])} />
        </Ctl>
        <Ctl label="Presence">
          <O.Select size="sm" value={presence} onChange={setPresence} options={['none', 'online', 'away', 'busy', 'offline'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
        </Ctl>
      </>
    );
  } else if (kind === 'segmented') {
    const opts = ['Day', 'Week', 'Month', 'Quarter', 'Year'].slice(0, n).map((v) => ({ value: v.toLowerCase(), label: v }));
    stage = (
      <div style={{ width: full ? '100%' : undefined }}>
        <O.SegmentedControl key={n} size={segSize as 'sm' | 'md'} fullWidth={full} options={opts} />
      </div>
    );
    code = `<SegmentedControl size="${segSize}"${full ? ' fullWidth' : ''}\n  options={[${opts.map((o) => `{ value: '${o.value}', label: '${o.label}' }`).join(', ')}]} />`;
    controls = (
      <>
        <Ctl label="Options">
          <O.NumberInput size="sm" value={n} onChange={setN} min={2} max={5} label="Options" />
        </Ctl>
        <Ctl label="Size">
          <O.SegmentedControl size="sm" fullWidth value={segSize} onChange={setSegSize} options={seg(['sm', 'md'])} />
        </Ctl>
        <O.Switch size="sm" label="Full width" checked={full} onChange={setFull} />
      </>
    );
  } else if (kind === 'switch') {
    stage = <O.Switch checked={checked} onChange={setChecked} size={size === 'sm' ? 'sm' : 'md'} disabled={disabled} label={checked ? 'On' : 'Off'} />;
    code = `<Switch checked={${checked}} size="${size === 'sm' ? 'sm' : 'md'}"${disabled ? ' disabled' : ''} />`;
    controls = (
      <>
        <Ctl label="Size">
          <O.SegmentedControl size="sm" fullWidth value={size === 'sm' ? 'sm' : 'md'} onChange={setSize} options={seg(['sm', 'md'])} />
        </Ctl>
        <O.Switch size="sm" label="Disabled" checked={disabled} onChange={setDisabled} />
      </>
    );
  }
  return (
    <div {...stylex.props(exs.well)}>
      <div {...stylex.props(exs.bar)}>
        <span {...stylex.props(exs.title)}>Playground</span>
        <span {...stylex.props(exs.desc)}>Change the props; the code below updates.</span>
      </div>
      <div {...stylex.props(pg.grid)}>
        <div {...stylex.props(exs.stage)} style={{ flexDirection: 'column', gap: 20 }}>
          {stage}
          <pre {...stylex.props(pg.code)} style={{ alignSelf: 'stretch' }}>
            {highlight(code)}
          </pre>
        </div>
        <div {...stylex.props(pg.controls)}>{controls}</div>
      </div>
    </div>
  );
}

const pn = stylex.create({ row: { display: 'grid', gridTemplateColumns: { default: '1fr 1fr', '@media (max-width: 560px)': '1fr' }, gap: 10 } });
const api = stylex.create({
  mono: { fontFamily: font.mono, fontSize: 12.5, color: colors.text },
  type: { fontFamily: font.mono, fontSize: 12, color: colors.textMuted, whiteSpace: 'normal', overflowWrap: 'anywhere' },
  desc: { fontSize: font.sm, color: colors.textMuted, whiteSpace: 'normal', minWidth: 180 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, overflow: 'hidden' },
});

export function ComponentPage({ slug }: { slug: string }) {
  const c = bySlug[slug];
  if (!c)
    return (
      <O.EmptyState title="Component not found" description={`No component called “${slug}”.`} actions={<O.Button onClick={() => (location.hash = '#components')}>All components</O.Button>} />
    );
  const importLine = `import { ${c.imports.join(', ')} } from './sfera';`;
  const idx = components.indexOf(c);
  const next = components[idx + 1];
  const prev = components[idx - 1];
  return (
    <article>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>{c.group}</p>
        <h1 {...stylex.props(doc.h1)}>{c.name}</h1>
        <span {...stylex.props(doc.path)}>{files[c.file].path}</span>
        <p {...stylex.props(doc.lead)}>{c.description}</p>
        <div {...stylex.props(doc.importBox)}>
          <code {...stylex.props(doc.importCode)}>{highlight(importLine)}</code>
          <CopyButton text={importLine} iconOnly label="Copy import" />
        </div>
      </header>
      <O.VStack gap={5}>
        {c.examples.map((e, i) => (
          <ExampleBlock key={e.region + i} n={i + 1} ex={e} comp={c} />
        ))}
      </O.VStack>
      {c.playground && (
        <section {...stylex.props(doc.section)}>
          <Playground kind={c.playground} />
        </section>
      )}
      {c.api && (
        <section {...stylex.props(doc.section)}>
          <h2 {...stylex.props(doc.h2)}>API</h2>
          <div {...stylex.props(api.card)}>
            <O.Table
              label={`${c.name} props`}
              rowKey={(r) => r[0]}
              rows={c.api}
              columns={[
                { key: 'p', header: 'Prop', render: (r) => <span {...stylex.props(api.mono)}>{r[0]}</span> },
                { key: 't', header: 'Type', render: (r) => <span {...stylex.props(api.type)}>{r[1]}</span> },
                { key: 'd', header: 'Default', hideBelow: 'sm', render: (r) => <span {...stylex.props(api.type)}>{r[2]}</span> },
                { key: 'x', header: 'Notes', hideBelow: 'md', render: (r) => <span {...stylex.props(api.desc)}>{r[3]}</span> },
              ]}
            />
          </div>
        </section>
      )}
      {(prev || next) && (
        <section {...stylex.props(doc.section)}>
          <div {...stylex.props(pn.row)}>
            {prev ? (
              <O.Card onClick={() => (location.hash = `#components-${prev.slug}`)}>
                <O.HStack gap={3}>
                  <ArrowLeft size={18} />
                  <O.VStack gap={1}>
                    <O.Text size="xs" tone="subtle" mono>PREVIOUS</O.Text>
                    <O.Text weight="medium">{prev.name}</O.Text>
                  </O.VStack>
                </O.HStack>
              </O.Card>
            ) : (
              <span />
            )}
            {next ? (
              <O.Card onClick={() => (location.hash = `#components-${next.slug}`)}>
                <O.HStack justify="end" gap={3}>
                  <O.VStack gap={1} align="end">
                    <O.Text size="xs" tone="subtle" mono>NEXT</O.Text>
                    <O.Text weight="medium">{next.name}</O.Text>
                  </O.VStack>
                  <ArrowRight size={18} />
                </O.HStack>
              </O.Card>
            ) : (
              <span />
            )}
          </div>
        </section>
      )}
    </article>
  );
}

const ti = stylex.create({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px, 100%), 1fr))', gap: 10 },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 6,
    textDecoration: 'none',
    color: colors.text,
    backgroundColor: colors.well,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.wellEdge, ':hover': colors.borderStrong },
    transitionProperty: 'border-color, transform',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    transform: { default: null, ':active': 'scale(0.985)' },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineOffset: 2,
    outlineColor: accent.base,
  },
  stage: {
    height: 132,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
    pointerEvents: 'none',
  },
  meta: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 8px 6px' },
  name: { fontSize: font.md, fontWeight: 500 },
  desc: { fontSize: font.xs, color: colors.textMuted, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  gh: { display: 'flex', alignItems: 'baseline', gap: 10, margin: '36px 0 12px' },
  gname: { margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' },
  gcount: { fontFamily: font.mono, fontSize: 12, color: colors.textSubtle },
});

export function ComponentsIndex() {
  return (
    <div>
      <header {...stylex.props(doc.head)}>
        <p {...stylex.props(doc.eyebrow)}>Library</p>
        <h1 {...stylex.props(doc.h1)}>Components</h1>
        <p {...stylex.props(doc.lead)}>
          {components.length} components in {new Set(components.map((c) => c.file)).size} files. Every tile is live; open one for examples, real source and props.
        </p>
      </header>
      {groups.map((g) => {
        const list = components.filter((c) => c.group === g);
        if (!list.length) return null;
        return (
          <section key={g}>
            <div {...stylex.props(ti.gh)}>
              <h2 {...stylex.props(ti.gname)}>{g}</h2>
              <span {...stylex.props(ti.gcount)}>{list.length}</span>
            </div>
            <div {...stylex.props(ti.grid)}>
              {list.map((c) => (
                <a key={c.slug} href={`#components-${c.slug}`} {...stylex.props(ti.tile)}>
                  <div {...stylex.props(ti.stage)} inert>
                    {c.preview()}
                  </div>
                  <div {...stylex.props(ti.meta)}>
                    <span {...stylex.props(ti.name)}>{c.name}</span>
                    <span {...stylex.props(ti.desc)}>{c.description}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
