import { defineStories } from '../workbench/types';
import { Code } from '@ui';
import './foundations.css';

const Swatch = ({ v, label, fg }: { v: string; label?: string; fg?: string }) => (
  <div className="fd-swatch">
    <div className="fd-swatch__chip" style={{ background: `var(${v})`, color: fg ? `var(${fg})` : undefined }}>
      {fg ? 'Aa' : null}
    </div>
    <div className="fd-swatch__name">{label ?? v}</div>
  </div>
);

const primitives = [
  ['--ui-neutral-hue', '270', 'Hue that tints every grey.'],
  ['--ui-neutral-chroma', '0.004', 'How tinted the greys are (0 = pure grey).'],
  ['--ui-accent-hue', '266', 'Hue of the interactive accent: focus rings, links, info, charts.'],
  ['--ui-accent-chroma', '0.17', 'Accent saturation. 0 gives a fully monochrome UI.'],
  ['--ui-radius', '8px', 'Base radius. xs/sm/md/lg/xl radii are multiples of it.'],
  ['--ui-space', '4px', 'Base spacing unit. All padding, gaps and control heights are multiples.'],
  ['--ui-font-size', '14px', 'Body size. The 9-step type scale is derived from it.'],
  ['--ui-font-sans', 'Inter', 'Interface typeface.'],
  ['--ui-font-mono', 'JetBrains Mono', 'Code & tabular typeface.'],
];

