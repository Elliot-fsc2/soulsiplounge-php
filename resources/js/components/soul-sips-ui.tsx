import { AnimatePresence, motion } from 'framer-motion';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { formatCurrency } from '@/lib/format';

export function getToneClasses(tone: string) {
  if (tone === 'success') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-50';
  if (tone === 'warning') return 'border-amber-400/30 bg-amber-500/15 text-amber-50';
  return 'border-sky-400/30 bg-sky-500/15 text-sky-50';
}

export function CafeField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-stone-300">{label}{children}</label>;
}

export function CafeInput({ value, onChange, type = 'text', placeholder, required, min }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; min?: string;
}) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder}
      required={required} min={min}
      className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
    />
  );
}

export function CafeTextarea({ value, onChange, placeholder, rows = 4, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      required={required}
      className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2 text-sm text-stone-300"><span>{label}</span>{children}</label>;
}

export function Input({ value, onChange, type = 'text', placeholder, required, min }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; min?: string;
}) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder}
      required={required} min={min}
      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 4, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      required={required}
      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
    />
  );
}

export function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
    >
      {options.map((o) => <option key={o} value={o} className="bg-stone-950">{o}</option>)}
    </select>
  );
}

export function ActionButton({ children, onClick, type = 'button', variant = 'primary', className = '', disabled }: {
  children: ReactNode; onClick?: (e: MouseEvent<HTMLButtonElement>) => void; type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost'; className?: string; disabled?: boolean;
}) {
  const base = variant === 'ghost'
    ? 'border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100'
    : 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-md shadow-amber-500/20';
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`rounded-full px-5 py-3 text-sm font-bold tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed ${base} ${className}`}
    >
      {children}
    </button>
  );
}

export function SidebarButton({ active, children, onClick }: {
  active: boolean; children: ReactNode; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active ? 'bg-amber-400 text-stone-950' : 'bg-transparent text-stone-400 hover:bg-stone-800 hover:text-stone-100'}`}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status, compact = false }: { status: string; compact?: boolean }) {
  const tone =
    status === 'Confirmed' || status === 'Read'
      ? 'border-emerald-600/30 bg-emerald-900/40 text-emerald-300'
      : status === 'Completed'
        ? 'border-sky-600/30 bg-sky-900/40 text-sky-300'
        : status === 'Cancelled' || status === 'Archived'
          ? 'border-rose-600/30 bg-rose-900/40 text-rose-300'
          : status === 'Refunded'
            ? 'border-cyan-600/30 bg-cyan-900/40 text-cyan-300'
            : status === 'Failed'
              ? 'border-stone-600/30 bg-stone-900/40 text-stone-400'
              : 'border-amber-600/30 bg-amber-900/40 text-amber-300';
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone} ${compact ? 'tracking-[0.15em] uppercase' : ''}`}>
      {status}
    </span>
  );
}

export function ListPanel({ title, description, children }: {
  title: string; description: string; children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
      <div>
        <h3 className="text-xl font-serif font-semibold text-stone-100">{title}</h3>
        <p className="mt-1 text-sm text-stone-400">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="py-8 text-center text-sm text-stone-500">{message}</div>;
}

export function ContactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
      <span className="text-stone-500">{label}</span>
      <span className="max-w-xs text-right text-stone-200">{value}</span>
    </div>
  );
}

export function SummaryRow({ label, value, highlight }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-stone-500">{label}</span>
      <span className={`text-right ${highlight ? 'text-2xl font-serif font-bold text-amber-400' : 'text-stone-300'}`}>
        {value}
      </span>
    </div>
  );
}

export interface ToastItem {
  id: string; title: string; description?: string; tone: string;
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl shadow-stone-950/60 ${getToneClasses(t.tone)}`}
          >
            <div className="text-sm font-bold">{t.title}</div>
            {t.description ? <div className="mt-0.5 text-sm opacity-90">{t.description}</div> : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = (title: string, description?: string, tone: string = 'success') => {
    const id = `toast_${Math.random().toString(36).slice(2, 10)}`;
    setToasts((cur) => [...cur, { id, title, description, tone }]);
    window.setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 3200);
  };
  return { toasts, addToast };
}



