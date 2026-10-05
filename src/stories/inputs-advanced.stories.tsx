import { useState } from 'react';
import { Button, Calendar, DatePicker, DateRangePicker, Field, FileDropzone, FileItem, NumberInput, PinInput, Slider, Stack, TagInput, toast, type DateRange } from '@ui';
import { defineStories } from '../workbench/types';

export const slider = defineStories({
  id: 'slider',
  title: 'Slider',
  group: 'Inputs',
  component: 'Slider',
  description: 'Pick a value or range by dragging. Arrow keys step, Shift+Arrow ×10, PageUp/Down, Home/End.',
  playground: {
    args: { min: 0, max: 100, step: 1, disabled: false, showTooltip: true },
    controls: {
      min: { type: 'number' },
      max: { type: 'number' },
      step: { type: 'number', min: 1 },
      showTooltip: { type: 'boolean' },
      disabled: { type: 'boolean' },
    },
    render: (a) => (
      <div className="sb-w-320">
        <Slider defaultValue={[40]} aria-label="Value" {...a} />
      </div>
    ),
  },
  stories: [
    {
      name: 'Range',
      render: function Render() {
        const [v, setV] = useState([20, 80]);
        return (
          <div className="sb-w-320">
            <Field label="Price range" labelAside={`$${v[0]} – $${v[1]}`}>
              <Slider value={v} onValueChange={setV} formatValue={(n) => `$${n}`} />
            </Field>
          </div>
        );
      },
    },
    {
      name: 'Marks',
      render: () => (
        <div className="sb-w-400">
          <Field label="Storage">
            <Slider
              defaultValue={[50]}
              step={25}
              formatValue={(n) => `${n * 10} GB`}
              marks={[
                { value: 0, label: '0' },
                { value: 25, label: '250 GB' },
                { value: 50, label: '500 GB' },
                { value: 75, label: '750 GB' },
                { value: 100, label: '1 TB' },
              ]}
            />
          </Field>
        </div>
      ),
    },
  ],
});

export const numberInput = defineStories({
  id: 'number-input',
  title: 'Number input',
  group: 'Inputs',
  description: 'Numeric entry with steppers, ↑/↓ keys (Shift ×10), clamping and precision.',
  stories: [
    {
      name: 'Variants',
      render: () => (
        <Stack gap={4} className="sb-w-280">
          <Field label="Seats">
            <NumberInput defaultValue={5} min={1} max={50} />
          </Field>
          <Field label="Price">
            <NumberInput variant="inline" prefix="$" defaultValue={19.99} step={0.5} precision={2} />
          </Field>
          <Field label="Weight">
            <NumberInput variant="inline" suffix="kg" defaultValue={72} />
          </Field>
          <Field label="Disabled">
            <NumberInput defaultValue={3} disabled />
          </Field>
        </Stack>
      ),
    },
  ],
});

export const tagInput = defineStories({
  id: 'tag-input',
  title: 'Tag input',
  group: 'Inputs',
  description: 'Enter tokens with Enter, comma or paste. Backspace removes the last tag.',
  stories: [
    {
      name: 'Emails with validation',
      render: () => (
        <div className="sb-w-400">
          <Field label="Invite teammates" description="Paste a comma-separated list to add many at once.">
            <TagInput defaultValue={['eve@untitledui.com', 'alex@untitledui.com']} placeholder="name@company.com" validate={(t) => /.+@.+\..+/.test(t) || 'Enter a valid email address'} />
          </Field>
        </div>
      ),
    },
    {
      name: 'Keywords with a limit',
      render: () => (
        <div className="sb-w-400">
          <Field label="Topics" description="Up to 5.">
            <TagInput defaultValue={['design', 'systems']} max={5} />
          </Field>
        </div>
      ),
    },
  ],
});

export const pinInput = defineStories({
  id: 'pin-input',
  title: 'PIN input',
  group: 'Inputs',
  description: 'One-time codes with auto-advance, backspace, arrow keys and paste support.',
  stories: [
    {
      name: 'Verification code',
      render: () => (
        <Stack gap={4} align="center">
          <PinInput groupSize={3} onComplete={(v) => toast.success(`Code ${v} entered`)} />
          <PinInput length={4} defaultValue="12" mask />
          <PinInput length={4} defaultValue="9431" invalid />
        </Stack>
      ),
    },
  ],
});