export default defineStories({
  id: 'tokens',
  title: 'Design tokens',
  group: 'Foundations',
  order: 1,
  description: (
    <>
      The entire theme is composed from <b>nine primitive variables</b>. Everything else — a 13-step neutral ramp, accent and
      status palettes, surfaces, borders, text, radii, spacing, control heights, type scale and elevation — is <i>derived</i>
      from them in <Code>tokens.css</Code>. Dark mode only flips the derived lightness ramp. Try the <b>Theme</b> panel.
    </>
  ),
  stories: [
    {
      name: 'Primitives',
      description: 'The only variables you are meant to change.',
      layout: 'padded',
      render: () => (
        <table className="fd-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {primitives.map(([k, v, d]) => (
              <tr key={k}>
                <td>
                  <Code>{k}</Code>
                </td>
                <td className="fd-mono">{v}</td>
                <td>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      name: 'Derivation',
      description: 'How the primitives flow into semantic tokens that components consume.',
      layout: 'padded',
      render: () => (
        <div className="fd-flow">
          {[
            ['Primitives', ['--ui-neutral-hue', '--ui-accent-hue', '--ui-radius', '--ui-space', '--ui-font-size']],
            ['Scales', ['--gray-0 … --gray-12', '--accent, --danger…', '--radius-xs … xl', '--sp-1 … --sp-16', '--fs-2xs … --fs-4xl']],
            ['Semantic', ['--bg-surface, --bg-hover', '--text, --text-secondary', '--border, --ring', '--h-sm/md/lg', '--shadow-xs … lg']],
            ['Components', ['.ui-btn', '.ui-control', '.ui-card', '.ui-menu', '…']],
          ].map(([title, items]) => (
            <div key={title as string} className="fd-flow__col">
              <div className="fd-flow__title">{title}</div>
              {(items as string[]).map((i) => (
                <div key={i} className="fd-flow__item">
                  {i}
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  ],
});

export const colors = defineStories({
  id: 'colors',
  title: 'Colour',
  group: 'Foundations',
  order: 2,
  description: 'A tinted neutral ramp carries the monochrome look of the reference; one accent hue and four fixed status hues add meaning.',
  stories: [
    {
      name: 'Neutral ramp',
      description: '0 = raised surface, 12 = ink. Steps 1–2 backgrounds, 3–5 interactive fills, 5–8 borders, 9–12 text.',
      layout: 'padded',
      render: () => (
        <div className="fd-ramp">
          {Array.from({ length: 13 }, (_, i) => (
            <Swatch key={i} v={`--gray-${i}`} label={String(i)} />
          ))}
        </div>
      ),
    },
    {
      name: 'Surfaces & text',
      layout: 'padded',
      render: () => (
        <div className="fd-swatches">
          {['--bg-canvas', '--bg-app', '--bg-surface', '--bg-subtle', '--bg-muted', '--bg-inverse'].map((v) => (
            <Swatch key={v} v={v} />
          ))}
          {['--border-subtle', '--border', '--border-strong'].map((v) => (
            <Swatch key={v} v={v} />
          ))}
          {['--text', '--text-secondary', '--text-tertiary', '--text-disabled'].map((v) => (
            <Swatch key={v} v={v} />
          ))}
        </div>
      ),
    },
    {
      name: 'Accent & status',
      layout: 'padded',
      render: () => (
        <div className="fd-status">
          {['accent', 'success', 'warning', 'danger'].map((t) => (
            <div key={t} className="fd-swatches">
              <Swatch v={`--${t}`} />
              <Swatch v={`--${t}-subtle`} fg={`--${t}-text`} />
              <Swatch v={`--${t}-border`} />
              <Swatch v={`--${t}-text`} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Chart palette',
      description: 'Rotated from the accent hue so data colours follow the theme.',
      layout: 'padded',
      render: () => (
        <div className="fd-swatches">
          {[1, 2, 3, 4, 5].map((i) => (
            <Swatch key={i} v={`--chart-${i}`} />
          ))}
        </div>
      ),
    },
  ],
});

export const typography = defineStories({
  id: 'typography',
  title: 'Typography',
  group: 'Foundations',
  order: 3,
  description: 'Inter with tabular figures where numbers align. Sizes derive from --ui-font-size.',
  stories: [
    {
      name: 'Type scale',
      layout: 'padded',
      render: () => (
        <div className="fd-type">
          {[
            ['--fs-4xl', 'Display', 600],
            ['--fs-3xl', 'Page title', 600],
            ['--fs-2xl', 'Heading 1', 600],
            ['--fs-xl', 'Heading 2', 600],
            ['--fs-lg', 'Heading 3', 600],
            ['--fs-md', 'Body — the quick brown fox jumps over the lazy dog', 400],
            ['--fs-sm', 'UI text — labels, buttons, table cells', 400],
            ['--fs-xs', 'Caption — helper text, metadata', 400],
            ['--fs-2xs', 'OVERLINE — SECTION LABELS', 500],
          ].map(([v, s, w]) => (
            <div key={v as string} className="fd-type__row">
              <span className="fd-mono">{v}</span>
              <span style={{ fontSize: `var(${v})`, fontWeight: w as number, letterSpacing: (w as number) > 500 ? '-0.015em' : undefined }}>{s}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Weights & colours',
      layout: 'padded',
      render: () => (
        <div className="fd-type">
          <p style={{ fontWeight: 400 }}>Regular 400 — body copy</p>
          <p style={{ fontWeight: 500 }}>Medium 500 — labels, buttons, emphasis</p>
          <p style={{ fontWeight: 600 }}>Semibold 600 — titles, headings</p>
          <p style={{ color: 'var(--text-secondary)' }}>Secondary text — supporting copy</p>
          <p style={{ color: 'var(--text-tertiary)' }}>Tertiary text — metadata, placeholders</p>
          <p style={{ fontFamily: 'var(--ui-font-mono)', fontSize: 'var(--fs-sm)' }}>Mono — const theme = derive(primitives);</p>
        </div>
      ),
    },
  ],
});

export const spacing = defineStories({
  id: 'spacing',
  title: 'Space, radius & elevation',
  group: 'Foundations',
  order: 4,
  stories: [
    {
      name: 'Spacing scale',
      description: 'Multiples of --ui-space (4px).',
      layout: 'padded',
      render: () => (
        <div className="fd-space">
          {['1', '1-5', '2', '3', '4', '5', '6', '8', '10', '12', '16'].map((s) => (
            <div key={s} className="fd-space__row">
              <span className="fd-mono">--sp-{s}</span>
              <span className="fd-space__bar" style={{ width: `var(--sp-${s})` }} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Control heights',
      layout: 'padded',
      render: () => (
        <div className="fd-swatches">
          {['xs', 'sm', 'md', 'lg'].map((h) => (
            <div key={h} className="fd-height" style={{ height: `var(--h-${h})` }}>
              --h-{h}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Radius',
      layout: 'padded',
      render: () => (
        <div className="fd-swatches">
          {['xs', 'sm', 'md', 'lg', 'xl', 'full'].map((r) => (
            <div key={r} className="fd-radius-wrap">
              <div className="fd-radius" style={{ borderRadius: `var(--radius-${r})` }} />
              <span className="fd-mono">--radius-{r}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Elevation',
      layout: 'padded',
      render: () => (
        <div className="fd-swatches fd-swatches--roomy">
          {['xs', 'sm', 'md', 'lg'].map((s) => (
            <div key={s} className="fd-shadow" style={{ boxShadow: `var(--shadow-${s})` }}>
              <span className="fd-mono">--shadow-{s}</span>
            </div>
          ))}
          <div className="fd-shadow" style={{ boxShadow: 'var(--focus-ring)' }}>
            <span className="fd-mono">--focus-ring</span>
          </div>
        </div>
      ),
    },
  ],
});
