import { useMemo, useState } from 'react';
import { CalendarClock, CalendarPlus, Megaphone, Pencil, Plus, Share2, WandSparkles } from 'lucide-react';
import { Badge, Button, DataTable, EmptyState, IconButton, Stack, Text, Tooltip } from '@ui';
import { TODAY, type Fixture, type Game } from '../data';
import { isPlayed } from '../compute';
import { useStore } from '../store';
import { FixtureRow, TeamName, fmtDate } from '../ui';
import { FixtureEditDialog } from '../modals/FixtureEdit';
import { FixtureGenerateDialog } from '../modals/FixtureGenerate';
import { FixtureAdjustDialog } from '../modals/FixtureAdjust';

export function FixturesPage({ onReport }: { onReport: () => void }) {
  const s = useStore();
  const fixtures = useMemo(() => s.db.fixtures.filter((f) => f.seasonId === s.season?.id).sort((a, b) => a.date.getTime() - b.date.getTime()), [s.db.fixtures, s.season]);
  const next = fixtures.find((f) => !isPlayed(f, TODAY));
  const last = [...fixtures].reverse().find((f) => isPlayed(f, TODAY));
  const [open, setOpen] = useState<string[]>(() => [next?.id, last?.id].filter(Boolean) as string[]);
  const [editing, setEditing] = useState<Fixture | 'new' | null>(null);
  const [generate, setGenerate] = useState(false);
  const [adjust, setAdjust] = useState(false);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <div className="fr-page">
      <Button variant="primary" leading={<Megaphone />} onClick={onReport} className="fr-mobile-only" fullWidth>
        Report score
      </Button>

      {s.isAdmin && (
        <div className="fr-actions">
          <Button leading={<WandSparkles />} onClick={() => setGenerate(true)}>Magic generate</Button>
          <Button leading={<CalendarClock />} onClick={() => setAdjust(true)} disabled={!fixtures.length}>Adjust fixtures</Button>
          <Button leading={<Plus />} onClick={() => setEditing('new')}>Add fixture</Button>
        </div>
      )}

      {fixtures.length === 0 ? (
        <EmptyState
          bordered
          icon={<CalendarPlus />}
          title="No fixtures yet"
          description={s.isAdmin ? 'Generate a full round robin in one go, or add fixtures one at a time.' : 'The draw hasn’t been published. Check back once registrations close.'}
          actions={s.isAdmin && <Button variant="primary" leading={<WandSparkles />} onClick={() => setGenerate(true)}>Magic generate</Button>}
        />
      ) : (
        <Stack gap={2}>
          {fixtures.map((f) => (
            <FixtureRow
              key={f.id}
              open={open.includes(f.id)}
              onToggle={() => toggle(f.id)}
              title={
                <>
                  {f.title.replace(' (Grading)', '')}
                  {f.grading && <Badge size="sm" variant="outline">Grading</Badge>}
                  {f.id === next?.id && <Badge size="sm" tone="info">Next up</Badge>}
                </>
              }
              meta={fmtDate(f.date)}
              action={
                <>
                  <Tooltip content="Shareable view">
                    <IconButton size="sm" variant="ghost" aria-label={`Share ${f.title}`} onClick={() => s.setShare(f.id)}>
                      <Share2 />
                    </IconButton>
                  </Tooltip>
                  {s.isAdmin && (
                    <Button size="sm" variant="ghost" leading={<Pencil />} onClick={() => setEditing(f)}>
                      Edit
                    </Button>
                  )}
                </>
              }
            >
              <GamesTable fixture={f} />
            </FixtureRow>
          ))}
        </Stack>
      )}

      <FixtureEditDialog fixture={editing} onClose={() => setEditing(null)} />
      <FixtureGenerateDialog open={generate} onOpenChange={setGenerate} />
      <FixtureAdjustDialog open={adjust} onOpenChange={setAdjust} />
    </div>
  );
}

/** Games in a fixture; highlights the signed-in user's team and shows results when recorded. */
export function GamesTable({ fixture }: { fixture: Fixture }) {
  const s = useStore();
  const mine = s.myTeam?.id;
  const scored = fixture.games.some((g) => g.team1Score != null);
  if (!fixture.games.length) return <Text size="sm" tone="tertiary" className="fr-pad">No games in this fixture yet.</Text>;
  return (
    <DataTable<Game>
      bordered={false}
      density="compact"
      rowKey={(g) => g.id}
      rows={fixture.games}
      columns={[
        { key: 'team1', header: 'Team 1', render: (g) => <TeamName team={s.teamById(g.team1Id)} muted={!!mine && g.team1Id !== mine && g.team2Id !== mine} /> },
        ...(scored
          ? [{ key: 'score', header: 'Score', align: 'center' as const, width: 90, render: (g: Game) => (g.team1Score != null ? <Score a={g.team1Score} b={g.team2Score!} /> : <Text as="span" size="sm" tone="tertiary">—</Text>) }]
          : []),
        { key: 'team2', header: 'Team 2', render: (g) => <TeamName team={s.teamById(g.team2Id)} muted={!!mine && g.team1Id !== mine && g.team2Id !== mine} /> },
        { key: 'time', header: 'Time', width: 100 },
        { key: 'place', header: 'Place', width: 100, hideBelow: 'sm' },
      ]}
    />
  );
}

export function Score({ a, b }: { a: number; b: number }) {
  return (
    <span className="fr-score">
      <b data-win={a > b || undefined}>{a}</b>
      <span>–</span>
      <b data-win={b > a || undefined}>{b}</b>
    </span>
  );
}
