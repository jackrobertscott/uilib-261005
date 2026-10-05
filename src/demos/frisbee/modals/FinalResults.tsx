import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Trophy } from 'lucide-react';
import { Button, Dialog, IconButton, Stack, Text, toast } from '@ui';
import { byDivision, type LadderRow } from '../compute';
import { useStore } from '../store';
import { TeamName } from '../ui';

/** Order teams within each division after finals. Starts from saved results or the current ladder. */
export function FinalResultsDialog({ open, onOpenChange, rows }: { open: boolean; onOpenChange: (o: boolean) => void; rows: LadderRow[] }) {
  const s = useStore();
  const [order, setOrder] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!open) return;
    const fromLadder = Object.fromEntries(byDivision(rows, (r) => r.team.division).map(([d, rs]) => [d, rs.map((r) => r.team.id)]));
    setOrder(s.season?.finalResults ?? fromLadder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const move = (div: string, i: number, dir: -1 | 1) =>
    setOrder((o) => {
      const list = [...o[div]];
      [list[i], list[i + dir]] = [list[i + dir], list[i]];
      return { ...o, [div]: list };
    });

  const save = (results: Record<string, string[]> | undefined) => {
    s.update((db) => ({ ...db, seasons: db.seasons.map((x) => (x.id === s.season?.id ? { ...x, finalResults: results } : x)) }));
    toast.success(results ? 'Final results saved' : 'Final results cleared');
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Trophy />}
      title="Final results"
      description="Set the finishing order in each division. First place gets the trophy on the ladder."
      size="lg"
      footer={
        <>
          {s.season?.finalResults && (
            <Button variant="ghost" onClick={() => save(undefined)} className="fr-footer-left">
              Clear results
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => save(order)}>Save results</Button>
        </>
      }
    >
      <div className="fr-grid-2">
        {Object.entries(order).map(([div, ids]) => (
          <Stack key={div} gap={2}>
            <Text size="xs" weight="medium" tone="tertiary" className="fr-eyebrow">{div === 'none' ? 'No division' : `Division ${div}`}</Text>
            <ol className="fr-order">
              {ids.map((id, i) => (
                <li key={id}>
                  <span className="fr-order__pos">{i + 1}</span>
                  <TeamName team={s.teamById(id)} />
                  <span className="fr-order__btns">
                    <IconButton size="xs" variant="ghost" aria-label={`Move ${s.teamById(id)?.name} up`} disabled={i === 0} onClick={() => move(div, i, -1)}>
                      <ArrowUp />
                    </IconButton>
                    <IconButton size="xs" variant="ghost" aria-label={`Move ${s.teamById(id)?.name} down`} disabled={i === ids.length - 1} onClick={() => move(div, i, 1)}>
                      <ArrowDown />
                    </IconButton>
                  </span>
                </li>
              ))}
            </ol>
          </Stack>
        ))}
      </div>
    </Dialog>
  );
}
