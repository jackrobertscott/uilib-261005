import { useState } from 'react';
import { BarChart, Field, Stack, Swatch, SwatchPicker, Text } from '@ui';
import { defineStories } from '../workbench/types';

const PALETTE = [
  '#f87171', '#ef4444', '#f97316', '#fb923c', '#f59e0b', '#facc15', '#a3e635', '#65a30d',
  '#22c55e', '#10b981', '#14b8a6', '#22d3ee', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ffffff', '#a1a1aa', '#52525b', '#18181b',
];

export const swatch = defineStories({
  id: 'swatch-picker',
  title: 'Swatch picker',
  group: 'Selection',
  component: 'SwatchPicker',
  description: 'Pick a colour from a fixed palette. Radio semantics with roving focus — arrow keys move across and between rows. Swatch renders a single colour chip for legends and data-coloured entities.',
  playground: {
    args: { size: 'md', disabled: false },
    controls: {
      size: { type: 'radio', options: ['sm', 'md', 'lg'] },
      disabled: { type: 'boolean' },
    },
    render: (a) => <SwatchPicker {...a} colors={PALETTE} defaultValue="#3b82f6" aria-label="Team colour" className="sb-w-320" />,
  },
  stories: [
    {
      name: 'In a field',
      render: () => {
        function Demo() {
          const [c, setC] = useState('#f97316');
          return (
            <Stack gap={4} className="sb-w-320">
              <Field label="Team colour" description="Shown beside your team name everywhere in the app.">
                <SwatchPicker colors={PALETTE} value={c} onValueChange={setC} size="sm" />
              </Field>
              <Stack direction="row" gap={2} align="center">
                <Swatch color={c} size="md" />
                <Text size="sm" weight="medium">Flying Squirrels</Text>
                <Text size="sm" tone="tertiary" mono>{c}</Text>
              </Stack>
            </Stack>
          );
        }
        return <Demo />;
      },
    },
    {
      name: 'Swatch sizes',
      render: () => (
        <Stack direction="row" gap={3} align="center">
          {(['xs', 'sm', 'md', 'lg'] as const).map((s) => <Swatch key={s} color="#8b5cf6" size={s} />)}
          <Swatch color="#22c55e" size="lg" shape="circle" />
        </Stack>
      ),
    },
  ],
});

const points = [0, 0, 0, 4, 4, 3, 10, 4, 8, 8, 11, 4, 5, 7, 4, 0];

export const barChart = defineStories({
  id: 'bar-chart',
  title: 'Bar chart',
  group: 'Data display',
  component: 'BarChart',
  description: 'Grouped vertical bars with nice y-axis ticks, gridlines, per-bar tooltips and a hidden data table for screen readers. Colours come from the --chart-N tokens.',
  stories: [
    {
      name: 'Single series',
      layout: 'padded',
      render: () => (
        <div className="sb-w-full">
          <BarChart
            aria-label="Points scored per game"
            data={points.map((v, i) => ({ label: String(i + 1), values: { games: v } }))}
            series={[{ key: 'games', label: 'Games' }]}
            xLabel="Points scored"
            yLabel="Occurrences"
          />
        </div>
      ),
    },
    {
      name: 'Grouped',
      layout: 'padded',
      render: () => (
        <div className="sb-w-full">
          <BarChart
            aria-label="Points for and against per round"
            height={200}
            data={[12, 14, 9, 11, 15, 10].map((v, i) => ({ label: `R${i + 1}`, values: { for: v, against: [9, 11, 12, 10, 8, 13][i] } }))}
            series={[{ key: 'for', label: 'For' }, { key: 'against', label: 'Against', color: 'var(--chart-5)' }]}
          />
        </div>
      ),
    },
  ],
});
