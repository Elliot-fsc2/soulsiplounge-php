import { Head, Link } from '@inertiajs/react';
import { formatCurrency } from '@/lib/format';

interface Stats {
    totalBookings: number;
    totalRevenue: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    newContacts: number;
}

interface Props {
    stats: Stats;
}

const quickLinks = [
    { href: '/admin/bookings', title: 'Bookings', desc: 'Manage reservations' },
    { href: '/admin/contacts', title: 'Contacts Inbox', desc: 'View messages' },
    { href: '/admin/payments', title: 'Payments', desc: 'Review transactions' },
    { href: '/admin/rooms', title: 'Rooms', desc: 'Configure spaces' },
    { href: '/admin/vouchers', title: 'Vouchers', desc: 'Promo codes' },
    { href: '/admin/settings', title: 'Settings', desc: 'Site configuration' },
];

export default function AdminIndex({ stats }: Props) {
    return (
        <>
            <Head title="Admin Dashboard - Soul Sips Lounge" />

            <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-100">Admin Dashboard</h1>
                    <p className="mt-1 text-stone-400">Overview of your lounge at a glance.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
                    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                        <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">New Contacts</div>
                        <div className="mt-2 text-3xl font-serif font-bold text-sky-300">{stats.newContacts}</div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-100 mb-4">Quick Links</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-amber-500/40 hover:bg-stone-800 transition block"
                            >
                                <h3 className="font-semibold text-stone-100">{link.title}</h3>
                                <p className="mt-1 text-sm text-stone-400">{link.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
