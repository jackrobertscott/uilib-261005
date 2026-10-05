import { useState } from 'react';
import { CalendarPlus, CalendarX } from 'lucide-react';
import { Button, Card, Dialog, EmptyState, Field, Input, RadioGroup, Radio, Select, Stack, Switch, Text, toast } from '@ui';
import { uid, type GenderDivision, type Season } from './data';
import { useStore } from './store';
import { Logo } from './Logo';

/** Shown when no season exists. Admins can create one; everyone else is asked to come back later. */
export function SeasonSetup() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="fr-auth">
      <div className="fr-auth__inner">
        <Stack align="center" gap={3}>
          <Logo size={56} />
          <Text weight="semibold">Perth Ultimate League</Text>
        </Stack>
        <Card padding="lg" className="fr-auth__card">
          {s.isAdmin ? (
            <EmptyState
              icon={<CalendarPlus />}
              title="Start a new season"
              description="There’s no active season yet. Create one to open team registrations and start building fixtures."
              actions={<Button variant="primary" leading={<CalendarPlus />} onClick={() => setOpen(true)}>Create season</Button>}
            />
          ) : (
            <EmptyState
              icon={<CalendarX />}
              title="The season isn’t ready yet"
              description="Registrations haven’t opened. Check back soon — we’ll announce dates on the league socials."
              actions={!s.user && <Button onClick={() => s.setAuth('login')}>Admin log in</Button>}
            />
          )}
        </Card>
      </div>
      <SeasonCreateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

export function SeasonCreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const year = new Date().getFullYear();
  const [name, setName] = useState(`Summer League ${year + 1}`);
  const [division, setDivision] = useState<GenderDivision>('mixed');
  const [scoring, setScoring] = useState('official');
  const [signUp, setSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const create = () => {
    if (!name.trim()) return setError('Give the season a name.');
    const season: Season = { id: uid('ssn'), name: name.trim(), genderDivision: division, useOfficialScoring: scoring === 'official', signUpOpen: signUp, createdOn: new Date() };
    s.update((db) => ({ ...db, seasons: [season, ...db.seasons] }));
    s.setSeasonId(season.id);
    onOpenChange(false);
    toast.success(`${season.name} created`, { description: signUp ? 'Teams can now sign up.' : undefined });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="New season"
      description="Seasons hold their own teams, fixtures and reports."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" onClick={create}>Create season</Button>
        </>
      }
    >
      <Stack gap={4}>
        <Field label="Name" error={error}>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Division">
          <Select value={division} onValueChange={(v) => v && setDivision(v as GenderDivision)} options={[{ value: 'mixed', label: 'Mixed' }, { value: 'men', label: 'Men’s / Open' }, { value: 'women', label: 'Women’s' }]} />
        </Field>
        <Field label="Scoring system">
          <RadioGroup value={scoring} onValueChange={setScoring} variant="card">
            <Radio value="official" label="Official" description="Five spirit categories (0–4) and 1st/2nd MVP votes worth 5 and 3 points." />
            <Radio value="simple" label="Simple" description="One spirit score and a single MVP vote per gender." />
          </RadioGroup>
        </Field>
        <Switch checked={signUp} onCheckedChange={setSignUp} label="Open sign-ups" description="Teams and players can register straight away." labelPosition="start" />
      </Stack>
    </Dialog>
  );
}
