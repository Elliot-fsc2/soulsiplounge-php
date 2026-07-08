import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ActionButton, StatusPill, EmptyState, ListPanel, Field, Input, Textarea } from '@/components/soul-sips-ui';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { update, destroy } from '@/routes/admin/bookings';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_name: string;
  guest_count: number;
  duration: string;
  with_cake: boolean;
  date: string;
  time: string;
  per_person_price: number;
  total_price: number;
  status: string;
  notes: string;
}

interface Props {
  bookings: Booking[];
}

export default function AdminBookingsIndex({ bookings }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Pending', notes: '' });

  const openEdit = (b: Booking) => {
    setEditingId(b.id);
    setForm({ name: b.name, email: b.email, phone: b.phone, status: b.status, notes: b.notes });
  };

  const closeEdit = () => setEditingId(null);

  const saveBooking = (b: Booking) => {
    router.put(update.url({ booking: b.id }), form, {
      preserveScroll: true,
      onSuccess: () => closeEdit(),
    });
  };

  const deleteBooking = (b: Booking) => {
    if (confirm(`Delete reservation for ${b.name}?`)) {
      router.delete(destroy.url({ booking: b.id }), { preserveScroll: true });
    }
  };

  return (
    <>
      <Head title="Booking Management - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-serif font-semibold text-stone-100">Booking Management</h2>

        <ListPanel title="All Reservations" description="Manage every room reservation.">
          <div className="divide-y divide-white/10">
            {bookings.map((b) => (
              <div key={b.id} className="py-4 space-y-3">
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_0.6fr_auto] lg:items-start">
                  <div>
                    <div className="font-medium text-white">{b.name}</div>
                    <div className="text-sm text-stone-400">{b.email} · {b.phone}</div>
                  </div>
                  <div className="text-sm text-stone-300">
                    <div className="font-medium text-amber-300">{b.room_name}</div>
                    <div className="text-stone-400 text-xs">{formatDate(b.date)} at {formatTime(b.time)}</div>
                    <div className="text-[11px] text-stone-400 mt-1">{b.guest_count} pax · {b.duration === '1.5' ? '1.5h' : `${b.duration}h`} · {b.with_cake ? 'with cake' : 'no cake'}</div>
                    {b.notes && <div className="mt-1 text-[11px] text-stone-500 italic">"{b.notes}"</div>}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-base font-bold text-white">{formatCurrency(b.total_price)}</div>
                    <div className="text-[10px] text-stone-400">{formatCurrency(b.per_person_price)} / person</div>
                    <StatusPill status={b.status} />
                  </div>
                </div>

                {editingId === b.id ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name">
                        <Input value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                      </Field>
                      <Field label="Email">
                        <Input value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} type="email" />
                      </Field>
                      <Field label="Phone">
                        <Input value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} type="tel" />
                      </Field>
                      <Field label="Status">
                        <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                          className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                          {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Notes">
                      <Textarea value={form.notes} onChange={(v) => setForm((p) => ({ ...p, notes: v }))} rows={2} />
                    </Field>
                    <div className="flex gap-2">
                      <ActionButton onClick={() => saveBooking(b)}>Save</ActionButton>
                      <ActionButton variant="ghost" onClick={closeEdit}>Cancel</ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEdit(b)}
                      className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/10">Edit</button>
                    <button type="button" onClick={() => deleteBooking(b)}
                      className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20">Delete</button>
                  </div>
                )}
              </div>
            ))}
            {bookings.length === 0 && <EmptyState message="No reservations yet." />}
          </div>
        </ListPanel>
      </div>
    </>
  );
}
