import { CircleCheck, ClipboardList, Send } from 'lucide-react';
import { Badge, Button, Dialog, EmptyState, IconButton, Stack, Text, Tooltip, toast } from '@ui';
import { TODAY } from '../data';
import { isPlayed, missingReports } from '../compute';
import { useStore } from '../store';
import { TeamName, fmtDate } from '../ui';

/** Played fixtures with teams that haven’t filed a score report, with a reminder action. */
export function MissingReportsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const fixtures = s.db.fixtures
    .filter((f) => f.seasonId === s.season?.id && isPlayed(f, TODAY))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((f) => ({ fixture: f, teams: missingReports(f, s.db.reports) }))
    .filter((x) => x.teams.length);
  const total = fixtures.reduce((n, x) => n + x.teams.length, 0);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<ClipboardList />}
      title="Missing reports"
      description={total ? `${total} report${total === 1 ? '' : 's'} outstanding across ${fixtures.length} fixture${fixtures.length === 1 ? '' : 's'}.` : undefined}
      size="lg"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
          {total > 0 && (
            <Button variant="primary" leading={<Send />} onClick={() => toast.success(`Reminders sent to ${new Set(fixtures.flatMap((x) => x.teams)).size} captains`)}>
              Remind all captains
            </Button>
          )}
        </>
      }
    >
      {total === 0 ? (
        <EmptyState icon={<CircleCheck />} title="All caught up" description="Every team has reported for every played fixture." />
      ) : (
        <Stack gap={4}>
          {fixtures.map(({ fixture, teams }) => (
            <Stack key={fixture.id} gap={1}>
              <Stack direction="row" gap={2} align="center">
                <Text size="sm" weight="medium">{fixture.title}</Text>
                <Text size="xs" tone="tertiary">{fmtDate(fixture.date)}</Text>
                <Badge size="sm" tone="warning">{teams.length}</Badge>
              </Stack>
              <ul className="fr-list">
                {teams.map((id) => (
                  <li key={id}>
                    <TeamName team={s.teamById(id)} />
                    <Tooltip content="Send reminder">
                      <IconButton size="xs" variant="ghost" aria-label={`Remind ${s.teamById(id)?.name}`} onClick={() => toast(`Reminder sent to ${s.teamById(id)?.name}`)}>
                        <Send />
                      </IconButton>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </Stack>
          ))}
        </Stack>
      )}
    </Dialog>
  );
}
