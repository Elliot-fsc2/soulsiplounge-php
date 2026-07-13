<?php

namespace App\Actions\Inventory;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryItem;
use App\Models\InventoryRecipe;
use App\Models\InventoryTransaction;
use App\Models\Product;

class DeductStock
{
    public function execute(Product $product, int $quantity, string $referenceId, string $referenceType = 'order'): void
    {
        $recipes = InventoryRecipe::where('product_id', $product->id)->get();

        foreach ($recipes as $recipe) {
            $item = $recipe->inventoryItem;
            $deductQty = $recipe->quantity_per_unit * $quantity;

            $item->decrement('current_stock', $deductQty);

            InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'type' => InventoryTransactionType::Out,
                'quantity' => $deductQty,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]);
        }
    }

    public function simple(string $inventoryItemId, float $quantity, string $referenceId, string $referenceType = 'order'): void
    {
        $item = InventoryItem::findOrFail($inventoryItemId);
        $item->decrement('current_stock', $quantity);

        InventoryTransaction::create([
            'inventory_item_id' => $item->id,
            'type' => InventoryTransactionType::Out,
            'quantity' => $quantity,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
        ]);
    }
}
