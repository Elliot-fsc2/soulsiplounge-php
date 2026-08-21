<?php

namespace App\Http\Controllers\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;

class SalesReportController
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'monthly');
        $from = $request->input('from');
        $to = $request->input('to');

        [$startDate, $endDate, $groupFormat, $dateParseFormat] = match ($period) {
            'daily' => [now()->subDays(30), now(), 'Y-m-d', 'Y-m-d'],
            'weekly' => [now()->subWeeks(12), now(), 'Y-W', 'Y-\WW'],
            'monthly' => [now()->subMonths(12), now(), 'Y-m', 'Y-m'],
            'yearly' => [now()->subYears(5), now(), 'Y', 'Y'],
            'custom' => [Carbon::parse($from ?: now()->subMonth()), Carbon::parse($to ?: now()), 'Y-m-d', 'Y-m-d'],
            default => [now()->subMonths(12), now(), 'Y-m', 'Y-m'],
        };

        // Booking payments (confirmed)
        $payments = Payment::where('status', 'Confirmed')
            ->whereBetween('confirmed_at', [$startDate, $endDate->endOfDay()])
            ->get();

        // POS orders (paid)
        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('updated_at', [$startDate, $endDate->endOfDay()])
            ->get();

        // KPI totals
        $totalRevenue = $payments->sum('amount') + $orders->sum('total');
        $totalOrders = $orders->count();
        $confirmedBookings = $payments->count();
        $averageOrderValue = $totalOrders > 0 ? (int) round($orders->sum('total') / $totalOrders) : 0;

        // Revenue by period for chart
        $periods = collect();
        $periodGenerator = CarbonPeriod::create($startDate, $endDate);

        if ($period === 'weekly') {
            $periodGenerator = CarbonPeriod::create($startDate, $endDate)->weeks();
        } elseif ($period === 'monthly') {
            $periodGenerator = CarbonPeriod::create($startDate, $endDate)->months();
        } elseif ($period === 'yearly') {
            $periodGenerator = CarbonPeriod::create($startDate, $endDate)->years();
        }

        $revenueByPeriod = collect();

        if ($period === 'daily' || $period === 'custom') {
            $periodGenerator = CarbonPeriod::create($startDate, $endDate);
            foreach ($periodGenerator as $date) {
                $label = $date->format('M d');
                $key = $date->format('Y-m-d');
                $periodPayments = $payments->filter(fn ($p) => $p->confirmed_at?->format('Y-m-d') === $key);
                $periodOrders = $orders->filter(fn ($o) => $o->updated_at->format('Y-m-d') === $key);
                $revenueByPeriod->push([
                    'period' => $label,
                    'bookingRevenue' => $periodPayments->sum('amount'),
                    'posRevenue' => $periodOrders->sum('total'),
                    'orders' => $periodOrders->count(),
                    'bookings' => $periodPayments->count(),
                ]);
            }
        } elseif ($period === 'weekly') {
            foreach ($periodGenerator as $date) {
                $weekStart = $date->copy()->startOfWeek();
                $weekEnd = $date->copy()->endOfWeek();
                $label = $weekStart->format('M d').' - '.$weekEnd->format('M d');
                $periodPayments = $payments->filter(fn ($p) => $p->confirmed_at?->between($weekStart, $weekEnd));
                $periodOrders = $orders->filter(fn ($o) => $o->updated_at->between($weekStart, $weekEnd));
                $revenueByPeriod->push([
                    'period' => $label,
                    'bookingRevenue' => $periodPayments->sum('amount'),
                    'posRevenue' => $periodOrders->sum('total'),
                    'orders' => $periodOrders->count(),
                    'bookings' => $periodPayments->count(),
                ]);
            }
        } elseif ($period === 'monthly') {
            foreach ($periodGenerator as $date) {
                $label = $date->format('M Y');
                $key = $date->format('Y-m');
                $periodPayments = $payments->filter(fn ($p) => $p->confirmed_at?->format('Y-m') === $key);
                $periodOrders = $orders->filter(fn ($o) => $o->updated_at->format('Y-m') === $key);
                $revenueByPeriod->push([
                    'period' => $label,
                    'bookingRevenue' => $periodPayments->sum('amount'),
                    'posRevenue' => $periodOrders->sum('total'),
                    'orders' => $periodOrders->count(),
                    'bookings' => $periodPayments->count(),
                ]);
            }
        } elseif ($period === 'yearly') {
            foreach ($periodGenerator as $date) {
                $label = $date->format('Y');
                $key = $date->format('Y');
                $periodPayments = $payments->filter(fn ($p) => $p->confirmed_at?->format('Y') === $key);
                $periodOrders = $orders->filter(fn ($o) => $o->updated_at->format('Y') === $key);
                $revenueByPeriod->push([
                    'period' => $label,
                    'bookingRevenue' => $periodPayments->sum('amount'),
                    'posRevenue' => $periodOrders->sum('total'),
                    'orders' => $periodOrders->count(),
                    'bookings' => $periodPayments->count(),
                ]);
            }
        }

        // Top selling products
        $topProducts = OrderItem::selectRaw('product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
            ->whereHas('order', fn ($q) => $q->where('payment_status', 'paid')
                ->whereBetween('updated_at', [$startDate, $endDate->endOfDay()]))
            ->groupBy('product_name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Recent transactions (merged payments + orders)
        $recentPayments = $payments->sortByDesc('confirmed_at')->take(20)->map(fn ($p) => [
            'id' => $p->id,
            'date' => $p->confirmed_at?->toISOString(),
            'source' => 'Booking',
            'customer' => $p->booking?->name ?? 'N/A',
            'amount' => $p->amount,
            'status' => $p->status,
        ]);

        $recentOrders = $orders->sortByDesc('updated_at')->take(20)->map(fn ($o) => [
            'id' => $o->id,
            'date' => $o->updated_at->toISOString(),
            'source' => 'POS Order',
            'customer' => $o->booking?->name ?? 'Walk-in',
            'amount' => $o->total,
            'status' => $o->payment_status,
        ]);

        $recentTransactions = $recentPayments->concat($recentOrders)
            ->sortByDesc('date')
            ->take(20)
            ->values();

        return inertia('admin/sales-report/index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'confirmedBookings' => $confirmedBookings,
                'averageOrderValue' => $averageOrderValue,
            ],
            'revenueByPeriod' => $revenueByPeriod,
            'topProducts' => $topProducts,
            'recentTransactions' => $recentTransactions,
            'period' => $period,
            'from' => $from,
            'to' => $to,
        ]);
    }
}
