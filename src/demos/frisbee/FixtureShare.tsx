import { ArrowLeft, Link2, Printer } from 'lucide-react';
import { Button, DataTable, Heading, Stack, Text, toast } from '@ui';
import { useStore } from './store';
import { Logo } from './Logo';
import { TeamName, fmtDate } from './ui';
import type { Game } from './data';

/** Focused, frame-less fixture view designed for sharing or display at the fields. */
export function FixtureShare() {
  const s = useStore();
  const fixture = s.db.fixtures.find((f) => f.id === s.share);
  if (!fixture) return null;
  return (
    <div className="fr-share">
      <div className="fr-share__bar">
        <Button variant="ghost" size="sm" leading={<ArrowLeft />} onClick={() => s.setShare(null)}>Back to fixtures</Button>
        <Stack direction="row" gap={2}>
          <Button size="sm" leading={<Link2 />} onClick={() => toast.success('Link copied', { description: `perthulti.com/fixture/${fixture.id}` })}>Copy link</Button>
          <Button size="sm" leading={<Printer />} onClick={() => toast('Print dialog would open here')}>Print</Button>
        </Stack>
      </div>
      <div className="fr-share__sheet">
        <Stack direction="row" gap={3} align="center">
          <Logo size={40} />
          <div>
            <Text size="xs" tone="tertiary">{s.season?.name}</Text>
            <Heading level={1} size="2xl">{fixture.title}</Heading>
          </div>
          <Text size="sm" tone="secondary" className="fr-share__date">{fmtDate(fixture.date)}</Text>
        </Stack>
        <DataTable<Game>
          rowKey={(g) => g.id}
          rows={fixture.games}
          columns={[
            { key: 'time', header: 'Time', width: 90 },
            { key: 'place', header: 'Place', width: 90 },
            { key: 'team1', header: 'Team 1', render: (g) => <TeamName team={s.teamById(g.team1Id)} size="md" /> },
            { key: 'vs', header: '', width: 40, align: 'center', render: () => <Text as="span" size="xs" tone="tertiary">vs</Text> },
            { key: 'team2', header: 'Team 2', render: (g) => <TeamName team={s.teamById(g.team2Id)} size="md" /> },
          ]}
        />
        <Text size="xs" tone="tertiary">Arrive 15 minutes early. Bring both light and dark tops. Spirit scores are due within 48 hours.</Text>
      </div>
    </div>
  );
}
