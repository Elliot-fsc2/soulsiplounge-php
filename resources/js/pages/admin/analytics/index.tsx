import { Head } from '@inertiajs/react';
import { formatCurrency } from '@/lib/format';

interface AnalyticsStats {
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  newContacts: number;
}

interface Props {
  stats: AnalyticsStats;
}

export default function AdminAnalyticsIndex({ stats }: Props) {
  return (
    <>
      <Head title="Analytics - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-serif font-semibold text-stone-100">Analytics</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Total Bookings</div>
            <div className="mt-2 text-3xl font-serif font-bold text-stone-100">{stats.totalBookings}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Total Revenue</div>
            <div className="mt-2 text-3xl font-serif font-bold text-amber-400">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Confirmed</div>
            <div className="mt-2 text-3xl font-serif font-bold text-emerald-400">{stats.confirmedBookings}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Pending</div>
            <div className="mt-2 text-3xl font-serif font-bold text-amber-300">{stats.pendingBookings}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">Cancelled</div>
            <div className="mt-2 text-3xl font-serif font-bold text-rose-400">{stats.cancelledBookings}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
          <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">New Contacts</div>
          <div className="mt-2 text-3xl font-serif font-bold text-sky-300">{stats.newContacts}</div>
          <div className="mt-1 text-xs text-stone-500">Unread messages from contact form</div>
        </div>
      </div>
    </>
  );
}
