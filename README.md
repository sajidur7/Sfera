# Sfera UI

A React design system styled with StyleX. Light and dark themes, six accent presets, Geist type, Lucide icons.

- `src/sfera/` — the library (113 components)
- `src/docs/` — the docs site: every component live, with copyable code
- `src/screens/` — 102 full app screens built only from Sfera components
- `starter/` — a Vite + React + StyleX starter app
- `scripts/make-installer.mjs` — builds `dist-installer/sfera-install.mjs`, a one-file installer

## Run the docs

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

The site is a static Vite build in `dist/` (hash routes, so no server rewrites are needed).

## Install Sfera UI in an app

```bash
node dist-installer/sfera-install.mjs init my-app --install
```

or, inside an existing Vite app:

```bash
node dist-installer/sfera-install.mjs add --install
```
