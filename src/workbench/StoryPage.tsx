import { useState, type ReactNode } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { Badge, Field, IconButton, Input, NumberInput, SegmentedControl, Select, Slider, Switch, Tooltip, toast } from '@ui';
import type { Args, Control, StoryModule, Story } from './types';
import { toJsx } from './codegen';
import type { Viewport } from './Workbench';

export function StoryPage({ mod, viewport }: { mod: StoryModule; viewport: Viewport }) {
  if (mod.fullPage) {
    return (
      <div className="wb-demo" data-viewport={viewport}>
        <div className="wb-demo__frame">{mod.stories[0].render({})}</div>
      </div>
    );
  }
  return (
    <article className="wb-page">
      <header className="wb-page__header">
        <Badge variant="outline">{mod.group}</Badge>
        <h1 className="wb-page__title">{mod.title}</h1>
        {mod.description && <p className="wb-page__desc">{mod.description}</p>}
      </header>
      {mod.playground && <PlaygroundView mod={mod} />}
      {mod.stories.length > 0 && (
        <div className="wb-stories">
          {mod.playground && <h2 className="wb-h2">Examples</h2>}
          {mod.stories.map((s) => (
            <StoryBlock key={s.name} story={s} />
          ))}
        </div>
      )}
    </article>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function StoryBlock({ story }: { story: Story }) {
  const id = slug(story.name);
  return (
    <section className="wb-story" id={id}>
      <div className="wb-story__head">
        <h3 className="wb-story__title">
          {story.name}
        </h3>
        {story.description && <p className="wb-story__desc">{story.description}</p>}
      </div>
      <Canvas layout={story.layout} height={story.height}>
        {story.render({})}
      </Canvas>
    </section>
  );
}

export function Canvas({ children, layout = 'centered', height }: { children: ReactNode; layout?: Story['layout']; height?: number | string }) {
  return (
    <div className="wb-canvas" data-layout={layout} style={{ minHeight: height }}>
      {children}
    </div>
  );
}

function PlaygroundView({ mod }: { mod: StoryModule }) {
  const pg = mod.playground!;
  const [args, setArgs] = useState<Args>(pg.args);
  const [copied, setCopied] = useState(false);
  const code = pg.code ? pg.code(args) : mod.component ? toJsx(mod.component, args, mod.childrenArg) : '';
  const set = (k: string, v: unknown) => setArgs((a) => ({ ...a, [k]: v }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Snippet copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Clipboard unavailable');
    }
  };

  return (
    <section className="wb-playground">
      <div className="wb-playground__stage">
        <Canvas layout={pg.layout} height={pg.height ?? 220}>
          {pg.render(args)}
        </Canvas>
        {code && (
          <div className="wb-code">
            <pre>
              <code>{code}</code>
            </pre>
            <Tooltip content={copied ? 'Copied' : 'Copy'}>
              <IconButton size="xs" aria-label="Copy code" className="wb-code__copy" onClick={copy}>
                {copied ? <Check /> : <Copy />}
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
      <aside className="wb-controls" aria-label="Controls">
        <div className="wb-controls__head">
          <span>Controls</span>
          <Tooltip content="Reset">
            <IconButton size="xs" aria-label="Reset controls" onClick={() => setArgs(pg.args)}>
              <RotateCcw />
            </IconButton>
          </Tooltip>
        </div>
        <div className="wb-controls__list">
          {Object.entries(pg.controls).map(([key, control]) => (
            <ControlField key={key} name={key} control={control as Control} value={args[key]} onChange={(v) => set(key, v)} />
          ))}
        </div>
      </aside>
    </section>
  );
}

function ControlField({ name, control, value, onChange }: { name: string; control: Control; value: any; onChange: (v: any) => void }) {
  const label = control.label ?? name;
  switch (control.type) {
    case 'boolean':
      return (
        <div className="wb-control-row">
          <span className="wb-control-row__label">{label}</span>
          <Switch size="sm" checked={!!value} onCheckedChange={onChange} aria-label={label} />
        </div>
      );
    case 'select':
      return (
        <Field label={label}>
          <Select size="sm" value={value ?? null} onValueChange={(v) => onChange(v ?? undefined)} options={control.options.map((o) => ({ value: o, label: o }))} />
        </Field>
      );
    case 'radio':
      return (
        <Field label={label}>
          <SegmentedControl size="sm" fullWidth value={value} onValueChange={onChange} options={control.options.map((o) => ({ value: o, label: o }))} />
        </Field>
      );
    case 'text':
      return (
        <Field label={label}>
          <Input size="sm" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case 'number':
      return (
        <Field label={label}>
          <NumberInput size="sm" value={value} onValueChange={onChange} min={control.min} max={control.max} step={control.step} />
        </Field>
      );
    case 'range':
      return (
        <Field label={label} labelAside={<span className="wb-mono">{value}</span>}>
          <Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={control.min} max={control.max} step={control.step} showTooltip={false} aria-label={label} />
        </Field>
      );
  }
}
