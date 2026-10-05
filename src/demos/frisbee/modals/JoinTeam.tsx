import { useState } from 'react';
import { Hourglass, Plus, Users } from 'lucide-react';
import { Alert, Button, Dialog, EmptyState, SearchInput, Stack, Text, toast } from '@ui';
import { uid } from '../data';
import { useStore } from '../store';
import { TeamName } from '../ui';
import { TeamCreateDialog } from './TeamDialog';

/** For signed-in players without a team: request to join one, or start a new team. */
export function JoinTeamDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const pending = s.membership?.pending ? s.teamById(s.membership.teamId) : null;
  const teams = s.teams.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));
  const count = (id: string) => s.db.members.filter((m) => m.teamId === id && !m.pending).length;

  const request = (teamId: string) => {
    s.update((db) => ({ ...db, members: [...db.members, { id: uid('mbr'), teamId, userId: s.user!.id, pending: true }] }));
    toast.success('Request sent', { description: `The ${s.teamById(teamId)?.name} captain will review it.` });
  };
  const cancel = () => {
    s.update((db) => ({ ...db, members: db.members.filter((m) => m.id !== s.membership?.id) }));
    toast('Request cancelled');
  };

  return (
    <>
      <Dialog
        open={open && !creating}
        onOpenChange={onOpenChange}
        icon={<Users />}
        title="Join a team"
        description={`Find your team in ${s.season?.name}. Your captain approves requests.`}
        footer={
          s.season?.signUpOpen ? (
            <Button leading={<Plus />} onClick={() => setCreating(true)} disabled={!!pending}>Create a new team</Button>
          ) : (
            <Text size="xs" tone="tertiary">Team sign-ups are closed for this season.</Text>
          )
        }
      >
        {pending ? (
          <Stack gap={4}>
            <EmptyState icon={<Hourglass />} title="Request pending" description={<>Waiting for the <b>{pending.name}</b> captain to approve you. You’ll be able to report scores once you’re in.</>} />
            <Button variant="ghost" onClick={cancel} style={{ alignSelf: 'center' }}>Cancel request</Button>
          </Stack>
        ) : (
          <Stack gap={3}>
            <SearchInput placeholder="Search teams" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} autoFocus />
            {teams.length === 0 ? (
              <Alert>No teams match “{query}”.</Alert>
            ) : (
              <ul className="fr-pick-list">
                {teams.map((t) => (
                  <li key={t.id}>
                    <TeamName team={t} size="md" />
                    <Text as="span" size="xs" tone="tertiary">{count(t.id)} players{t.division ? ` · Div ${t.division}` : ''}</Text>
                    <Button size="xs" onClick={() => request(t.id)}>Request to join</Button>
                  </li>
                ))}
              </ul>
            )}
          </Stack>
        )}
      </Dialog>
      <TeamCreateDialog
        open={creating}
        asCaptain
        onOpenChange={(o) => {
          setCreating(o);
          if (!o) onOpenChange(false);
        }}
      />
    </>
  );
}
