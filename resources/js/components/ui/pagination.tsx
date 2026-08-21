import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
  meta: PaginationMeta;
  pageParam?: string;
}

export default function Pagination({ meta, pageParam = 'page' }: Props) {
  if (meta.last_page <= 1) return null;

  const goToPage = (page: number) => {
    router.get(window.location.pathname, { [pageParam]: page > 1 ? page : undefined }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  // Show max 5 page buttons
  const range = 2;
  let start = Math.max(1, meta.current_page - range);
  let end = Math.min(meta.last_page, meta.current_page + range);
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(meta.last_page, start + 4);
    } else {
      start = Math.max(1, end - 4);
    }
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-stone-800 px-4 py-3 sm:px-6">
      <div className="hidden text-sm text-stone-500 sm:block">
        {meta.from && meta.to ? (
          <span>
            Showing <span className="font-medium text-stone-300">{meta.from}</span> to{' '}
            <span className="font-medium text-stone-300">{meta.to}</span> of{' '}
            <span className="font-medium text-stone-300">{meta.total}</span>
          </span>
        ) : (
          <span>{meta.total} results</span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center gap-1 sm:flex-initial sm:justify-end">
        <button
          type="button"
          onClick={() => goToPage(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-800 hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToPage(1)}
              className="rounded-lg px-3 py-1.5 text-sm text-stone-400 transition hover:bg-stone-800 hover:text-stone-200"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-stone-600">…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              page === meta.current_page
                ? 'bg-amber-400 text-stone-950'
                : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
            }`}
          >
            {page}
          </button>
        ))}

        {end < meta.last_page && (
          <>
            {end < meta.last_page - 1 && <span className="px-1 text-stone-600">…</span>}
            <button
              type="button"
              onClick={() => goToPage(meta.last_page)}
              className="rounded-lg px-3 py-1.5 text-sm text-stone-400 transition hover:bg-stone-800 hover:text-stone-200"
            >
              {meta.last_page}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => goToPage(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-800 hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
