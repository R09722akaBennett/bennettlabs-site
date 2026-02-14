# Bennett Labs Site

Personal brand website for Bennett Tai.

## Stack

- React 18
- TypeScript
- Vite 5
- Component-based single page architecture

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```text
.
├── index.html
├── src
│   ├── App.tsx
│   ├── components
│   │   └── Concepts.tsx
│   ├── data
│   │   └── profile.ts
│   ├── main.tsx
│   └── styles
│       └── global.css
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Content updates

Most personal content is centralized in `src/data/profile.ts`.

## Current layout

The homepage uses the Editorial Split direction (Option 1) as the production base.
