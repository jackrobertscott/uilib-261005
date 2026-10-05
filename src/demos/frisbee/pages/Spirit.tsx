import { useMemo } from 'react';
import { HeartHandshake } from 'lucide-react';
import { Badge, Card, CardHeader, DataTable, Text, Tooltip } from '@ui';
import { spiritTable, type SpiritRow } from '../compute';
import { useStore } from '../store';
import { TeamName } from '../ui';

/** Difference between what a team gives and what it gets; ±1 is notable. */
function Diff({ value }: { value: number }) {
  if (Math.abs(value) < 1) return <span className="fr-num">{value}</span>;
  const tone = value > 0 ? 'success' : 'info';
  return (
    <Tooltip content={value > 0 ? 'Scores opponents higher than it is scored' : 'Is scored higher than it scores opponents'}>
      <span tabIndex={0}>
        <Badge size="sm" tone={tone}>{value > 0 ? '+' : ''}{value}</Badge>
      </span>
    </Tooltip>
  );
}

export function SpiritPage() {
  const s = useStore();
  const official = s.season?.useOfficialScoring ?? true;
  const rows = useMemo(() => spiritTable(s.teams, s.db.reports, official), [s.teams, s.db.reports, official]);

  return (
    <div className="fr-page">
      <Card>
        <CardHeader icon={<HeartHandshake />} title="Team spirit scores" description={official ? 'Official scoring · five categories, 0–20 per game' : 'Simple scoring · 0–4 per game'} divider />
        <DataTable<SpiritRow>
          bordered={false}
          density="compact"
          rowKey={(r) => r.team.id}
          rows={rows}
          defaultSort={{ key: 'gotAdj', direction: 'desc' }}
          columns={[
            { key: 'team', header: 'Team', sortable: true, sortValue: (r) => r.team.name, render: (r) => <TeamName team={r.team} /> },
            { key: 'div', header: 'Div', sortable: true, sortValue: (r) => r.team.division ?? 99, render: (r) => r.team.division ?? '—', hideBelow: 'sm' },
            { key: 'gotPoints', header: 'Pts got', align: 'right', sortable: true, hideBelow: 'lg' },
            { key: 'gotReports', header: 'Rpts got', align: 'right', sortable: true, hideBelow: 'lg' },
            { key: 'gotAvg', header: 'Avg got', align: 'right', sortable: true },
            { key: 'gotAdj', header: 'Adj got', align: 'right', sortable: true, render: (r) => <b className="fr-num">{r.gotAdj}</b> },
            { key: 'sentPoints', header: 'Pts sent', align: 'right', sortable: true, hideBelow: 'lg' },
            { key: 'sentReports', header: 'Rpts sent', align: 'right', sortable: true, hideBelow: 'lg' },
            { key: 'sentAvg', header: 'Avg sent', align: 'right', sortable: true, hideBelow: 'md' },
            { key: 'sentAdj', header: 'Adj sent', align: 'right', sortable: true, hideBelow: 'md' },
            { key: 'diff', header: 'Avg diff', align: 'right', sortable: true, render: (r) => <Diff value={r.diff} /> },
            { key: 'adjDiff', header: 'Adj diff', align: 'right', sortable: true, hideBelow: 'sm', render: (r) => <Diff value={r.adjDiff} /> },
          ]}
        />
        <div className="fr-card-foot">
          <Text size="xs" tone="tertiary">
            <b>Adjusted</b> scores correct for how generous or harsh the other team usually scores. <b>Diff</b> is sent minus received — highlighted when it’s a point or more either way.
          </Text>
        </div>
      </Card>
    </div>
  );
}
