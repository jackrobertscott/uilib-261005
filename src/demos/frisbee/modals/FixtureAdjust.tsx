import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Alert, Button, Dialog, Field, NumberInput, SegmentedControl, Select, Stack, toast } from '@ui';
import { addDays } from '../data';
import { useStore } from '../store';
import { fmtDate } from '../ui';

/** Shift every fixture from a chosen round onwards by N days or weeks (e.g. a washed-out round). */
export function FixtureAdjustDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const fixtures = s.db.fixtures.filter((f) => f.seasonId === s.season?.id).sort((a, b) => a.date.getTime() - b.date.getTime());
  const [from, setFrom] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(1);
  const [unit, setUnit] = useState('weeks');
  const [direction, setDirection] = useState('forward');
  const [error, setError] = useState<string | null>(null);

  const start = fixtures.find((f) => f.id === from);
  const affected = start ? fixtures.filter((f) => f.date >= start.date) : [];
  const days = (amount ?? 0) * (unit === 'weeks' ? 7 : 1) * (direction === 'forward' ? 1 : -1);

  const apply = () => {
    if (!start) return setError('Choose the first fixture to move.');
    if (!amount) return setError('Enter how far to move the fixtures.');
    const ids = new Set(affected.map((f) => f.id));
    s.update((db) => ({ ...db, fixtures: db.fixtures.map((f) => (ids.has(f.id) ? { ...f, date: addDays(f.date, days) } : f)) }));
    toast.success(`${affected.length} fixture${affected.length === 1 ? '' : 's'} moved`, { description: `${start.title} is now on ${fmtDate(addDays(start.date, days))}.` });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<CalendarClock />}
      title="Adjust fixtures"
      description="Move a block of fixtures at once, e.g. after a washed-out round."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" onClick={apply}>Adjust fixtures</Button>
        </>
      }
    >
      <Stack gap={4}>
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="From and including">
          <Select placeholder="Select a fixture" value={from} onValueChange={setFrom} options={fixtures.map((f) => ({ value: f.id, label: f.title, meta: fmtDate(f.date) }))} />
        </Field>
        <div className="fr-grid-2">
          <Field label="Amount"><NumberInput value={amount} onValueChange={setAmount} min={1} max={52} /></Field>
          <Field label="Unit">
            <Select value={unit} onValueChange={(v) => v && setUnit(v)} options={[{ value: 'days', label: 'Days' }, { value: 'weeks', label: 'Weeks' }]} />
          </Field>
        </div>
        <Field label="Direction">
          <SegmentedControl fullWidth value={direction} onValueChange={setDirection} options={[{ value: 'forward', label: 'Later' }, { value: 'back', label: 'Earlier' }]} />
        </Field>
        {start && amount ? (
          <Alert tone="info">
            {affected.length} fixture{affected.length === 1 ? '' : 's'} will move {Math.abs(days)} day{Math.abs(days) === 1 ? '' : 's'} {direction === 'forward' ? 'later' : 'earlier'}.
          </Alert>
        ) : null}
      </Stack>
    </Dialog>
  );
}
