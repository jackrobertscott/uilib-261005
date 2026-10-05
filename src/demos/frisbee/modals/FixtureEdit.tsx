import { useEffect, useState } from 'react';
import { ArrowLeftRight, Plus, Trash2, X } from 'lucide-react';
import { Alert, Button, ConfirmDialog, DatePicker, Dialog, Field, IconButton, Input, Select, Stack, Switch, Text, Tooltip, toast } from '@ui';
import { SLOTS, addDays, uid, type Fixture, type Game } from '../data';
import { useStore } from '../store';
import { teamOptions } from '../ui';

/** Add or edit a single fixture: title, date, games (teams, time, place) and grading flag. */
export function FixtureEditDialog({ fixture, onClose }: { fixture: Fixture | 'new' | null; onClose: () => void }) {
  const s = useStore();
  const isNew = fixture === 'new';
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!fixture) return;
    setError(null);
    if (fixture === 'new') {
      const existing = s.db.fixtures.filter((f) => f.seasonId === s.season?.id);
      const last = existing.reduce<Date | null>((d, f) => (!d || f.date > d ? f.date : d), null);
      setTitle(`Round ${existing.length + 1}`);
      setDate(last ? addDays(last, 7) : new Date());
      setGames([{ id: uid('gm'), team1Id: '', team2Id: '', ...SLOTS[0] }]);
      setGrading(false);
    } else {
      setTitle(fixture.title);
      setDate(fixture.date);
      setGames(fixture.games.map((g) => ({ ...g })));
      setGrading(!!fixture.grading);
    }
  }, [fixture, s.db.fixtures, s.season]);

  const patch = (i: number, p: Partial<Game>) => setGames((gs) => gs.map((g, j) => (j === i ? { ...g, ...p } : g)));
  const options = teamOptions(s.teams);

  // Teams appearing more than once in this fixture.
  const counts = new Map<string, number>();
  games.forEach((g) => [g.team1Id, g.team2Id].forEach((id) => id && counts.set(id, (counts.get(id) ?? 0) + 1)));
  const doubled = [...counts.entries()].filter(([, n]) => n > 1).map(([id]) => s.teamById(id)?.name);

  const save = () => {
    if (!title.trim() || !date) return setError('A fixture needs a title and a date.');
    if (games.some((g) => !g.team1Id || !g.team2Id)) return setError('Pick both teams for every game, or remove empty rows.');
    if (games.some((g) => g.team1Id === g.team2Id)) return setError('A team can’t play itself.');
    const next: Fixture = { ...(isNew ? { id: uid('fx'), seasonId: s.season!.id } : (fixture as Fixture)), title: title.trim(), date, games, grading };
    s.update((db) => ({ ...db, fixtures: isNew ? [...db.fixtures, next] : db.fixtures.map((f) => (f.id === next.id ? next : f)) }));
    toast.success(isNew ? `${next.title} added` : `${next.title} saved`);
    onClose();
  };

  const remove = () => {
    const f = fixture as Fixture;
    s.update((db) => ({ ...db, fixtures: db.fixtures.filter((x) => x.id !== f.id), reports: db.reports.filter((r) => r.fixtureId !== f.id) }));
    toast(`${f.title} deleted`);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={!!fixture}
        onOpenChange={(o) => !o && onClose()}
        size="xl"
        title={isNew ? 'Add fixture' : 'Edit fixture'}
        footer={
          <>
            {!isNew && (
              <Button variant="danger" leading={<Trash2 />} onClick={() => setConfirmDelete(true)} className="fr-footer-left">
                Delete
              </Button>
            )}
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={save}>{isNew ? 'Add fixture' : 'Save changes'}</Button>
          </>
        }
      >
        <Stack gap={5}>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="fr-grid-2">
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Date"><DatePicker value={date} onValueChange={setDate} /></Field>
          </div>

          <Stack gap={2}>
            <Text size="sm" weight="medium">Games</Text>
            <div className="fr-games" role="list">
              <div className="fr-games__head" aria-hidden>
                <span>Team 1</span>
                <span />
                <span>Team 2</span>
                <span>Time</span>
                <span>Place</span>
                <span />
              </div>
              {games.map((g, i) => (
                <div key={g.id} className="fr-games__row" role="listitem">
                  <Select aria-label={`Game ${i + 1} team 1`} placeholder="Team 1" searchable options={options} value={g.team1Id || null} onValueChange={(v) => patch(i, { team1Id: v ?? '' })} invalid={!!g.team1Id && counts.get(g.team1Id)! > 1} />
                  <Tooltip content="Swap teams">
                    <IconButton size="sm" variant="ghost" aria-label={`Swap teams in game ${i + 1}`} onClick={() => patch(i, { team1Id: g.team2Id, team2Id: g.team1Id, team1Score: g.team2Score, team2Score: g.team1Score })}>
                      <ArrowLeftRight />
                    </IconButton>
                  </Tooltip>
                  <Select aria-label={`Game ${i + 1} team 2`} placeholder="Team 2" searchable options={options} value={g.team2Id || null} onValueChange={(v) => patch(i, { team2Id: v ?? '' })} invalid={!!g.team2Id && counts.get(g.team2Id)! > 1} />
                  <Input aria-label={`Game ${i + 1} time`} value={g.time} onChange={(e) => patch(i, { time: e.target.value })} placeholder="6:00pm" />
                  <Input aria-label={`Game ${i + 1} place`} value={g.place} onChange={(e) => patch(i, { place: e.target.value })} placeholder="Field 1" />
                  <Tooltip content="Remove game">
                    <IconButton size="sm" variant="ghost" aria-label={`Remove game ${i + 1}`} onClick={() => setGames((gs) => gs.filter((_, j) => j !== i))}>
                      <X />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
            {doubled.length > 0 && <Text size="xs" tone="danger">Playing twice: {doubled.join(', ')}</Text>}
            <Button
              variant="ghost"
              size="sm"
              leading={<Plus />}
              style={{ alignSelf: 'flex-start' }}
              onClick={() => setGames((gs) => [...gs, { id: uid('gm'), team1Id: '', team2Id: '', ...SLOTS[gs.length % SLOTS.length] }])}
            >
              Add game
            </Button>
          </Stack>

          <Switch checked={grading} onCheckedChange={setGrading} label="Grading round" description="Results from this fixture won’t count towards the ladder." labelPosition="start" />
        </Stack>
      </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        tone="danger"
        icon={<Trash2 />}
        title="Delete this fixture?"
        description="Its games and any score reports filed against it will be removed. This can’t be undone."
        confirmLabel="Delete fixture"
        confirmVariant="danger"
        onConfirm={remove}
      />
    </>
  );
}
