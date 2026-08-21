<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load('items');

        return response()->json([
            'status' => 'success',
            'data' => new InvoiceResource($invoice),
        ]);
    }
}
