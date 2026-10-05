import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Badge, Button, DataTable, Dialog, NumberInput, Stack, Text, Tooltip, toast } from '@ui';
import type { Game, Report } from '../data';
import { missingReports } from '../compute';
import { useStore } from '../store';
import { TeamName, fmtDate, initials } from '../ui';

/** Record a fixture's official results, side by side with the score reports teams submitted. */
export function TallyDialog({ fixtureId, onClose }: { fixtureId: string | null; onClose: () => void }) {
  const s = useStore();
  const fixture = s.db.fixtures.find((f) => f.id === fixtureId);
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => setGames(fixture?.games.map((g) => ({ ...g })) ?? []), [fixture]);

  const reports = s.db.reports.filter((r) => r.fixtureId === fixtureId);
  const missing = fixture ? missingReports(fixture, s.db.reports) : [];
  const patch = (i: number, p: Partial<Game>) => setGames((gs) => gs.map((g, j) => (j === i ? { ...g, ...p } : g)));

  /** Fill empty results from reports where both teams agree. */
  const fillFromReports = () => {
    let filled = 0;
    setGames((gs) =>
      gs.map((g) => {
        const r = reports.find((x) => x.teamId === g.team1Id && x.teamAgainstId === g.team2Id) ?? reports.find((x) => x.teamId === g.team2Id && x.teamAgainstId === g.team1Id);
        if (!r || g.team1Score != null) return g;
        filled++;
        return r.teamId === g.team1Id ? { ...g, team1Score: r.scoreFor, team2Score: r.scoreAgainst } : { ...g, team1Score: r.scoreAgainst, team2Score: r.scoreFor };
      }),
    );
    setTimeout(() => toast(filled ? `Filled ${filled} result${filled === 1 ? '' : 's'} from reports` : 'Nothing to fill — every game already has a result'));
  };

  const save = () => {
    s.update((db) => ({ ...db, fixtures: db.fixtures.map((f) => (f.id === fixtureId ? { ...f, games } : f)) }));
    toast.success(`${fixture?.title} results saved`, { description: 'The ladder has been updated.' });
    onClose();
  };

  const disagrees = (r: Report) => {
    const g = games.find((x) => (x.team1Id === r.teamId && x.team2Id === r.teamAgainstId) || (x.team2Id === r.teamId && x.team1Id === r.teamAgainstId));
    if (!g || g.team1Score == null || g.team2Score == null) return false;
    const [f, a] = g.team1Id === r.teamId ? [g.team1Score, g.team2Score] : [g.team2Score, g.team1Score];
    return f !== r.scoreFor || a !== r.scoreAgainst;
  };

  return (
    <Dialog
      open={!!fixture}
      onOpenChange={(o) => !o && onClose()}
      size="xl"
      title={fixture ? `${fixture.title} results` : ''}
      description={fixture && fmtDate(fixture.date)}
      footer={
        <>
          <Button variant="ghost" onClick={fillFromReports} className="fr-footer-left">Fill from reports</Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save results</Button>
        </>
      }
    >
      <div className="fr-tally">
        <Stack gap={2}>
          <Text size="sm" weight="medium">Results</Text>
          <div className="fr-tally__games">
            {games.map((g, i) => (
              <div key={g.id} className="fr-tally__game">
                <TeamName team={s.teamById(g.team1Id)} />
                <NumberInput aria-label={`${s.teamById(g.team1Id)?.name} score`} variant="inline" size="sm" min={0} max={30} value={g.team1Score ?? null} onValueChange={(v) => patch(i, { team1Score: v ?? undefined })} />
                <NumberInput aria-label={`${s.teamById(g.team2Id)?.name} score`} variant="inline" size="sm" min={0} max={30} value={g.team2Score ?? null} onValueChange={(v) => patch(i, { team2Score: v ?? undefined })} />
                <TeamName team={s.teamById(g.team2Id)} />
              </div>
            ))}
          </div>
        </Stack>
        <Stack gap={4}>
          <Stack gap={2}>
            <Text size="sm" weight="medium">Submitted reports <Text as="span" size="sm" tone="tertiary">· {reports.length}</Text></Text>
            <DataTable<Report>
              density="compact"
              rowKey={(r) => r.id}
              rows={reports}
              empty={<Text size="sm" tone="tertiary">No reports yet.</Text>}
              columns={[
                { key: 'by', header: 'By', render: (r) => <TeamName team={s.teamById(r.teamId)} short /> },
                {
                  key: 'score',
                  header: 'Score',
                  render: (r) => (
                    <Stack direction="row" gap={1.5} align="center">
                      <span className="fr-num">{r.scoreFor}–{r.scoreAgainst}</span>
                      {disagrees(r) && (
                        <Tooltip content="Doesn’t match the recorded result">
                          <span className="fr-warn" tabIndex={0} aria-label="Doesn’t match the recorded result"><TriangleAlert /></span>
                        </Tooltip>
                      )}
                    </Stack>
                  ),
                },
                { key: 'against', header: 'Against', render: (r) => <TeamName team={s.teamById(r.teamAgainstId)} short /> },
              ]}
            />
          </Stack>
          <Stack gap={2}>
            <Text size="sm" weight="medium">Missing reports</Text>
            {missing.length ? (
              <div className="fr-chips">
                {missing.map((id) => (
                  <Badge key={id} variant="outline" tone="warning">
                    {initials(s.teamById(id)?.name ?? '')} · {s.teamById(id)?.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <Text size="sm" tone="tertiary">Every team has reported.</Text>
            )}
          </Stack>
        </Stack>
      </div>
    </Dialog>
  );
}
