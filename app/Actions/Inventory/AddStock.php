<?php

namespace App\Actions\Inventory;

use App\Enums\InventoryTransactionType;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;

class AddStock
{
    public function execute(InventoryItem $item, float $quantity, ?string $notes = null): void
    {
        $item->increment('current_stock', $quantity);

        InventoryTransaction::create([
            'inventory_item_id' => $item->id,
            'type' => InventoryTransactionType::In,
            'quantity' => $quantity,
            'reference_type' => 'delivery',
            'notes' => $notes,
        ]);
    }

    public function byId(string $inventoryItemId, float $quantity, ?string $notes = null): void
    {
        $item = InventoryItem::findOrFail($inventoryItemId);

        $this->execute($item, $quantity, $notes);
    }
}
