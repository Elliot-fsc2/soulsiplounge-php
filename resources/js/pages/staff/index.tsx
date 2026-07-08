import { Head, Link } from '@inertiajs/react';
import { CreditCard, CalendarCheck, ArrowRight, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Payment, Booking } from '@/types/domain';

interface Stats {
    pendingCount: number;
    pendingTotal: number;
    todayBookingsCount: number;
}

interface Props {
    stats: Stats;
    pendingPayments: Payment[];
    todayBookings: Booking[];
}

const statCards = [
    { label: 'Pending Payments', key: 'pendingCount' as const, icon: CreditCard, format: (v: number) => v.toString() },
    { label: 'Pending Total', key: 'pendingTotal' as const, icon: CreditCard, format: (v: number) => formatCurrency(v) },
    { label: "Today's Bookings", key: 'todayBookingsCount' as const, icon: CalendarCheck, format: (v: number) => v.toString() },
];

export default function StaffIndex({ stats, pendingPayments, todayBookings }: Props) {
    return (
        <>
            <Head title="Staff Dashboard - Soul Sips Lounge" />

            <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-100">Staff Dashboard</h1>
                    <p className="mt-1 text-stone-400">Manage payments and monitor today's activity.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((card) => (
                        <div key={card.key} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
                            <div className="flex items-center gap-2">
                                <card.icon className="size-4 text-amber-500/80" />
                                <div className="text-xs uppercase tracking-wider text-stone-500 font-sans">{card.label}</div>
                            </div>
                            <div className="mt-2 text-3xl font-serif font-bold text-stone-100">{card.format(stats[card.key])}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-serif font-semibold text-stone-100">Pending Payments</h2>
                        <Link href="/admin/payments" className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1">
                            View All <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    <div className="rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden">
                        {pendingPayments.length === 0 ? (
                            <p className="p-6 text-stone-400 text-sm">No pending payments.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-800 text-left text-xs uppercase tracking-wider text-stone-500">
                                        <th className="p-4 font-medium">Booking</th>
                                        <th className="p-4 font-medium">Amount</th>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {pendingPayments.slice(0, 10).map((payment) => (
                                        <tr key={payment.id} className="text-stone-300">
                                            <td className="p-4">{payment.booking?.name ?? 'Unknown'}</td>
                                            <td className="p-4 text-stone-100 font-medium">{formatCurrency(payment.amount)}</td>
                                            <td className="p-4 text-stone-400">{payment.created_at}</td>
                                            <td className="p-4">
                                                <Link
                                                    href={`/admin/payments`}
                                                    className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400"
                                                >
                                                    <Eye className="size-3.5" /> Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-100 mb-4">Quick Links</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Link
                            href="/admin/payments"
                            className="rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-amber-500/40 hover:bg-stone-800 transition block"
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-4 text-amber-500/80" />
                                <span className="font-semibold text-stone-100">Payments</span>
                            </div>
                            <p className="mt-1 text-sm text-stone-400">Confirm, cancel, or refund payments</p>
                        </Link>
                        <Link
                            href="/admin/bookings"
                            className="rounded-2xl border border-stone-800 bg-stone-900 p-5 hover:border-amber-500/40 hover:bg-stone-800 transition block"
                        >
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="size-4 text-amber-500/80" />
                                <span className="font-semibold text-stone-100">Bookings</span>
                            </div>
                            <p className="mt-1 text-sm text-stone-400">View and manage reservations</p>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
