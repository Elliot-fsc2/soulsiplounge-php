<?php

namespace Database\Seeders;

use App\Enums\ProductCategory;
use App\Models\InventoryItem;
use App\Models\InventoryRecipe;
use App\Models\Product;
use Illuminate\Database\Seeder;

class PosSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedProducts();
        $this->seedInventory();
        $this->seedRecipes();
    }

    private function seedProducts(): void
    {
        $sort = 0;


        // ── Beverages (all 207 pesos) ──
        $beverages = [
            'Iced Arigamatcha (Matcha Latte)',
            'Hot Arigamatcha (Matcha Latte)',
            'Iced Latte',
            'Hot Latte',
            'Iced Americano',
            'Iced Caramel Latte',
            'Hot Caramel Latte',
            'Iced White Chocolate Latte',
            'Hot White Chocolate Latte',
            'Iced Colonizer Latte (Spanish Latte)',
            'Hot Colonizer Latte (Spanish Latte)',
            'Iced Matcha Latte',
            'Hot Matcha Latte',
        ];

        foreach ($beverages as $name) {
            Product::create([
                'name' => $name,
                'category' => ProductCategory::Beverage,
                'price' => 207,
                'sort_order' => $sort += 10,
            ]);
        }

        // ── Snacks ──
        Product::create([
            'name' => 'Large Chocolate Cream Puff',
            'category' => ProductCategory::Snack,
            'price' => 70,
            'sort_order' => $sort += 10,
        ]);

        Product::create([
            'name' => 'Cookie',
            'category' => ProductCategory::Snack,
            'price' => 70,
            'sort_order' => $sort += 10,
        ]);
    }

    private function seedInventory(): void
    {
        InventoryItem::create([
            'name' => 'Coffee Beans',
            'unit' => 'pack (1kg)',
            'current_stock' => 7,
            'min_stock' => 2,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 7,
        ]);

        InventoryItem::create([
            'name' => 'Matcha Powder',
            'unit' => 'pack (200g)',
            'current_stock' => 3,
            'min_stock' => 1,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 3,
        ]);

        InventoryItem::create([
            'name' => 'Whole Milk (Conaprole)',
            'unit' => 'case (12 x 1L)',
            'current_stock' => 10,
            'min_stock' => 2,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 10,
        ]);

        InventoryItem::create([
            'name' => 'Oat Milk (Oatside)',
            'unit' => 'box (6 x 1L)',
            'current_stock' => 1,
            'min_stock' => 1,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 1,
        ]);

        InventoryItem::create([
            'name' => 'Condensed Milk',
            'unit' => 'kg',
            'current_stock' => 2,
            'min_stock' => 1,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 2,
        ]);

        InventoryItem::create([
            'name' => 'Caramel Syrup',
            'unit' => 'bottle (2L)',
            'current_stock' => 2,
            'min_stock' => 1,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 2,
        ]);

        InventoryItem::create([
            'name' => 'White Choco Syrup',
            'unit' => 'bottle (2L)',
            'current_stock' => 2,
            'min_stock' => 1,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 2,
        ]);

        InventoryItem::create([
            'name' => 'Cookies',
            'unit' => 'piece',
            'current_stock' => 144,
            'min_stock' => 24,
            'weekly_delivery_day' => 'Sunday',
            'weekly_delivery_qty' => 144,
            'shelf_life_days' => 7,
        ]);

        InventoryItem::create([
            'name' => 'Chocolate Cream Puffs',
            'unit' => 'piece',
            'current_stock' => 24,
            'min_stock' => 0,
            'shelf_life_days' => 2,
        ]);
    }

    private function seedRecipes(): void
    {
        $products = Product::pluck('id', 'name');
        $inventory = InventoryItem::pluck('id', 'name');

        // Coffee-based drinks → coffee beans + milk
        $coffeeDrinks = [
            'Iced Latte', 'Hot Latte', 'Iced Americano',
            'Iced Caramel Latte', 'Hot Caramel Latte',
            'Iced White Chocolate Latte', 'Hot White Chocolate Latte',
            'Iced Colonizer Latte (Spanish Latte)', 'Hot Colonizer Latte (Spanish Latte)',
        ];

        foreach ($coffeeDrinks as $drink) {
            $productId = $products[$drink] ?? null;
            if (! $productId) {
                continue;
            }

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['Coffee Beans'],
                'quantity_per_unit' => 0.02,
            ]);

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['Whole Milk (Conaprole)'],
                'quantity_per_unit' => 0.25,
            ]);
        }

        // Caramel drinks extra ingredient
        foreach (['Iced Caramel Latte', 'Hot Caramel Latte'] as $drink) {
            $productId = $products[$drink] ?? null;
            if (! $productId) {
                continue;
            }

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['Caramel Syrup'],
                'quantity_per_unit' => 0.02,
            ]);
        }

        // White choco drinks extra ingredient
        foreach (['Iced White Chocolate Latte', 'Hot White Chocolate Latte'] as $drink) {
            $productId = $products[$drink] ?? null;
            if (! $productId) {
                continue;
            }

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['White Choco Syrup'],
                'quantity_per_unit' => 0.02,
            ]);
        }

        // Matcha-based drinks
        $matchaDrinks = [
            'Iced Arigamatcha (Matcha Latte)', 'Hot Arigamatcha (Matcha Latte)',
            'Iced Matcha Latte', 'Hot Matcha Latte',
        ];

        foreach ($matchaDrinks as $drink) {
            $productId = $products[$drink] ?? null;
            if (! $productId) {
                continue;
            }

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['Matcha Powder'],
                'quantity_per_unit' => 0.02,
            ]);

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['Whole Milk (Conaprole)'],
                'quantity_per_unit' => 0.25,
            ]);

            InventoryRecipe::create([
                'product_id' => $productId,
                'inventory_item_id' => $inventory['Condensed Milk'],
                'quantity_per_unit' => 0.02,
            ]);
        }

        // Snacks → simple 1:1
        $cookieId = $products['Cookie'] ?? null;
        if ($cookieId) {
            InventoryRecipe::create([
                'product_id' => $cookieId,
                'inventory_item_id' => $inventory['Cookies'],
                'quantity_per_unit' => 1,
            ]);
        }

        $puffId = $products['Large Chocolate Cream Puff'] ?? null;
        if ($puffId) {
            InventoryRecipe::create([
                'product_id' => $puffId,
                'inventory_item_id' => $inventory['Chocolate Cream Puffs'],
                'quantity_per_unit' => 1,
            ]);
        }
    }
}
