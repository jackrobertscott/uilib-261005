import type { ReactNode } from 'react';

export type Control =
  | { type: 'select'; options: string[]; label?: string }
  | { type: 'radio'; options: string[]; label?: string }
  | { type: 'boolean'; label?: string }
  | { type: 'text'; label?: string }
  | { type: 'number'; min?: number; max?: number; step?: number; label?: string }
  | { type: 'range'; min: number; max: number; step?: number; label?: string };

export type Args = Record<string, any>;

export interface Story<A extends Args = Args> {
  name: string;
  description?: ReactNode;
  render: (args: A) => ReactNode;
  /** centered = middle of canvas; padded = top-left; fullscreen = edge to edge. */
  layout?: 'centered' | 'padded' | 'fullscreen';
  /** Canvas min-height. */
  height?: number | string;
}

export interface Playground<A extends Args = Args> {
  args: A;
  controls: { [K in keyof A]?: Control };
  render: (args: A) => ReactNode;
  /** Optional custom code snippet; otherwise generated from component + args. */
  code?: (args: A) => string;
  layout?: Story['layout'];
  height?: number | string;
}

export interface StoryModule<A extends Args = Args> {
  /** URL slug. */
  id: string;
  title: string;
  group: 'Foundations' | 'Actions' | 'Inputs' | 'Selection' | 'Data display' | 'Feedback' | 'Navigation' | 'Overlays' | 'Layout' | 'Demos';
  description?: ReactNode;
  /** Component name used in generated snippets. */
  component?: string;
  /** Which arg becomes JSX children in generated snippets. */
  childrenArg?: string;
  playground?: Playground<A>;
  stories: Story[];
  /** Render the page as a single full-bleed demo (Demos). */
  fullPage?: boolean;
  order?: number;
}

/** Identity helper for typing a story module. Playground args are loosely typed on purpose. */
export function defineStories(m: StoryModule<Args>): StoryModule {
  return m;
}
