<?php

namespace App\Http\Controllers\Staff;

use App\Models\Product;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController
{
    public function index(Request $request)
    {
        $products = Product::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $rooms = Room::orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'pricing']);

        return Inertia::render('staff/pos', [
            'products' => $products,
            'rooms' => $rooms,
        ]);
    }
}
