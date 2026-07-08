import { Head, router, usePage } from '@inertiajs/react';
import { ActionButton, StatusPill, EmptyState, ListPanel } from '@/components/soul-sips-ui';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { confirm as confirmRoute, cancel, refund, destroy } from '@/routes/admin/payments';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Refunded';
  receipt_url: string | null;
  paid_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_name: string;
  date: string;
  time: string;
}

interface Props {
  payments: Payment[];
  bookings: Booking[];
}

export default function AdminPaymentsIndex({ payments, bookings }: Props) {
  const { auth } = usePage<{ auth: { user: { role: string; name: string } } }>().props;
  const isAdmin = auth.user.role === 'admin';

  const bookingMap = new Map(bookings.map((b) => [b.id, b]));

  const confirmedCount = payments.filter((p) => p.status === 'Confirmed').length;
  const pendingCount = payments.filter((p) => p.status === 'Pending').length;

  const handleConfirm = (pmt: Payment) => {
    router.post(confirmRoute.url({ payment: pmt.id }), {}, { preserveScroll: true });
  };

  const handleCancel = (pmt: Payment) => {
    router.post(cancel.url({ payment: pmt.id }), {}, { preserveScroll: true });
  };

  const handleRefund = (pmt: Payment) => {
    router.post(refund.url({ payment: pmt.id }), {}, { preserveScroll: true });
  };

  const handleDelete = (pmt: Payment) => {
    if (confirm(`Delete payment of ${formatCurrency(pmt.amount)}?`)) {
      router.delete(destroy.url({ payment: pmt.id }), { preserveScroll: true });
    }
  };

  return (
    <>
      <Head title="Payments - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-stone-100">Payments</h2>
            <p className="mt-1 text-sm text-stone-400">
              {isAdmin ? 'Admin' : 'Staff Access'} &middot; {auth.user.name}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Total Payments</div>
            <div className="mt-2 text-3xl font-serif font-bold text-stone-100">{payments.length}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Confirmed</div>
            <div className="mt-2 text-3xl font-serif font-bold text-emerald-400">{confirmedCount}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Pending</div>
            <div className="mt-2 text-3xl font-serif font-bold text-amber-300">{pendingCount}</div>
          </div>
        </div>

        <ListPanel title="All Payments" description="View and manage every payment received.">
          <div className="divide-y divide-white/10">
            {payments.length === 0 && <EmptyState message="No payments recorded yet." />}
            {payments.map((pmt) => {
              const booking = bookingMap.get(pmt.booking_id);

              return (
                <div key={pmt.id} className="py-4 space-y-3">
                  <div className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr_auto] lg:items-start">
                    <div>
                      <div className="text-sm font-medium text-stone-400">Booking</div>
                      <div className="font-medium text-white">{booking?.name ?? 'Unknown'}</div>
                      <div className="text-sm text-stone-400">{booking?.email}</div>
                      {booking?.phone && <div className="text-sm text-stone-400">{booking.phone}</div>}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-400">Room &amp; Schedule</div>
                      <div className="text-white">{booking?.room_name}</div>
                      <div className="text-sm text-stone-400">
                        {booking?.date ? formatDate(booking.date) : ''} at {booking?.time ? formatTime(booking.time) : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-serif font-bold text-amber-400">{formatCurrency(pmt.amount)}</div>
                      <div className="mt-1"><StatusPill status={pmt.status} compact /></div>
                      {pmt.paid_at && <div className="mt-1 text-xs text-stone-500">Paid {formatDate(pmt.paid_at)}</div>}
                      {pmt.confirmed_at && <div className="text-xs text-stone-500">Confirmed {formatDate(pmt.confirmed_at)}</div>}
                    </div>
                  </div>

                  {pmt.receipt_url && (
                    <div>
                      <a href={pmt.receipt_url} target="_blank" rel="noopener noreferrer">
                        <img src={pmt.receipt_url} alt="Receipt" className="h-20 w-20 rounded-lg border border-stone-700 object-cover" />
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {pmt.status === 'Pending' && (
                      <>
                        <ActionButton variant="ghost" onClick={() => handleConfirm(pmt)}>
                          Confirm
                        </ActionButton>
                        <ActionButton variant="ghost" onClick={() => handleCancel(pmt)}>
                          Cancel
                        </ActionButton>
                      </>
                    )}
                    {pmt.status === 'Confirmed' && (
                      <ActionButton variant="ghost" onClick={() => handleRefund(pmt)}>
                        Refund
                      </ActionButton>
                    )}
                    {isAdmin && (
                      <ActionButton variant="ghost" onClick={() => handleDelete(pmt)}
                        className="!border-rose-400/20 !bg-rose-500/10 !text-rose-300 hover:!bg-rose-500/20">
                        Delete
                      </ActionButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ListPanel>
      </div>
    </>
  );
}
