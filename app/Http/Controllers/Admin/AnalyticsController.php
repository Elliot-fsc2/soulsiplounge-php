<?php

namespace App\Http\Controllers\Admin;

use App\Models\Booking;
use App\Models\Payment;

class AnalyticsController
{
    public function index()
    {
        $totalBookings = Booking::count();
        $totalRevenue = Payment::where('status', 'Confirmed')->sum('amount');
        $confirmedBookings = Booking::where('status', 'Confirmed')->count();
        $pendingBookings = Booking::where('status', 'Pending')->count();
        $cancelledBookings = Booking::where('status', 'Cancelled')->count();

        return [
            'totalBookings' => $totalBookings,
            'totalRevenue' => $totalRevenue,
            'confirmedBookings' => $confirmedBookings,
            'pendingBookings' => $pendingBookings,
            'cancelledBookings' => $cancelledBookings,
        ];
    }
}
