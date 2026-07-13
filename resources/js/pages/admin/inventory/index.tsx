import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Minus, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { ActionButton, ListPanel, EmptyState } from '@/components/soul-sips-ui';
import { addStock, adjust, weeklyRestock } from '@/routes/admin/inventory';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  weekly_delivery_day: string | null;
  weekly_delivery_qty: number | null;
  shelf_life_days: number | null;
}

interface Props {
  items: InventoryItem[];
}

function getStockLevel(item: InventoryItem): { label: string; color: string } {
  const ratio = item.min_stock > 0 ? item.current_stock / item.min_stock : 999;
  if (item.current_stock <= 0) return { label: 'Out of Stock', color: 'border-rose-600/30 bg-rose-900/40 text-rose-300' };
  if (ratio <= 1.5) return { label: 'Low', color: 'border-amber-600/30 bg-amber-900/40 text-amber-300' };
  if (ratio <= 3) return { label: 'Moderate', color: 'border-sky-600/30 bg-sky-900/40 text-sky-300' };
  return { label: 'In Stock', color: 'border-emerald-600/30 bg-emerald-900/40 text-emerald-300' };
}

interface StockModalProps {
  item: InventoryItem;
  mode: 'add' | 'adjust';
  onClose: () => void;
}

function StockModal({ item, mode, onClose }: StockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    setSubmitting(true);

    const endpoint = mode === 'add' ? addStock : adjust;
    router.post(endpoint.url({ inventoryItem: item.id }), {
      quantity: qty,
      notes: mode === 'add' ? notes : undefined,
    }, {
      preserveScroll: true,
      onSuccess: onClose,
      onFinish: () => setSubmitting(false),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-amber-400">{mode === 'add' ? 'Add Stock' : 'Adjust'}</div>
            <h4 className="text-sm font-serif font-semibold text-stone-100">{item.name}</h4>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-stone-800 p-1.5 text-stone-400 transition hover:bg-stone-700 hover:text-stone-100">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm text-stone-400">
            Current stock: <span className="font-bold text-stone-100">{item.current_stock}</span> {item.unit}
          </p>

          {mode === 'adjust' && (
            <p className="text-xs text-stone-500">
              Use positive values to add stock, negative to remove.
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-400">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {mode === 'add' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sunday delivery"
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-stone-800 px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold tracking-wide text-stone-300 transition hover:bg-stone-700 hover:text-stone-100">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting || !quantity}
            className="flex-1 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Saving...' : mode === 'add' ? 'Add Stock' : 'Adjust'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInventoryIndex({ items }: Props) {
  const [modal, setModal] = useState<{ item: InventoryItem; mode: 'add' | 'adjust' } | null>(null);
  const [restocking, setRestocking] = useState(false);

  function handleWeeklyRestock() {
    if (!confirm('Restock all weekly delivery items to their full weekly quantities?')) return;
    setRestocking(true);
    router.post(weeklyRestock.url(), {}, {
      preserveScroll: true,
      onFinish: () => setRestocking(false),
    });
  }

  const lowStockItems = items.filter(
    (item) => item.min_stock > 0 && item.current_stock <= item.min_stock * 1.5,
  );

  return (
    <>
      <Head title="Inventory - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Inventory Management</p>
            <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-100">Inventory</h2>
            <p className="mt-1 text-sm text-stone-400">Track stock levels and record deliveries.</p>
          </div>
          <ActionButton onClick={handleWeeklyRestock} disabled={restocking}>
            <RefreshCw className={`mr-1.5 inline size-3.5 ${restocking ? 'animate-spin' : ''}`} />
            Weekly Restock
          </ActionButton>
        </div>

        {lowStockItems.length > 0 && (
          <div className="rounded-2xl border border-amber-600/30 bg-amber-900/20 p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-semibold">Low Stock Alert</span>
            </div>
            <ul className="mt-2 space-y-1">
              {lowStockItems.map((item) => (
                <li key={item.id} className="text-sm text-amber-300">
                  {item.name} — {item.current_stock} {item.unit} remaining
                  {item.weekly_delivery_day ? ` (next delivery: ${item.weekly_delivery_day})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ListPanel title={`Stock Items (${items.length})`} description="Click Add Stock or Adjust to update inventory levels.">
          {items.length === 0 && <EmptyState message="No inventory items configured." />}
          <div className="divide-y divide-white/10">
            {items.map((item) => {
              const level = getStockLevel(item);

              return (
                <div key={item.id} className="py-4 space-y-3">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.6fr_auto] lg:items-center">
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-xs text-stone-400">{item.unit}</div>
                    </div>
                    <div>
                      <span className="text-lg font-serif font-bold text-stone-100">{item.current_stock}</span>
                      <span className="ml-1 text-xs text-stone-500">{item.unit}</span>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${level.color}`}>
                        {level.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModal({ item, mode: 'add' })}
                        className="flex items-center gap-1 rounded-full border border-stone-700 px-3 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800"
                      >
                        <Plus className="size-3" /> Add Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal({ item, mode: 'adjust' })}
                        className="flex items-center gap-1 rounded-full border border-stone-700 px-3 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800"
                      >
                        <Minus className="size-3" /> Adjust
                      </button>
                    </div>
                  </div>
                  {item.weekly_delivery_day && (
                    <div className="text-[10px] text-stone-500">
                      Weekly delivery: {item.weekly_delivery_day} &middot; {item.weekly_delivery_qty} {item.unit}
                      {item.shelf_life_days && ` &middot; Shelf life: ${item.shelf_life_days} days`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ListPanel>
      </div>

      {modal && (
        <StockModal item={modal.item} mode={modal.mode} onClose={() => setModal(null)} />
      )}
    </>
  );
}
