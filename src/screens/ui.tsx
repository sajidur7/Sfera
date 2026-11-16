import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors, font } from '../sfera/tokens.stylex';

/** Layout atoms shared by the screens. Components come from Sfera; this file only arranges them. */
const u = stylex.create({
  page: { display: 'flex', flexDirection: 'column', gap: 16, marginInline: 'auto', width: '100%', minWidth: 0 },
  head: { display: 'flex', alignItems: { default: 'flex-end', '@media (max-width: 640px)': 'flex-start' }, justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  titles: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  title: { margin: 0, fontSize: { default: 28, '@media (max-width: 640px)': 22 }, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.15, color: colors.text },
  sub: { margin: 0, fontSize: font.sm, color: colors.textMuted },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  cols: (t: string) => ({ display: 'grid', gridTemplateColumns: { default: t, '@media (max-width: 960px)': 'minmax(0, 1fr)' }, gap: 12, alignItems: 'start', minWidth: 0 }),
  stretch: { alignItems: 'stretch' },
  row: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 },
  max: (w: string) => ({ maxWidth: w }),
  eyebrow: { fontFamily: font.mono, fontSize: 11, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 },
  flush: { padding: 0 },
});

export function Page({ title, subtitle, actions, children, max = 1280, eyebrow }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; max?: number; eyebrow?: ReactNode }) {
  return (
    <div {...stylex.props(u.page, u.max(`${max}px`))}>
      {(title || actions) && (
        <div {...stylex.props(u.head)}>
          <div {...stylex.props(u.titles)}>
            {eyebrow && <p {...stylex.props(u.eyebrow)}>{eyebrow}</p>}
            {title && <h1 {...stylex.props(u.title)}>{title}</h1>}
            {subtitle && <p {...stylex.props(u.sub)}>{subtitle}</p>}
          </div>
          {actions && <div {...stylex.props(u.actions)}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Responsive columns: `template` on desktop, one column under 960px. */
export function Cols({ template, children, stretch }: { template: string; children: ReactNode; stretch?: boolean }) {
  return <div {...stylex.props(u.cols(template), stretch && u.stretch)}>{children}</div>;
}

export function Row({ children }: { children: ReactNode }) {
  return <div {...stylex.props(u.row)}>{children}</div>;
}

export const money = (n: number, d = 0) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (n: number) => `${n > 0 ? '+' : ''}${n}%`;
/** Deterministic pseudo-random numbers for demo data. */
export function rand(seed: number) {
  let x = seed;
  return () => ((x = (x * 9301 + 49297) % 233280), x / 233280);
}
export const names = ['Mira Chen', 'Theo Park', 'Ana Ruiz', 'Jonas Weber', 'Lea Moss', 'Sam Ito', 'Nadia Karim', 'Owen Hale', 'Priya Nair', 'Kofi Mensah', 'Elena Rossi', 'Tom Becker', 'Yuki Tanaka', 'Omar Haddad', 'Sara Lind'];