export const datePicker = defineStories({
  id: 'date-picker',
  title: 'Date picker',
  group: 'Inputs',
  description: 'Custom calendar with full keyboard support (arrows, PageUp/Down for months, Shift+Page for years, Home/End for week).',
  stories: [
    {
      name: 'Single date',
      height: 120,
      render: () => (
        <Stack gap={4} className="sb-w-280">
          <Field label="Due date">
            <DatePicker clearable defaultValue={new Date()} />
          </Field>
          <Field label="Future only" description="Past dates are disabled.">
            <DatePicker min={new Date()} />
          </Field>
        </Stack>
      ),
    },
    {
      name: 'Date range',
      render: function Render() {
        const [r, setR] = useState<DateRange>({ start: null, end: null });
        return (
          <div className="sb-w-320">
            <Field label="Report period">
              <DateRangePicker value={r} onValueChange={setR} clearable />
            </Field>
          </div>
        );
      },
    },
    {
      name: 'Inline calendar',
      render: () => (
        <div className="ui-surface-overlay" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <Calendar defaultValue={new Date()} isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6} />
        </div>
      ),
    },
    {
      name: 'Two-month range calendar',
      render: () => (
        <div className="ui-surface-overlay" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <Calendar mode="range" months={2} />
        </div>
      ),
    },
  ],
});

interface Upload {
  id: number;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export const fileUpload = defineStories({
  id: 'file-upload',
  title: 'File upload',
  group: 'Inputs',
  description: 'Drag-and-drop zone plus upload list with progress, success and error states.',
  stories: [
    {
      name: 'Dropzone with progress',
      layout: 'padded',
      render: function Render() {
        const [items, setItems] = useState<Upload[]>([
          { id: 1, name: 'Tech design requirements.pdf', size: 200_000, progress: 100, status: 'complete' },
          { id: 2, name: 'Dashboard prototype recording.mp4', size: 16_000_000, progress: 40, status: 'uploading' },
          { id: 3, name: 'Dashboard prototype FINAL.fig', size: 4_200_000, progress: 0, status: 'error' },
        ]);
        const simulate = (id: number) => {
          const iv = setInterval(() => {
            setItems((list) =>
              list.map((it) => {
                if (it.id !== id) return it;
                const p = Math.min(100, it.progress + 8 + Math.random() * 12);
                if (p >= 100) clearInterval(iv);
                return { ...it, progress: p, status: p >= 100 ? 'complete' : 'uploading' };
              }),
            );
          }, 250);
        };
        const add = (files: File[]) => {
          const next = files.map((f, i) => ({ id: Date.now() + i, name: f.name, size: f.size, progress: 0, status: 'uploading' as const }));
          setItems((l) => [...next, ...l]);
          next.forEach((n) => simulate(n.id));
        };
        return (
          <Stack gap={3} style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
            <FileDropzone onFiles={add} maxSize={20_000_000} onReject={(_, reason) => toast.error(reason)} />
            {items.map((it) => (
              <FileItem
                key={it.id}
                name={it.name}
                size={it.size}
                progress={it.progress}
                status={it.status}
                onRemove={() => setItems((l) => l.filter((x) => x.id !== it.id))}
                onRetry={() => {
                  setItems((l) => l.map((x) => (x.id === it.id ? { ...x, status: 'uploading', progress: 0 } : x)));
                  simulate(it.id);
                }}
              />
            ))}
          </Stack>
        );
      },
    },
    {
      name: 'Compact',
      render: () => (
        <div className="sb-w-400">
          <FileDropzone compact onFiles={(f) => toast(`${f.length} file(s) selected`)} hint="PNG or JPG, up to 2 MB" />
        </div>
      ),
    },
    {
      name: 'Avatar uploader',
      render: () => (
        <Stack direction="row" gap={4} align="center">
          <span className="ui-avatar" data-size="xl" style={{ ['--_s' as string]: '64px' }}>
            <span className="ui-avatar__fallback">OR</span>
          </span>
          <Stack gap={1}>
            <Stack direction="row" gap={2}>
              <Button size="sm">Change</Button>
              <Button size="sm" variant="ghost">
                Remove
              </Button>
            </Stack>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>JPG, GIF or PNG. 1 MB max.</span>
          </Stack>
        </Stack>
      ),
    },
  ],
});
