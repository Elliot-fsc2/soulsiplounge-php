import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { TrendingUp, ShoppingCart, CalendarCheck, Banknote } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    confirmedBookings: number;
    averageOrderValue: number;
}

interface RevenuePeriod {
    period: string;
    bookingRevenue: number;
    posRevenue: number;
    orders: number;
    bookings: number;
}

interface TopProduct {
    product_name: string;
    total_qty: number;
    total_revenue: number;
}

interface Transaction {
    id: string;
    date: string;
    source: string;
    customer: string;
    amount: number;
    status: string;
}

interface Props {
    stats: Stats;
    revenueByPeriod: RevenuePeriod[];
    topProducts: TopProduct[];
    recentTransactions: Transaction[];
    period: string;
    from?: string;
    to?: string;
}

const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
];

const chartConfig = {
    bookingRevenue: {
        label: 'Booking Revenue',
        color: 'var(--chart-1)',
    },
    posRevenue: {
        label: 'POS Revenue',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export default function AdminSalesReportIndex({ stats, revenueByPeriod, topProducts, recentTransactions, period, from, to }: Props) {
    const [customFrom, setCustomFrom] = useState(from ?? '');
    const [customTo, setCustomTo] = useState(to ?? '');

    const handlePeriodChange = (newPeriod: string) => {
        if (newPeriod === 'custom') {
            router.get('/admin/sales-report', { period: newPeriod, from: customFrom, to: customTo }, { preserveScroll: true });
        } else {
            router.get('/admin/sales-report', { period: newPeriod }, { preserveScroll: true });
        }
    };

    const handleCustomFilter = () => {
        router.get('/admin/sales-report', { period: 'custom', from: customFrom, to: customTo }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Sales Report - Soul Sips Lounge" />

            <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-semibold text-stone-100">Sales Report</h2>
                        <p className="mt-1 text-sm text-stone-400">Revenue insights across bookings and POS orders</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {periods.map((p) => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePeriodChange(p.value)}
                        >
                            {p.label}
                        </Button>
                    ))}
                    {period === 'custom' && (
                        <div className="flex items-center gap-2 ml-2">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-1.5 text-sm text-stone-100"
                            />
                            <span className="text-stone-500">to</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-1.5 text-sm text-stone-100"
                            />
                            <Button variant="default" size="sm" onClick={handleCustomFilter}>Go</Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-stone-400">Total Revenue</CardTitle>
                            <Banknote className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-100">{formatCurrency(stats.totalRevenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-stone-400">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-sky-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-100">{stats.totalOrders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-stone-400">Confirmed Bookings</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-100">{stats.confirmedBookings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-stone-400">Avg Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-100">{formatCurrency(stats.averageOrderValue)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>
                            {period === 'daily' && 'Last 30 days'}
                            {period === 'weekly' && 'Last 12 weeks'}
                            {period === 'monthly' && 'Last 12 months'}
                            {period === 'yearly' && 'Last 5 years'}
                            {period === 'custom' && 'Custom range'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                            <BarChart data={revenueByPeriod}>
                                <CartesianGrid vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="period"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="bookingRevenue" fill="var(--color-bookingRevenue)" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="posRevenue" fill="var(--color-posRevenue)" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>Best-selling items by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length === 0 ? (
                                <p className="text-sm text-stone-500">No product sales data for this period.</p>
                            ) : (
                                <div className="divide-y divide-stone-800">
                                    {topProducts.map((product, i) => (
                                        <div key={product.product_name} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-stone-500 w-5">{i + 1}.</span>
                                                <div>
                                                    <div className="text-sm font-medium text-stone-200">{product.product_name}</div>
                                                    <div className="text-xs text-stone-500">Qty: {product.total_qty}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-amber-400">{formatCurrency(product.total_revenue)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest payments and orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length === 0 ? (
                                <p className="text-sm text-stone-500">No transactions for this period.</p>
                            ) : (
                                <div className="divide-y divide-stone-800">
                                    {recentTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <div className="text-sm font-medium text-stone-200">{tx.customer}</div>
                                                <div className="text-xs text-stone-500">{tx.source} &middot; {new Date(tx.date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-amber-400">{formatCurrency(tx.amount)}</div>
                                                <div className={`text-xs ${tx.status === 'paid' || tx.status === 'Confirmed' ? 'text-emerald-400' : tx.status === 'Pending' ? 'text-amber-300' : 'text-stone-500'}`}>
                                                    {tx.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
