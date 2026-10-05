# Project: UI component library + workbench

A themeable React component library (inspired by a minimal, monochrome "Untitled UI"-style file manager)
plus a Storybook-like workbench for browsing components, variants and demo compositions.

## User preferences (keep this section up to date — add new preferences as the user states them)

- **Git:** commit at every milestone of work, in this and all future conversations.
- **Remember preferences:** record every preference the user states in this file, in this and future conversations.
- **Design system:** the whole theme must derive from a *minimal* set of CSS variables (primitives in
  `src/lib/styles/tokens.css`). Everything else is derived from them. Don't add new primitives casually.
- **No native UI controls:** every standard control (select, checkbox, radio, switch, slider, date picker,
  file upload, tooltip, scrollbars, etc.) must be a custom, styled, accessible implementation. Text entry
  may use an underlying `<input>`/`<textarea>`, but fully restyled.
- **Quality bar:** components must be high quality, usable, keyboard-accessible and contemporary.
  The library should be complete enough to build an entire application from it alone.
- **Image is inspiration only:** take liberties to define a coherent, complete library.

## Layout

- `src/lib/` — the component library (components, hooks, styles/tokens).
- `src/workbench/` — the Storybook-like explorer (sidebar, canvas, controls, token editor).
- `src/stories/` — one `*.stories.tsx` per component (variants + playground controls).
- `src/demos/` — full-page compositions built only from library components.

## Commands

- `npm run dev` — start the workbench (Vite).
- `npm run build` — type-check and build.
