// Real source files, loaded as text so the docs show exactly what ships.
import action from '../sfera/action.tsx?raw';
import forms from '../sfera/forms.tsx?raw';
import overlay from '../sfera/overlay.tsx?raw';
import feedback from '../sfera/feedback.tsx?raw';
import content from '../sfera/content.tsx?raw';
import layout from '../sfera/layout.tsx?raw';
import navigation from '../sfera/navigation.tsx?raw';
import data from '../sfera/data.tsx?raw';
import charts from '../sfera/charts.tsx?raw';
import shell from '../sfera/shell.tsx?raw';
import icons from '../sfera/icons.tsx?raw';
import provider from '../sfera/provider.tsx?raw';
import tokens from '../sfera/tokens.stylex.ts?raw';
import themes from '../sfera/themes.ts?raw';
import hooks from '../sfera/hooks.ts?raw';
import dates from '../sfera/dates.tsx?raw';
import chat from '../sfera/chat.tsx?raw';
import editor from '../sfera/editor.tsx?raw';
import stats from '../sfera/stats.tsx?raw';
import flow from '../sfera/flow.tsx?raw';
import exStats from './examples/stats.examples.tsx?raw';
import exApp from './examples/app.examples.tsx?raw';
import exDates from './examples/dates.examples.tsx?raw';
import exChat from './examples/chat.examples.tsx?raw';
import exEditor from './examples/editor.examples.tsx?raw';
import exAction from './examples/action.examples.tsx?raw';
import exForms from './examples/forms.examples.tsx?raw';
import exOverlay from './examples/overlay.examples.tsx?raw';
import exFeedback from './examples/feedback.examples.tsx?raw';
import exContent from './examples/content.examples.tsx?raw';
import exLayout from './examples/layout.examples.tsx?raw';
import exNavigation from './examples/navigation.examples.tsx?raw';
import exData from './examples/data.examples.tsx?raw';
import exCharts from './examples/charts.examples.tsx?raw';

export const files = {
  action: { path: 'src/sfera/action.tsx', text: action },
  forms: { path: 'src/sfera/forms.tsx', text: forms },
  overlay: { path: 'src/sfera/overlay.tsx', text: overlay },
  feedback: { path: 'src/sfera/feedback.tsx', text: feedback },
  content: { path: 'src/sfera/content.tsx', text: content },
  layout: { path: 'src/sfera/layout.tsx', text: layout },
  navigation: { path: 'src/sfera/navigation.tsx', text: navigation },
  data: { path: 'src/sfera/data.tsx', text: data },
  charts: { path: 'src/sfera/charts.tsx', text: charts },
  shell: { path: 'src/sfera/shell.tsx', text: shell },
  icons: { path: 'src/sfera/icons.tsx', text: icons },
  provider: { path: 'src/sfera/provider.tsx', text: provider },
  tokens: { path: 'src/sfera/tokens.stylex.ts', text: tokens },
  themes: { path: 'src/sfera/themes.ts', text: themes },
  hooks: { path: 'src/sfera/hooks.ts', text: hooks },
  dates: { path: 'src/sfera/dates.tsx', text: dates },
  chat: { path: 'src/sfera/chat.tsx', text: chat },
  editor: { path: 'src/sfera/editor.tsx', text: editor },
  stats: { path: 'src/sfera/stats.tsx', text: stats },
  flow: { path: 'src/sfera/flow.tsx', text: flow },
} as const;
export type FileKey = keyof typeof files;

export const exampleFiles: Record<string, string> = {
  action: exAction,
  forms: exForms,
  overlay: exOverlay,
  feedback: exFeedback,
  content: exContent,
  layout: exLayout,
  navigation: exNavigation,
  data: exData,
  charts: exCharts,
  dates: exDates,
  chat: exChat,
  editor: exEditor,
  stats: exStats,
  app: exApp,
};

/** Pulls the text between `// #region name` and the matching `// #endregion`. */
export function region(text: string, name: string): string {
  const start = text.indexOf(`// #region ${name}\n`);
  if (start < 0) return `// region "${name}" not found`;
  const from = start + `// #region ${name}\n`.length;
  const end = text.indexOf('// #endregion', from);
  return dedent(text.slice(from, end).replace(/\s+$/, ''));
}
function dedent(s: string) {
  const lines = s.split('\n');
  const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(ind)).join('\n');
}

/** Imports a file needs, read from its header: npm packages and sibling files. */
export function requires(text: string) {
  const pk = new Set<string>();
  const local = new Set<string>();
  for (const m of text.matchAll(/from '([^']+)'/g)) {
    const s = m[1];
    if (s.startsWith('.')) local.add(s.replace('./', '') + (s.includes('.stylex') ? '.ts' : ''));
    else if (s !== 'react' && s !== 'react-dom') pk.add(s);
  }
  return { packages: [...pk], local: [...local] };
}
