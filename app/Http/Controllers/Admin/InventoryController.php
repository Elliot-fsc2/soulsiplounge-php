<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Inventory\AddStock;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InventoryController
{
    public function __construct(
        private AddStock $addStock,
    ) {}

    public function index()
    {
        $items = InventoryItem::orderBy('name')->get();

        return Inertia::render('admin/inventory/index', [
            'items' => $items,
        ]);
    }

    public function addStock(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $this->addStock->execute($inventoryItem, $validated['quantity'], $request->input('notes'));

        return redirect()->back()->with('success', 'Stock added successfully!');
    }

    public function adjust(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric',
        ]);

        $newStock = $inventoryItem->current_stock + $validated['quantity'];

        if ($newStock < 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Insufficient stock. Current stock: '.$inventoryItem->current_stock,
            ]);
        }

        $inventoryItem->update(['current_stock' => $newStock]);

        return redirect()->back()->with('success', 'Stock adjusted successfully!');
    }

    public function weeklyRestock(Request $request)
    {
        $items = InventoryItem::whereNotNull('weekly_delivery_day')
            ->where('weekly_delivery_qty', '>', 0)
            ->get();

        foreach ($items as $item) {
            $this->addStock->execute($item, $item->weekly_delivery_qty, 'Weekly restock ('.$item->weekly_delivery_day.')');
        }

        return redirect()->back()->with('success', 'Weekly restock completed!');
    }
}
