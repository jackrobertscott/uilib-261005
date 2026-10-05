import { useEffect, useState } from 'react';
import { Plus, WandSparkles, X } from 'lucide-react';
import { Alert, Button, DatePicker, Dialog, Field, IconButton, Input, NumberInput, Stack, Text, toast } from '@ui';
import { SLOTS, addDays, roundRobin, uid, type Fixture } from '../data';
import { byDivision } from '../compute';
import { useStore } from '../store';

/**
 * Magic generate: continues a round robin within each division for N rounds,
 * filling the configured time/place slots in order.
 */
export function FixtureGenerateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const existing = s.db.fixtures.filter((f) => f.seasonId === s.season?.id);
  const lastDate = existing.reduce<Date | null>((d, f) => (!d || f.date > d ? f.date : d), null);
  const [rounds, setRounds] = useState<number | null>(4);
  const [start, setStart] = useState<Date | null>(null);
  const [slots, setSlots] = useState(SLOTS.map((x) => ({ ...x })));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStart(lastDate ? addDays(lastDate, 7) : new Date());
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const missingDivision = s.teams.filter((t) => t.division == null);
  const divisions = byDivision(s.teams).filter(([d]) => d !== 'none');
  const perRound = divisions.reduce((n, [, ts]) => n + Math.floor(ts.length / 2), 0);

  const generate = () => {
    if (missingDivision.length) return setError('Assign every team to a division first.');
    if (!rounds || rounds < 1) return setError('Enter how many rounds to generate.');
    if (!start) return setError('Pick the date of the first round.');
    if (slots.some((x) => !x.time.trim() || !x.place.trim())) return setError('Fill in or remove empty slots.');
    if (slots.length < perRound) return setError(`Each round has ${perRound} games — add at least ${perRound} slots.`);

    const created: Fixture[] = [];
    for (let r = 0; r < rounds; r++) {
      const n = existing.length + r;
      const games = divisions.flatMap(([, ts]) => roundRobin(ts.length, 1, n)[0].map(([a, b]) => [ts[a].id, ts[b].id] as const));
      created.push({
        id: uid('fx'),
        seasonId: s.season!.id,
        title: `Round ${n + 1}`,
        date: addDays(start, r * 7),
        games: games.map(([a, b], i) => ({ id: uid('gm'), team1Id: a, team2Id: b, ...slots[i % slots.length] })),
      });
    }
    s.update((db) => ({ ...db, fixtures: [...db.fixtures, ...created] }));
    toast.success(`${rounds} rounds generated`, { description: `${created.length * perRound} games scheduled from ${created[0].title}.` });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<WandSparkles />}
      title="Generate fixtures"
      description="Continues from the existing rounds and keeps the round robin pattern within each division."
      size="lg"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" leading={<WandSparkles />} onClick={generate}>Generate</Button>
        </>
      }
    >
      <Stack gap={5}>
        {missingDivision.length > 0 ? (
          <Alert tone="warning" title="Some teams don’t have a division">
            {missingDivision.map((t) => t.name).join(', ')} — set a division under Teams before generating.
          </Alert>
        ) : (
          <Alert tone="info">
            {divisions.length} division{divisions.length === 1 ? '' : 's'} · {s.teams.length} teams · {perRound} games per round
          </Alert>
        )}
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="fr-grid-2">
          <Field label="Number of rounds"><NumberInput value={rounds} onValueChange={setRounds} min={1} max={30} /></Field>
          <Field label="First round on"><DatePicker value={start} onValueChange={setStart} /></Field>
        </div>
        <Stack gap={2}>
          <Text size="sm" weight="medium">Slots</Text>
          <Text size="xs" tone="tertiary">Games are placed into these slots in order each round.</Text>
          {slots.map((slot, i) => (
            <div key={i} className="fr-slot">
              <Input aria-label={`Slot ${i + 1} time`} value={slot.time} placeholder="Time" onChange={(e) => setSlots((xs) => xs.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} />
              <Input aria-label={`Slot ${i + 1} place`} value={slot.place} placeholder="Place" onChange={(e) => setSlots((xs) => xs.map((x, j) => (j === i ? { ...x, place: e.target.value } : x)))} />
              <IconButton size="sm" variant="ghost" aria-label={`Remove slot ${i + 1}`} onClick={() => setSlots((xs) => xs.filter((_, j) => j !== i))}>
                <X />
              </IconButton>
            </div>
          ))}
          <Button variant="ghost" size="sm" leading={<Plus />} style={{ alignSelf: 'flex-start' }} onClick={() => setSlots((xs) => [...xs, { time: '', place: '' }])}>
            Add slot
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
