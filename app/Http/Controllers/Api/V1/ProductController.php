<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductCategory;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => ['nullable', Rule::enum(ProductCategory::class)],
        ]);

        $query = Product::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        return response()->json([
            'status' => 'success',
            'data' => ProductResource::collection($query->get()),
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new ProductResource($product),
        ]);
    }
}
