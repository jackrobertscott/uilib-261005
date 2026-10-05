import { useMemo, useState } from 'react';
import { Check, ClipboardList, FileText, Minus, Plus } from 'lucide-react';
import { Button, DataTable, EmptyState, Text, Tooltip, type SortState } from '@ui';
import { fullName, type Report } from '../data';
import { reportSpirit } from '../compute';
import { useStore } from '../store';
import { TeamName, Toolbar, fmtShort, sortRows, usePaged } from '../ui';
import { ReportDialog } from '../modals/ReportDialog';
import { MissingReportsDialog } from '../modals/MissingReports';

export function ReportsPage() {
  const s = useStore();
  const official = s.season?.useOfficialScoring ?? true;
  const fixtureById = useMemo(() => new Map(s.db.fixtures.map((f) => [f.id, f])), [s.db.fixtures]);
  const teamIds = useMemo(() => new Set(s.teams.map((t) => t.id)), [s.teams]);
  const [sort, setSort] = useState<SortState | null>({ key: 'created', direction: 'desc' });
  const [editing, setEditing] = useState<Report | null>(null);
  const [creating, setCreating] = useState(false);
  const [missing, setMissing] = useState(false);

  const all = useMemo(() => {
    const rows = s.db.reports.filter((r) => teamIds.has(r.teamId));
    return sortRows(rows, sort, {
      fixture: (r) => fixtureById.get(r.fixtureId)?.date,
      by: (r) => s.teamById(r.teamId)?.name,
      against: (r) => s.teamById(r.teamAgainstId)?.name,
      spirit: (r) => reportSpirit(r, official),
      created: (r) => r.createdOn,
      submitter: (r) => fullName(s.userById(r.userId)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.db.reports, teamIds, sort, official]);

  const paged = usePaged(all, {
    search: (r) => [fixtureById.get(r.fixtureId)?.title, s.teamById(r.teamId)?.name, s.teamById(r.teamAgainstId)?.name, r.spiritComment, fullName(s.userById(r.userId))].join(' '),
  });

  const mvpCount = (r: Report) => [r.mvpMale, r.mvpFemale, ...(official ? [r.mvpMale2, r.mvpFemale2] : [])];

  return (
    <div className="fr-page">
      <Toolbar search={paged.query} onSearch={paged.setQuery} placeholder="Search reports">
        <Button leading={<ClipboardList />} onClick={() => setMissing(true)}>Missing reports</Button>
        <Button variant="primary" leading={<Plus />} onClick={() => setCreating(true)}>Create report</Button>
      </Toolbar>

      <DataTable<Report>
        aria-label="Score reports"
        rowKey={(r) => r.id}
        rows={paged.rows}
        sort={sort}
        onSortChange={setSort}
        sortRows={false}
        onRowClick={setEditing}
        empty={<EmptyState icon={<FileText />} title={paged.query ? 'No matching reports' : 'No reports yet'} description={paged.query ? 'Try a team, round or player name.' : 'Reports appear here as teams submit their scores.'} />}
        columns={[
          { key: 'fixture', header: 'Fixture', sortable: true, render: (r) => <span className="fr-nowrap">{fixtureById.get(r.fixtureId)?.title.replace(' (Grading)', '')}</span> },
          { key: 'by', header: 'By', sortable: true, render: (r) => <TeamName team={s.teamById(r.teamId)} /> },
          { key: 'against', header: 'Against', sortable: true, render: (r) => <TeamName team={s.teamById(r.teamAgainstId)} /> },
          { key: 'score', header: 'Score', align: 'center', render: (r) => <span className="fr-num">{r.scoreFor}–{r.scoreAgainst}</span> },
          { key: 'spirit', header: 'Spirit', align: 'right', sortable: true, render: (r) => <span className="fr-num">{reportSpirit(r, official)}</span> },
          {
            key: 'mvps',
            header: 'MVPs',
            align: 'center',
            hideBelow: 'sm',
            render: (r) => {
              const v = mvpCount(r);
              const done = v.filter(Boolean).length;
              return (
                <Tooltip content={`${done} of ${v.length} MVP votes`}>
                  <span className="fr-mvp-check" data-done={done === v.length || undefined} tabIndex={0} aria-label={`${done} of ${v.length} MVP votes`}>
                    {done === v.length ? <Check /> : <Minus />}
                  </span>
                </Tooltip>
              );
            },
          },
          { key: 'comment', header: 'Comment', hideBelow: 'lg', render: (r) => (r.spiritComment ? <Text as="span" size="sm" tone="secondary" truncate className="fr-comment">{r.spiritComment}</Text> : <Text as="span" size="sm" tone="tertiary">—</Text>) },
          { key: 'submitter', header: 'Submitted by', sortable: true, hideBelow: 'md', render: (r) => <span className="fr-nowrap">{fullName(s.userById(r.userId))}</span> },
          { key: 'created', header: 'Created', sortable: true, hideBelow: 'md', render: (r) => <span className="fr-num">{fmtShort(r.createdOn)}</span> },
        ]}
      />
      {paged.pager}

      <ReportDialog open={creating || !!editing} report={editing} onOpenChange={(o) => !o && (setEditing(null), setCreating(false))} />
      <MissingReportsDialog open={missing} onOpenChange={setMissing} />
    </div>
  );
}
