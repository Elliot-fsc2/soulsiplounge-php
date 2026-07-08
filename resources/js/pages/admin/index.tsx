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

const statCards = [
    { label: 'Total Bookings', key: 'totalBookings' as const, format: (v: number) => v.toString() },
    { label: 'Total Revenue', key: 'totalRevenue' as const, format: (v: number) => formatCurrency(v) },
    { label: 'Confirmed', key: 'confirmedBookings' as const, format: (v: number) => v.toString() },
    { label: 'Pending', key: 'pendingBookings' as const, format: (v: number) => v.toString() },
    { label: 'Cancelled', key: 'cancelledBookings' as const, format: (v: number) => v.toString() },
    { label: 'New Contacts', key: 'newContacts' as const, format: (v: number) => v.toString() },
];

const quickLinks = [
    { href: '/admin/bookings', title: 'Bookings', desc: 'Manage reservations' },
    { href: '/admin/contacts', title: 'Contacts Inbox', desc: 'View messages' },
    { href: '/admin/payments', title: 'Payments', desc: 'Review transactions' },
    { href: '/admin/rooms', title: 'Rooms', desc: 'Configure spaces' },
    { href: '/admin/vouchers', title: 'Vouchers', desc: 'Promo codes' },
    { href: '/admin/analytics', title: 'Analytics', desc: 'Insights & reports' },
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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((card) => (
                        <div key={card.key} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                            <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">{card.label}</div>
                            <div className="mt-2 text-3xl font-serif font-bold text-stone-100">{card.format(stats[card.key])}</div>
                        </div>
                    ))}
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
