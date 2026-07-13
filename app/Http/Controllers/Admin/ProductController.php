<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductCategory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;

class ProductController
{
    public function index()
    {
        $products = Product::orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => ['required', 'string', new Enum(ProductCategory::class)],
            'price' => 'required|integer|min:0',
            'active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        Product::create($validated);

        return redirect()->back()->with('success', 'Product created successfully!');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => ['required', 'string', new Enum(ProductCategory::class)],
            'price' => 'required|integer|min:0',
            'active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully!');
    }
}
