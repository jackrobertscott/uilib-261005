import { ArrowRight } from 'lucide-react';
import { Badge, Card } from '@ui';
import { GROUPS, modules } from './registry';

export function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <article className="wb-page">
      <header className="wb-page__header">
        <Badge variant="outline" dot tone="success">
          v0.1
        </Badge>
        <h1 className="wb-page__title">Component workbench</h1>
        <p className="wb-page__desc">
          A complete, themeable component library. Nine CSS primitives define the whole system — open <b>Theme</b> in the
          top-right to change them live. Every control here is a custom implementation; no native form widgets.
        </p>
      </header>
      {GROUPS.map((g) => {
        const items = modules.filter((m) => m.group === g);
        if (!items.length) return null;
        return (
          <section key={g} className="wb-overview__group">
            <h2 className="wb-h2">{g}</h2>
            <div className="wb-overview__grid">
              {items.map((m) => (
                <Card key={m.id} variant="outline" padding="md" interactive tabIndex={0} role="link" onClick={() => onOpen(m.id)} onKeyDown={(e) => e.key === 'Enter' && onOpen(m.id)} className="wb-overview__card">
                  <div className="wb-overview__card-title">
                    {m.title}
                    <ArrowRight size={14} />
                  </div>
                  <div className="wb-overview__card-meta">
                    {m.fullPage ? 'Full page demo' : `${m.stories.length} ${m.stories.length === 1 ? 'story' : 'stories'}${m.playground ? ' · playground' : ''}`}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </article>
  );
}
