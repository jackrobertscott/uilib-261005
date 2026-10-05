import { useEffect, useState } from 'react';

/** The editable primitives — mirrors the top of src/lib/styles/tokens.css. */
export const PRIMITIVES = {
  '--ui-neutral-hue': { label: 'Neutral hue', min: 0, max: 360, step: 1, unit: '', default: 270 },
  '--ui-neutral-chroma': { label: 'Neutral tint', min: 0, max: 0.03, step: 0.001, unit: '', default: 0.004 },
  '--ui-accent-hue': { label: 'Accent hue', min: 0, max: 360, step: 1, unit: '', default: 266 },
  '--ui-accent-chroma': { label: 'Accent chroma', min: 0, max: 0.3, step: 0.005, unit: '', default: 0.17 },
  '--ui-radius': { label: 'Radius', min: 0, max: 16, step: 1, unit: 'px', default: 8 },
  '--ui-space': { label: 'Space unit', min: 3, max: 5, step: 0.25, unit: 'px', default: 4 },
  '--ui-font-size': { label: 'Base font size', min: 12, max: 16, step: 0.5, unit: 'px', default: 14 },
} as const;

export type PrimitiveKey = keyof typeof PRIMITIVES;

export const FONTS = [
  { value: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif", label: 'Inter' },
  { value: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", label: 'System UI' },
  { value: "'JetBrains Mono Variable', ui-monospace, monospace", label: 'JetBrains Mono' },
  { value: "ui-serif, Georgia, 'Times New Roman', serif", label: 'Serif' },
];

export interface ThemeState {
  mode: 'light' | 'dark';
  values: Partial<Record<PrimitiveKey, number>>;
  font?: string;
}

export const PRESETS: { name: string; values: ThemeState['values']; font?: string }[] = [
  { name: 'Untitled (default)', values: {} },
  { name: 'Ocean', values: { '--ui-accent-hue': 230, '--ui-neutral-hue': 240, '--ui-neutral-chroma': 0.012, '--ui-radius': 10 } },
  { name: 'Forest', values: { '--ui-accent-hue': 150, '--ui-accent-chroma': 0.13, '--ui-neutral-hue': 150, '--ui-neutral-chroma': 0.008, '--ui-radius': 6 } },
  { name: 'Ember', values: { '--ui-accent-hue': 40, '--ui-accent-chroma': 0.18, '--ui-neutral-hue': 50, '--ui-neutral-chroma': 0.01, '--ui-radius': 12 } },
  { name: 'Mono / sharp', values: { '--ui-accent-chroma': 0, '--ui-neutral-chroma': 0, '--ui-radius': 2 } },
  { name: 'Compact', values: { '--ui-space': 3.5, '--ui-font-size': 13 } },
];

const KEY = 'wb-theme';

function load(): ThemeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable */
  }
  const dark = typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
  return { mode: dark ? 'dark' : 'light', values: {} };
}

export function useThemeState() {
  const [state, setState] = useState<ThemeState>(load);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = state.mode;
    for (const key of Object.keys(PRIMITIVES) as PrimitiveKey[]) {
      const v = state.values[key];
      if (v == null) root.style.removeProperty(key);
      else root.style.setProperty(key, `${v}${PRIMITIVES[key].unit}`);
    }
    if (state.font) root.style.setProperty('--ui-font-sans', state.font);
    else root.style.removeProperty('--ui-font-sans');
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);
  return [state, setState] as const;
}

export function themeToCss(state: ThemeState) {
  const lines = (Object.keys(PRIMITIVES) as PrimitiveKey[]).map((k) => {
    const v = state.values[k] ?? PRIMITIVES[k].default;
    return `  ${k}: ${v}${PRIMITIVES[k].unit};`;
  });
  if (state.font) lines.push(`  --ui-font-sans: ${state.font};`);
  return `:root {\n${lines.join('\n')}\n}`;
}
