# Sfera UI starter

React 19 + Vite + TypeScript + StyleX, with the Sfera UI library in `src/sfera/`.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build into dist/
```

- Components live in `src/sfera/`, one file per group. You own the source.
- Wrap your app once in `<SferaProvider>` (already done in `src/main.tsx`).
- Fonts: Geist and Geist Mono load from Google Fonts in `index.html`.
- Accent presets: `<SferaProvider defaultAccent="violet">` (blue, violet, pink, red, orange, green).
