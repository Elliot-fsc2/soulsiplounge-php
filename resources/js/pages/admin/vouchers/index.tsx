import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ActionButton, StatusPill, EmptyState, ListPanel, Field, Input, Textarea, Select } from '@/components/soul-sips-ui';
import { formatCurrency } from '@/lib/format';
import { store, update, destroy } from '@/routes/admin/vouchers';
import type { Voucher } from '@/types/domain';
import ConfirmModal from '@/components/confirm-modal';

interface Props {
  vouchers: Voucher[];
}

function emptyDraft(): Voucher {
  return {
    id: '', code: '', type: 'percentage', value: 0,
    min_purchase: 0, max_uses: 0, used_count: 0, expires_at: '', active: true, description: '', created_at: '',
  };
}

export default function AdminVouchersIndex({ vouchers }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [draft, setDraft] = useState<Voucher>(emptyDraft());

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: 'discard' | 'delete' | null;
    voucher: Voucher | null;
  }>({ isOpen: false, action: null, voucher: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const openConfirm = (action: 'discard' | 'delete', voucher: Voucher | null = null) => {
    setConfirmState({ isOpen: true, action, voucher });
  };
  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, voucher: null });
  };

  const executeAction = () => {
    const { action, voucher } = confirmState;
    if (!action) return;
    
    if (action === 'discard') {
      setEditorOpen(false);
      setDraft(emptyDraft());
      setEditingVoucher(null);
      closeConfirm();
    } else if (action === 'delete' && voucher) {
      setIsProcessing(true);
      router.delete(destroy.url({ voucher: voucher.id }), { 
        preserveScroll: true,
        onFinish: () => {
          setIsProcessing(false);
          closeConfirm();
        }
      });
    }
  };

  const activeCount = vouchers.filter((v) => v.active).length;
  const totalRedemptions = vouchers.reduce((sum, v) => sum + v.used_count, 0);

  const openEditor = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setDraft(JSON.parse(JSON.stringify(voucher)));
    } else {
      setEditingVoucher(null);
      setDraft(emptyDraft());
    }
    setEditorOpen(true);
  };

  const closeEditor = () => {
    openConfirm('discard');
  };

  const saveVoucher = () => {
    if (!draft.code.trim()) return;
    const payload = { ...draft };
    if (editingVoucher) {
      router.put(update.url({ voucher: editingVoucher.id }), payload, {
        preserveScroll: true,
        onSuccess: () => { setEditorOpen(false); setDraft(emptyDraft()); setEditingVoucher(null); },
      });
    } else {
      router.post(store.url(), payload, {
        preserveScroll: true,
        onSuccess: () => { setEditorOpen(false); setDraft(emptyDraft()); },
      });
    }
  };

  const deleteVoucher = (voucher: Voucher) => {
    openConfirm('delete', voucher);
  };

  const toggleActive = (v: Voucher) => {
    router.put(update.url({ voucher: v.id }), { active: !v.active }, { preserveScroll: true });
  };

  const generateCode = () => {
    setDraft((prev) => ({ ...prev, code: `SOUL${Math.random().toString(36).substring(2, 7).toUpperCase()}` }));
  };

  const formatValue = (v: Voucher) =>
    v.type === 'percentage' ? `${v.value}%` : formatCurrency(v.value);

  const statusFor = (v: Voucher) => {
    const expired = v.expires_at && new Date(v.expires_at) < new Date();
    if (expired) return 'Expired';
    return v.active ? 'Active' : 'Inactive';
  };

  return (
    <>
      <Head title="Vouchers - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Vouchers Management</p>
            <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-100">Discount Vouchers</h2>
            <p className="mt-1 text-sm text-stone-400">Create and manage promotional discount codes.</p>
          </div>
          <ActionButton onClick={() => openEditor()}>+ Create Voucher</ActionButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Active Vouchers</p>
            <p className="mt-2 text-3xl font-serif font-bold text-amber-400">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Total Redemptions</p>
            <p className="mt-2 text-3xl font-serif font-bold text-stone-100">{totalRedemptions}</p>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Total Discounts</p>
            <p className="mt-2 text-3xl font-serif font-bold text-stone-100">₱0</p>
          </div>
        </div>

        <ListPanel title={`All Vouchers (${vouchers.length})`} description="Vouchers can be percentage-based or fixed-amount discounts.">
          <div className="divide-y divide-white/10">
            {vouchers.map((v) => (
              <div key={v.id} className="py-4 space-y-3">
                <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr_auto] lg:items-center">
                  <div>
                    <div className="font-medium text-white font-mono tracking-wider">{v.code}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{v.description}</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-amber-300 font-semibold">{formatValue(v)}</span>
                    <span className="text-stone-500 text-xs ml-1">{v.type === 'percentage' ? 'off' : 'off'}</span>
                  </div>
                  <div className="text-xs text-stone-400">
                    Min: {v.min_purchase > 0 ? formatCurrency(v.min_purchase) : '—'}
                  </div>
                  <div className="text-xs text-stone-400">
                    {v.used_count} / {v.max_uses === 0 ? '∞' : v.max_uses} used
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleActive(v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${v.active ? 'border-amber-500/40 bg-amber-500' : 'border-stone-600 bg-stone-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${v.active ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </button>
                    <StatusPill status={statusFor(v)} compact />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEditor(v)}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/10">Edit</button>
                  <button type="button" onClick={() => deleteVoucher(v)}
                    className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20">Delete</button>
                </div>
              </div>
            ))}
            {vouchers.length === 0 && <EmptyState message="No vouchers created yet." />}
          </div>
        </ListPanel>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60" onClick={closeEditor} />
          <div className="relative w-full max-w-2xl mx-2 overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-700 bg-stone-950 shadow-2xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="border-b border-stone-800 bg-stone-900/80 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] font-sans uppercase tracking-widest text-amber-400">Voucher Editor</div>
                <h4 className="text-sm font-serif font-semibold text-stone-100">{editingVoucher ? 'Edit' : 'New'} Voucher</h4>
              </div>
              <button type="button" onClick={closeEditor}
                className="rounded-full bg-stone-800 p-1.5 text-stone-400 hover:bg-stone-700 hover:text-stone-100 transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <Field label="Voucher Code">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input value={draft.code} onChange={(v) => setDraft({ ...draft, code: v })} required />
                  </div>
                  <button type="button" onClick={generateCode}
                    className="shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20">Generate</button>
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Discount Type">
                  <Select value={draft.type} onChange={(v) => setDraft({ ...draft, type: v as 'percentage' | 'fixed' })} options={['percentage', 'fixed']} />
                </Field>
                <Field label="Value">
                  <Input value={String(draft.value)} onChange={(v) => setDraft({ ...draft, value: Number(v) })} type="number" min="0" />
                </Field>
                <Field label="Min Purchase (₱)">
                  <Input value={String(draft.min_purchase)} onChange={(v) => setDraft({ ...draft, min_purchase: Number(v) })} type="number" min="0" />
                </Field>
                <Field label="Max Uses (0 = unlimited)">
                  <Input value={String(draft.max_uses)} onChange={(v) => setDraft({ ...draft, max_uses: Number(v) })} type="number" min="0" />
                </Field>
                <Field label="Expires At">
                  <Input value={draft.expires_at} onChange={(v) => setDraft({ ...draft, expires_at: v })} type="date" />
                </Field>
              </div>

              <Field label="Description">
                <Textarea value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} required />
              </Field>
            </div>

            <div className="border-t border-stone-800 bg-stone-900/80 px-6 py-4 flex flex-col sm:flex-row gap-2 justify-end shrink-0">
              <ActionButton variant="ghost" onClick={closeEditor}>Cancel</ActionButton>
              <ActionButton onClick={saveVoucher}>Save Voucher</ActionButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={executeAction}
        isLoading={isProcessing}
        title={
          confirmState.action === 'discard' ? 'Discard Changes' : 'Delete Voucher'
        }
        description={
          confirmState.action === 'discard'
            ? 'Are you sure you want to discard your unsaved changes?'
            : `Are you sure you want to permanently delete the voucher "${confirmState.voucher?.code}"? This action cannot be undone.`
        }
        confirmText={
          confirmState.action === 'discard' ? 'Yes, Discard' : 'Yes, Delete'
        }
      />
    </>
  );
}
