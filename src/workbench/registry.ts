import type { StoryModule } from './types';

const storyFiles = import.meta.glob<Record<string, unknown>>('../stories/*.stories.tsx', { eager: true });
const demoFiles = import.meta.glob<Record<string, unknown>>('../demos/*.demo.tsx', { eager: true });

const isModule = (x: unknown): x is StoryModule => !!x && typeof x === 'object' && 'id' in x && 'stories' in x;

export const GROUPS: StoryModule['group'][] = [
  'Foundations',
  'Actions',
  'Inputs',
  'Selection',
  'Data display',
  'Feedback',
  'Navigation',
  'Overlays',
  'Layout',
  'Demos',
];

// Every exported StoryModule in a stories/demo file becomes a page.
export const modules: StoryModule[] = [...Object.values(storyFiles), ...Object.values(demoFiles)]
  .flatMap((file) => Object.values(file).filter(isModule))
  .sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || (a.order ?? 50) - (b.order ?? 50) || a.title.localeCompare(b.title));

export const byId = new Map(modules.map((m) => [m.id, m]));
