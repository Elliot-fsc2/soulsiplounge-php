import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ActionButton, StatusPill, EmptyState, ListPanel, Field, Input } from '@/components/soul-sips-ui';
import { formatCurrency } from '@/lib/format';
import { store, update, destroy } from '@/routes/admin/products';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
  sort_order: number;
}

interface Props {
  products: Product[];
}

const CATEGORIES = ['beverage', 'snack', 'room'] as const;

export default function AdminProductsIndex({ products }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState({ name: '', category: 'beverage', price: 0, active: true, sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);

  function openEditor(product?: Product) {
    if (product) {
      setEditing(product);
      setDraft({
        name: product.name,
        category: product.category,
        price: product.price,
        active: product.active,
        sort_order: product.sort_order,
      });
    } else {
      setEditing(null);
      setDraft({ name: '', category: 'beverage', price: 0, active: true, sort_order: 0 });
    }
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditing(null);
  }

  function handleSave() {
    if (!draft.name.trim() || draft.price < 0) return;
    setSubmitting(true);

    const payload = {
      name: draft.name.trim(),
      category: draft.category,
      price: draft.price,
      active: draft.active,
      sort_order: draft.sort_order,
    };

    const done = () => { closeEditor(); setSubmitting(false); };

    if (editing) {
      router.patch(update.url({ product: editing.id }), payload, { preserveScroll: true, onSuccess: done, onFinish: () => setSubmitting(false) });
    } else {
      router.post(store.url(), payload, { preserveScroll: true, onSuccess: done, onFinish: () => setSubmitting(false) });
    }
  }

  function handleDelete(product: Product) {
    if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      router.delete(destroy.url({ product: product.id }), { preserveScroll: true });
    }
  }

  function toggleActive(product: Product) {
    router.patch(update.url({ product: product.id }), {
      name: product.name,
      category: product.category,
      price: product.price,
      active: !product.active,
      sort_order: product.sort_order,
    }, { preserveScroll: true });
  }

  const beverages = products.filter((p) => p.category === 'beverage');
  const snacks = products.filter((p) => p.category === 'snack');
  const rooms = products.filter((p) => p.category === 'room');

  return (
    <>
      <Head title="Products - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Menu Management</p>
            <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-100">Products</h2>
            <p className="mt-1 text-sm text-stone-400">Manage your POS menu — drinks, snacks, and room charges.</p>
          </div>
          <ActionButton onClick={() => openEditor()}><Plus className="mr-1 inline size-3.5" /> Add Product</ActionButton>
        </div>

        <ListPanel title={`Beverages (${beverages.length})`} description="Hot and iced drinks.">
          <ProductList products={beverages} onEdit={openEditor} onDelete={handleDelete} onToggle={toggleActive} />
        </ListPanel>

        <ListPanel title={`Snacks (${snacks.length})`} description="Cookies and cream puffs.">
          <ProductList products={snacks} onEdit={openEditor} onDelete={handleDelete} onToggle={toggleActive} />
        </ListPanel>

        <ListPanel title={`Room Charges (${rooms.length})`} description="Per-person room packages.">
          <ProductList products={rooms} onEdit={openEditor} onDelete={handleDelete} onToggle={toggleActive} />
        </ListPanel>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeEditor} />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
              <div>
                <div className="text-[10px] font-sans uppercase tracking-widest text-amber-400">Product Editor</div>
                <h4 className="text-sm font-serif font-semibold text-stone-100">{editing ? 'Edit' : 'New'} Product</h4>
              </div>
              <button type="button" onClick={closeEditor} className="rounded-full bg-stone-800 p-1.5 text-stone-400 transition hover:bg-stone-700 hover:text-stone-100">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <Field label="Name">
                <Input value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} required />
              </Field>

              <div>
                <label className="mb-1.5 block text-sm text-stone-300">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-stone-950">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Field label="Price (in centavos, e.g. 20700 = ₱207)">
                <Input
                  value={draft.price.toString()}
                  onChange={(v) => setDraft({ ...draft, price: parseInt(v) || 0 })}
                  type="number"
                  min="0"
                />
              </Field>

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-600 bg-stone-950 text-amber-500 focus:ring-0"
                  />
                  <span className="text-sm text-stone-300">Active</span>
                </label>
              </div>

              <Field label="Sort Order">
                <Input
                  value={draft.sort_order.toString()}
                  onChange={(v) => setDraft({ ...draft, sort_order: parseInt(v) || 0 })}
                  type="number"
                  min="0"
                />
              </Field>
            </div>

            <div className="flex gap-3 border-t border-stone-800 px-6 py-4">
              <button type="button" onClick={closeEditor}
                className="flex-1 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold tracking-wide text-stone-300 transition hover:bg-stone-700 hover:text-stone-100">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={submitting || !draft.name.trim()}
                className="flex-1 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProductList({ products, onEdit, onDelete, onToggle }: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onToggle: (p: Product) => void;
}) {
  if (products.length === 0) return <EmptyState message="No products in this category." />;

  return (
    <div className="divide-y divide-white/10">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm ${product.active ? 'text-white' : 'text-stone-500 line-through'}`}>
                {product.name}
              </span>
              {!product.active && <span className="text-[10px] text-stone-500">(hidden)</span>}
            </div>
            <div className="text-sm text-amber-400 font-semibold">{formatCurrency(product.price)}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => onToggle(product)}
              className="rounded-full border border-stone-700 px-3 py-1.5 text-[10px] text-stone-400 transition hover:bg-stone-800">
              {product.active ? 'Hide' : 'Show'}
            </button>
            <button type="button" onClick={() => onEdit(product)}
              className="rounded-full border border-stone-700 px-3 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(product)}
              className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/20">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
