import { getCitation } from '@/lib/data/citations';

/** Compact author-year chips linking to the DOI. */
export default function CiteChips({ ids, className = '' }: { ids: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {ids.map((id: string) => {
        const c = getCitation(id);
        if (!c) return null;
        const first = c.authors.split(',')[0]?.trim() ?? c.authors;
        const many = (c.authors.match(/,/g)?.length ?? 0) > 1;
        return (
          <a key={id} href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer" title={c.title}
            className="text-[11px] px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
            {first}{many ? ' et al.' : ''} {c.year}
          </a>
        );
      })}
    </div>
  );
}
