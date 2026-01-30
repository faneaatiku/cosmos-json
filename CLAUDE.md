# Cosmos JSON

Cosmic-themed JSON viewer/parser for Cosmos SDK developers.

## Tech Stack

- **React 19 + Vite 7 + TypeScript** (ESM, `type: "module"`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config` file — config is in `src/index.css` using `@theme`)
- **CodeMirror 6** (`@uiw/react-codemirror` + `@codemirror/lang-json`) for JSON editing
- **jsondiffpatch** for JSON comparison/diff (formatters imported from `jsondiffpatch/formatters/html`)
- **Zustand** for editor panel state (keystroke-frequency updates)
- **React Context** for settings (persisted to localStorage)
- **lucide-react** for icons

## Commands

- `npm run dev` — start dev server (port 5173)
- `npm run build` — typecheck + production build (`tsc -b && vite build`)
- `npx tsc -b` — typecheck only

## Project Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root: SettingsProvider > Layout > Header + JsonPanelContainer + SettingsDrawer
├── index.css                         # Tailwind imports, custom @theme colors (cosmos-*, nebula-*, star-*), CM overrides, diff styling
├── vite-env.d.ts
├── types/index.ts                    # AddressLabel, Settings, JsonValue types
├── hooks/useLocalStorage.ts          # Generic localStorage hook
├── hooks/useSyncScroll.ts           # Bidirectional scroll sync between two elements (used for dual panel sync)
├── context/SettingsContext.tsx        # Settings state: parseCoins, sortKeys, compareMode, dualPanel, addressLabels
├── store/editorStore.ts              # Zustand: leftJson, rightJson, syncEditors, syncParsed
├── components/
│   ├── Layout.tsx                    # App shell wrapping CosmicBackground
│   ├── CosmicBackground.tsx          # Canvas star animation (fixed, pointer-events-none)
│   ├── Header.tsx                    # Title + toggle buttons (Sort Keys, Parse Coins, Dual/Single, Compare) + settings gear
│   ├── JsonPanelContainer.tsx        # Panel layout; single/dual with vertical resize, scroll sync, PanelDivider + SyncToggle inlined
│   ├── JsonPanel.tsx                 # CodeMirror editor with horizontal resize handle between editor and parsed view
│   ├── JsonTreeView.tsx              # Recursive JSON renderer with coin/address transforms applied visually
│   ├── DiffView.tsx                  # jsondiffpatch HTML output with themed styling
│   ├── CoinDisplay.tsx               # Inline coin badge (amount + denom)
│   ├── SettingsDrawer.tsx            # Slide-out settings panel with toggles
│   └── AddressLabelManager.tsx       # CRUD for address-to-label mappings
└── lib/
    ├── codemirrorSetup.ts            # Cosmic theme + syntax highlighting extensions for CM6
    ├── coinParser.ts                 # String-based coin parsing (regex: ^(\d+)(u[a-z][a-z0-9]{2,})$, 6 decimals)
    ├── addressLabeler.ts             # Address label lookup
    ├── jsonTransform.ts              # Recursive sortKeys utility
    └── jsonDiff.ts                   # jsondiffpatch wrapper (create + format)
```

## Key Architecture Decisions

- **Transforms are visual only** — coin parsing and address labels are applied to the rendered `JsonTreeView`, never mutating the raw editor content.
- **String-based coin math** — `coinParser.ts` pads and slices strings instead of using floating-point division to avoid precision errors. Hardcoded 6 decimal places.
- **Zustand for editors, Context for settings** — editors update every keystroke (needs fine-grained subscriptions), settings change rarely.
- **Tailwind v4 theme** — custom colors defined in `@theme` block in `index.css`, not in a config file. Use `cosmos-*`, `nebula-*`, `star-*` color names.

## Coin Parsing

- **String format**: `"123231ubze"` → `0.123231 BZE`
- **Object format**: `{ "amount": "123231", "denom": "ubze" }` → same display
- **Display denom**: strip `u` prefix, uppercase (`ubze` → `BZE`)
- Detection: `isCoinObject()` checks for exactly 2 keys (`amount` string of digits, `denom` matching `u[a-z][a-z0-9]{2,}`)

## Node Version Note

Vite 7 officially requires Node >=20.19 or >=22.12. The project currently runs on Node 20.16.0 with warnings but works fine.
