import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ActionButton, StatusPill, EmptyState, ListPanel, Field, Input, Textarea } from '@/components/soul-sips-ui';
import { store, update, destroy } from '@/routes/admin/rooms';
import type { Room, RoomPricingTier } from '@/types/domain';

const DURATIONS = ['1.5', '2', '3'] as const;
const GUEST_SIZES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function emptyPricing(): RoomPricingTier[] {
  return DURATIONS.flatMap((duration) => [false, true].map((with_cake) => ({
    duration,
    with_cake,
    per_person_rates: Object.fromEntries(GUEST_SIZES.map((g) => [g, 0])),
  })));
}

interface Props {
  rooms: Room[];
}

export default function AdminRoomsIndex({ rooms }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [draft, setDraft] = useState<Room | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const openEditor = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setDraft(JSON.parse(JSON.stringify(room)));
    } else {
      setEditingRoom(null);
      setDraft({
        id: '', name: '', image: '', description: '',
        min_group: 3, max_group: 12, pricing: emptyPricing(),
      });
    }
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (confirm('Discard changes?')) {
      setEditorOpen(false);
      setDraft(null);
      setEditingRoom(null);
    }
  };

  const saveRoom = () => {
    if (!draft || !draft.name.trim()) return;
    const formData = new FormData();
    formData.append('name', draft.name);
    formData.append('description', draft.description || '');
    formData.append('min_group', String(draft.min_group));
    formData.append('max_group', String(draft.max_group));
    formData.append('pricing', JSON.stringify(draft.pricing));
    if (imageFile) formData.append('image_file', imageFile);
    const done = () => { setEditorOpen(false); setDraft(null); setEditingRoom(null); setImageFile(null); };
    if (editingRoom) {
      formData.append('_method', 'PUT');
      router.post(update.url({ room: editingRoom.id }), formData, { preserveScroll: true, onSuccess: done });
    } else {
      router.post(store.url(), formData, { preserveScroll: true, onSuccess: done });
    }
  };

  const deleteRoom = (room: Room) => {
    if (confirm(`Delete room "${room.name}"? This cannot be undone.`)) {
      router.delete(destroy.url({ room: room.id }), { preserveScroll: true });
    }
  };

  const updateTierRate = (tierIdx: number, size: number, value: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev.pricing];
      next[tierIdx] = { ...next[tierIdx], per_person_rates: { ...next[tierIdx].per_person_rates, [size]: value } };
      return { ...prev, pricing: next };
    });
  };

  const toggleTierCake = (tierIdx: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev.pricing];
      next[tierIdx] = { ...next[tierIdx], with_cake: !next[tierIdx].with_cake };
      return { ...prev, pricing: next };
    });
  };

  return (
    <>
      <Head title="Rooms CRUD - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-sans">Rooms Management</p>
            <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-100">Rooms CRUD</h2>
            <p className="mt-1 text-sm text-stone-400">Add, edit, or remove rooms. Each room has its own full pricing matrix.</p>
          </div>
          <ActionButton onClick={() => openEditor()}>+ Add Room</ActionButton>
        </div>

        <ListPanel title={`Registered Rooms (${rooms.length})`} description="Click Edit Pricing to modify the pricing matrix.">
          <div className="divide-y divide-white/10">
            {rooms.map((r) => (
              <div key={r.id} className="py-4 space-y-3">
                <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_0.6fr_auto] lg:items-center">
                  <div className="flex items-center gap-3">
                    <img src={r.image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'64\' viewBox=\'0 0 80 64\'%3E%3Crect fill=\'%2327272a\' width=\'80\' height=\'64\'/%3E%3Ctext x=\'40\' y=\'36\' text-anchor=\'middle\' fill=\'%2371717a\' font-size=\'8\' font-family=\'sans-serif\'%3ENo photo%3C/text%3E%3C/svg%3E'}
                      alt={r.name} className="h-16 w-20 shrink-0 rounded-xl object-cover border border-white/10" />
                    <div>
                      <div className="font-medium text-white">{r.name}</div>
                      <div className="text-xs text-stone-400">{r.min_group}–{r.max_group} guests</div>
                    </div>
                  </div>
                  <div className="text-sm text-stone-300">
                    <div className="font-medium text-amber-300">{r.pricing?.length || 0} pricing tiers</div>
                    <div className="text-stone-400 text-xs">1.5h / 2h / 3h × with & without cake</div>
                  </div>
                  <div className="text-xs text-stone-400 line-clamp-2">{r.description}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEditor(r)}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/10">Edit Pricing</button>
                  <button type="button" onClick={() => deleteRoom(r)}
                    className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20">Delete</button>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <EmptyState message="No rooms configured yet." />}
          </div>
        </ListPanel>
      </div>

      {editorOpen && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60" onClick={closeEditor} />
          <div className="relative w-full max-w-6xl mx-2 overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-700 bg-stone-950 shadow-2xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="border-b border-stone-800 bg-stone-900/80 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[10px] font-sans uppercase tracking-widest text-amber-400">Room Editor</div>
                <h4 className="text-sm font-serif font-semibold text-stone-100">{editingRoom ? 'Edit' : 'New'} Room & Pricing Matrix</h4>
              </div>
              <button type="button" onClick={closeEditor}
                className="rounded-full bg-stone-800 p-1.5 text-stone-400 hover:bg-stone-700 hover:text-stone-100 transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Room Name">
                  <Input value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} required />
                </Field>
                <Field label="Room Photo">
                  {draft.image && (
                    <img src={draft.image} alt="Room" className="mb-2 h-32 w-48 rounded-xl border border-stone-700 object-cover" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    if (file) setDraft((p) => p ? { ...p, image: URL.createObjectURL(file) } : p);
                  }} className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-400 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-300" />
                  {imageFile && <p className="mt-1 text-xs text-stone-500">{imageFile.name}</p>}
                </Field>
                <Field label="Min Group Size">
                  <input type="number" value={draft.min_group} onChange={(e) => setDraft({ ...draft, min_group: Number(e.target.value) })} min={1} max={draft.max_group}
                    className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20" />
                </Field>
                <Field label="Max Group Size">
                  <input type="number" value={draft.max_group} onChange={(e) => setDraft({ ...draft, max_group: Number(e.target.value) })} min={draft.min_group} max={50}
                    className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Textarea value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} required />
                  </Field>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-serif font-semibold text-stone-100">Pricing Matrix</h4>
                  <p className="text-xs text-stone-500">Per-person rates in Philippine Pesos (₱). Toggle with_cake per tier.</p>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-950/60">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-stone-800 bg-stone-900/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400">Duration</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-stone-400">With Cake</th>
                        {GUEST_SIZES.map((s) => (
                          <th key={s} className="px-2 py-3 text-center text-xs font-semibold text-stone-400">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {draft.pricing.map((tier, i) => (
                        <tr key={i} className="border-b border-stone-900 hover:bg-stone-900/40">
                          <td className="px-4 py-2.5 text-sm font-bold text-stone-200">
                            {tier.duration === '1.5' ? '1.5h' : `${tier.duration}h`}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <label className="inline-flex cursor-pointer items-center gap-2">
                              <input type="checkbox" checked={tier.with_cake} onChange={() => toggleTierCake(i)}
                                className="h-4 w-4 rounded border-stone-600 bg-stone-950 text-amber-500 focus:ring-0" />
                              <span className="text-xs text-stone-400">{tier.with_cake ? 'Yes' : 'No'}</span>
                            </label>
                          </td>
                          {GUEST_SIZES.map((s) => (
                            <td key={s} className="px-1 py-1.5">
                              <input type="number" value={tier.per_person_rates[s] ?? 0}
                                onChange={(e) => updateTierRate(i, s, Number(e.target.value))}
                                min={0} className="w-full rounded-lg border border-stone-700 bg-stone-950 px-2 py-1.5 text-right text-sm text-amber-300 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-800 bg-stone-900/80 px-6 py-4 flex flex-col sm:flex-row gap-2 justify-end shrink-0">
              <ActionButton variant="ghost" onClick={closeEditor}>Cancel</ActionButton>
              <ActionButton onClick={saveRoom}>Save Room</ActionButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
