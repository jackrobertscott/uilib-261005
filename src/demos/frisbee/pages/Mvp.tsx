import { useMemo, useState } from 'react';
import { Award, Info } from 'lucide-react';
import { Alert, Card, CardHeader, DataTable, SegmentedControl, Text } from '@ui';
import { fullName } from '../data';
import { mvpTable, type MvpRow } from '../compute';
import { useStore } from '../store';
import { TeamName } from '../ui';

export function MvpPage() {
  const s = useStore();
  const official = s.season?.useOfficialScoring ?? true;
  const [division, setDivision] = useState('all');
  const divisions = [...new Set(s.teams.map((t) => t.division).filter((d) => d != null))].sort();
  const { male, female } = useMemo(() => mvpTable(s.db, s.teams, s.db.reports, official), [s.db, s.teams, official]);
  const filter = (rows: MvpRow[]) => (division === 'all' ? rows : rows.filter((r) => String(r.team?.division) === division));
  const gd = s.season?.genderDivision ?? 'mixed';

  return (
    <div className="fr-page">
      <div className="fr-toolbar">
        {official && (
          <Alert tone="info" icon={<Info />} className="fr-grow">
            1st place MVP vote = <b>5 points</b> · 2nd place = <b>3 points</b>
          </Alert>
        )}
        <SegmentedControl
          aria-label="Division"
          value={division}
          onValueChange={setDivision}
          options={[{ value: 'all', label: 'All divisions' }, ...divisions.map((d) => ({ value: String(d), label: `Div ${d}` }))]}
        />
      </div>
      <div className="fr-grid-2 fr-grid-2--wide">
        {gd !== 'women' && <MvpCard title="Male MVP" rows={filter(male)} />}
        {gd !== 'men' && <MvpCard title="Female MVP" rows={filter(female)} />}
      </div>
    </div>
  );
}

function MvpCard({ title, rows }: { title: string; rows: MvpRow[] }) {
  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  return (
    <Card>
      <CardHeader icon={<Award />} title={title} description={`${rows.length} players with votes`} divider />
      <DataTable
        bordered={false}
        density="compact"
        rowKey={(r) => r.user.id}
        rows={ranked}
        empty={<Text size="sm" tone="tertiary">No votes yet.</Text>}
        columns={[
          { key: 'rank', header: '#', width: 40, render: (r) => <Text as="span" size="sm" tone="tertiary">{r.rank}</Text> },
          { key: 'name', header: 'Player', sortable: true, sortValue: (r) => fullName(r.user), render: (r) => <Text as="span" size="sm" weight="medium">{fullName(r.user)}</Text> },
          { key: 'team', header: 'Team', sortable: true, sortValue: (r) => r.team?.name ?? '', hideBelow: 'sm', render: (r) => <TeamName team={r.team} /> },
          { key: 'div', header: 'Div', align: 'right', hideBelow: 'md', render: (r) => r.team?.division ?? '—' },
          { key: 'votes', header: 'Votes', align: 'right', sortable: true, hideBelow: 'md' },
          { key: 'points', header: 'Points', align: 'right', sortable: true, render: (r) => <b className="fr-num">{r.points}</b> },
        ]}
      />
    </Card>
  );
}
