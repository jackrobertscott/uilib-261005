# Untitled UI Kit

A themeable React component library with a Storybook-like workbench, inspired by a minimal monochrome file-manager design.

**Live workbench:** https://web-production-6b5be.up.railway.app

```bash
npm install
npm run dev      # workbench at http://localhost:5173
npm run build    # type-check + production build
```

## Design system

The whole theme derives from **9 primitive CSS variables** in `src/lib/styles/tokens.css`:

| Primitive | Controls |
| --- | --- |
| `--ui-neutral-hue`, `--ui-neutral-chroma` | the 13-step grey ramp → surfaces, borders, text |
| `--ui-accent-hue`, `--ui-accent-chroma` | accent, focus ring, links, info, chart palette |
| `--ui-radius` | radius scale `--radius-xs … xl` |
| `--ui-space` | spacing `--sp-*` and control heights `--h-*` |
| `--ui-font-size` | type scale `--fs-2xs … 4xl` |
| `--ui-font-sans`, `--ui-font-mono` | typefaces |

Light/dark is a mode (`data-theme="dark"` on any element), not a variable — it only flips the derived lightness ramp. Open **Theme** in the workbench to edit primitives live and copy the resulting CSS.

## Library (`src/lib`)

Every control is a custom, keyboard-accessible implementation — no native select, checkbox, radio, date or range widgets.

- **Actions:** Button, IconButton, ButtonGroup
- **Inputs:** Input, SearchInput, Textarea, NumberInput, TagInput, PinInput, Slider (single/range), DatePicker, DateRangePicker, Calendar, FileDropzone / FileItem, Field + Label
- **Selection:** Select, MultiSelect, Combobox, Checkbox / CheckboxGroup, RadioGroup (incl. cards), Switch, SegmentedControl
- **Data display:** DataTable, Avatar / AvatarGroup, Badge, Tag, Card, IconTile, Stat, Sparkline, Tree, List, Timeline, DescriptionList, Heading, Text, Link, Code, Kbd
- **Feedback:** Alert, Toast (`toast()` + `<Toaster/>`), Progress, ProgressCircle, Spinner, Skeleton, EmptyState
- **Navigation:** Tabs (line / segmented / pills), Breadcrumbs, Pagination, Stepper, Accordion, NavItem / NavSection
- **Overlays:** Menu (submenus, checkbox/radio items), ContextMenu, Popover, Tooltip, Dialog, ConfirmDialog, Drawer, CommandPalette
- **Layout:** AppShell, Sidebar, PageHeader, SectionHeader, Stack / HStack, Divider

Import from `@ui` (alias for `src/lib/index.ts`).

## Workbench

- `src/stories/*.stories.tsx` — every exported `defineStories({...})` becomes a page: an optional playground with controls and generated code, plus example stories.
- `src/demos/*.demo.tsx` — full-page compositions (Files, Dashboard, Settings, Sign in) with a desktop/tablet/mobile viewport switcher.
- ⌘K opens the command palette; the moon icon toggles dark mode.
