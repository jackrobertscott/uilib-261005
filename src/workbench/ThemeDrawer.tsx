import { Copy, RotateCcw } from 'lucide-react';
import { Button, Drawer, Field, SegmentedControl, Select, Slider, Stack, toast } from '@ui';
import { FONTS, PRESETS, PRIMITIVES, themeToCss, type PrimitiveKey, type ThemeState } from './theme';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  theme: ThemeState;
  setTheme: (t: ThemeState) => void;
}

/** Live editor for the 9 design primitives. */
export function ThemeDrawer({ open, onOpenChange, theme, setTheme }: Props) {
  const css = themeToCss(theme);
  const setValue = (k: PrimitiveKey, v: number) => setTheme({ ...theme, values: { ...theme.values, [k]: v } });
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Theme"
      description="Every token in the system derives from these primitives."
      size="sm"
      footer={
        <>
          <Button variant="ghost" leading={<RotateCcw />} onClick={() => setTheme({ mode: theme.mode, values: {} })}>
            Reset
          </Button>
          <Button
            variant="primary"
            leading={<Copy />}
            onClick={() =>
              navigator.clipboard.writeText(css).then(
                () => toast.success('Theme CSS copied', { description: 'Paste it after tokens.css to apply.' }),
                () => toast.error('Clipboard unavailable'),
              )
            }
          >
            Copy CSS
          </Button>
        </>
      }
    >
      <Stack gap={5}>
        <Field label="Mode">
          <SegmentedControl
            fullWidth
            value={theme.mode}
            onValueChange={(m) => setTheme({ ...theme, mode: m as ThemeState['mode'] })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </Field>
        <Field label="Preset">
          <Select
            placeholder="Choose a preset"
            options={PRESETS.map((p) => ({ value: p.name, label: p.name }))}
            onValueChange={(name) => {
              const p = PRESETS.find((x) => x.name === name);
              if (p) setTheme({ ...theme, values: p.values, font: p.font });
            }}
          />
        </Field>
        <div className="wb-hue-preview" style={{ background: 'var(--accent)' }} aria-hidden />
        {(Object.keys(PRIMITIVES) as PrimitiveKey[]).map((k) => {
          const p = PRIMITIVES[k];
          const v = theme.values[k] ?? p.default;
          return (
            <Field key={k} label={p.label} labelAside={<code className="wb-mono">{`${k} ${v}${p.unit}`}</code>}>
              <Slider value={[v]} min={p.min} max={p.max} step={p.step} onValueChange={([n]) => setValue(k, n)} showTooltip={false} aria-label={p.label} />
            </Field>
          );
        })}
        <Field label="Font family" labelAside={<code className="wb-mono">--ui-font-sans</code>}>
          <Select value={theme.font ?? FONTS[0].value} onValueChange={(f) => setTheme({ ...theme, font: f === FONTS[0].value ? undefined : (f ?? undefined) })} options={FONTS} />
        </Field>
        <div className="wb-code wb-code--small">
          <pre>
            <code>{css}</code>
          </pre>
        </div>
      </Stack>
    </Drawer>
  );
}
