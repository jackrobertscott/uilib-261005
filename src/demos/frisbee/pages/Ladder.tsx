import { useMemo, useState } from 'react';
import { ClipboardList, Flag, ListOrdered, Medal, Pencil, Trophy } from 'lucide-react';
import { BarChart, Button, Card, CardBody, CardHeader, DataTable, EmptyState, Select, Stack, Text } from '@ui';
import { TODAY } from '../data';
import { byDivision, isPlayed, ladder, missingReports, scoreDistribution, type LadderRow } from '../compute';
import { useStore } from '../store';
import { FixtureRow, TeamName, fmtDate, teamOptions } from '../ui';
import { GamesTable } from './Fixtures';
import { FinalResultsDialog } from '../modals/FinalResults';
import { TallyDialog } from '../modals/Tally';
import { MissingReportsDialog } from '../modals/MissingReports';

export function LadderPage() {
  const s = useStore();
  const fixtures = useMemo(() => s.db.fixtures.filter((f) => f.seasonId === s.season?.id).sort((a, b) => a.date.getTime() - b.date.getTime()), [s.db.fixtures, s.season]);
  const rows = useMemo(() => ladder(s.teams, fixtures), [s.teams, fixtures]);
  const divisions = byDivision(rows, (r) => r.team.division);
  const played = fixtures.filter((f) => isPlayed(f, TODAY));
  const [open, setOpen] = useState<string[]>([]);
  const [tally, setTally] = useState<string | null>(null);
  const [finals, setFinals] = useState(false);
  const [missing, setMissing] = useState(false);
  const [chartTeam, setChartTeam] = useState<string | null>(null);
  const missingCount = played.reduce((n, f) => n + missingReports(f, s.db.reports).length, 0);

  if (!s.teams.length) {
    return (
      <div className="fr-page">
        <EmptyState bordered icon={<ListOrdered />} title="No ladder yet" description="The ladder appears once teams have registered and the first results are in." />
      </div>
    );
  }

  return (
    <div className="fr-page">
      {s.isAdmin && (
        <div className="fr-actions">
          <Button leading={<Trophy />} onClick={() => setFinals(true)}>Edit final results</Button>
          <Button leading={<ClipboardList />} onClick={() => setMissing(true)} trailing={missingCount ? <span className="fr-count">{missingCount}</span> : undefined}>
            Missing reports
          </Button>
        </div>
      )}

      {s.season?.finalResults && <FinalResults results={s.season.finalResults} />}

      {divisions.map(([div, list]) => (
        <Card key={div}>
          <CardHeader icon={<Flag />} title={div === 'none' ? 'No division' : `Division ${div}`} description={`${list.length} teams · win 4, draw 2, loss 0`} divider />
          <LadderTable rows={list} />
        </Card>
      ))}

      <Stack gap={2}>
        <Text as="h2" size="sm" weight="semibold" className="fr-subhead">Results by round</Text>
        {fixtures.map((f) => (
          <FixtureRow
            key={f.id}
            open={open.includes(f.id)}
            onToggle={() => setOpen((o) => (o.includes(f.id) ? o.filter((x) => x !== f.id) : [...o, f.id]))}
            title={f.title}
            meta={fmtDate(f.date)}
            action={
              s.isAdmin && (
                <Button size="sm" variant="ghost" leading={<Pencil />} onClick={() => setTally(f.id)}>
                  Edit results
                </Button>
              )
            }
          >
            <GamesTable fixture={f} />
          </FixtureRow>
        ))}
      </Stack>

      <Card>
        <CardHeader
          title="Score distribution"
          description={chartTeam ? `Points scored per game by ${s.teamById(chartTeam)?.name}` : 'How often each points total occurs across all games'}
          actions={<Select size="sm" aria-label="Team" placeholder="All teams" clearable searchable value={chartTeam} onValueChange={setChartTeam} options={teamOptions(s.teams)} className="fr-chart-filter" popupWidth={220} />}
        />
        <CardBody>
          <BarChart
            aria-label="Occurrences of each points total"
            data={scoreDistribution(fixtures, chartTeam).map((d) => ({ label: String(d.points), values: { games: d.count } }))}
            series={[{ key: 'games', label: 'Games', color: chartTeam ? s.teamById(chartTeam)?.color : undefined }]}
            xLabel="Points scored"
            yLabel="Occurrences"
            height={220}
          />
        </CardBody>
      </Card>

      <FinalResultsDialog open={finals} onOpenChange={setFinals} rows={rows} />
      <TallyDialog fixtureId={tally} onClose={() => setTally(null)} />
      <MissingReportsDialog open={missing} onOpenChange={setMissing} />
    </div>
  );
}

function LadderTable({ rows }: { rows: LadderRow[] }) {
  const s = useStore();
  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  return (
    <DataTable
      bordered={false}
      density="compact"
      rowKey={(r) => r.team.id}
      rows={ranked}
      defaultSort={null}
      columns={[
        { key: 'rank', header: '#', width: 44, sortable: true, render: (r) => <Text as="span" size="sm" tone="tertiary">{r.rank}</Text> },
        { key: 'team', header: 'Team', sortable: true, sortValue: (r) => r.team.name, render: (r) => <span className={r.team.id === s.myTeam?.id ? 'fr-mine' : undefined}><TeamName team={r.team} /></span> },
        { key: 'games', header: 'P', align: 'right', sortable: true },
        { key: 'points', header: 'Pts', align: 'right', sortable: true, render: (r) => <b>{r.points}</b> },
        { key: 'wins', header: 'W', align: 'right', sortable: true },
        { key: 'losses', header: 'L', align: 'right', sortable: true },
        { key: 'draws', header: 'D', align: 'right', sortable: true, hideBelow: 'sm' },
        { key: 'ratio', header: 'Ratio', align: 'right', sortable: true, render: (r) => `${r.ratio}%` },
        { key: 'for', header: 'For', align: 'right', sortable: true, hideBelow: 'md' },
        { key: 'against', header: 'Agst', align: 'right', sortable: true, hideBelow: 'md' },
        { key: 'avgFor', header: 'Avg for', align: 'right', sortable: true, hideBelow: 'lg' },
        { key: 'avgAgainst', header: 'Avg agst', align: 'right', sortable: true, hideBelow: 'lg' },
      ]}
    />
  );
}

function FinalResults({ results }: { results: Record<string, string[]> }) {
  const s = useStore();
  const entries = Object.entries(results).sort(([a], [b]) => (a === 'none' ? 1 : b === 'none' ? -1 : Number(a) - Number(b)));
  return (
    <Card>
      <CardHeader icon={<Trophy />} title="Final results" description={`${s.season?.name} — after finals`} divider />
      <div className="fr-finals">
        {entries.map(([div, ids]) => (
          <div key={div} className="fr-finals__div">
            <Text size="xs" weight="medium" tone="tertiary" className="fr-eyebrow">{div === 'none' ? 'No division' : `Division ${div}`}</Text>
            <ol className="fr-finals__list">
              {ids.map((id, i) => (
                <li key={id} data-place={i + 1}>
                  <span className="fr-finals__place">{i === 0 ? <Trophy /> : i < 3 ? <Medal /> : i + 1}</span>
                  <TeamName team={s.teamById(id)} />
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Card>
  );
}
