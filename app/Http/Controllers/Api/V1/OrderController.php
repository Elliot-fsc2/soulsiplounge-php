<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Invoice\GenerateInvoice;
use App\Actions\Order\CancelOrder;
use App\Actions\Order\CreateOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PayOrderRequest;
use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private CreateOrder $createOrder,
        private CancelOrder $cancelOrder,
        private GenerateInvoice $generateInvoice,
    ) {}

    public function index(): JsonResponse
    {
        $orders = Order::with('items', 'user', 'room')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => OrderResource::collection($orders),
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->createOrder->execute(
                user: $request->user(),
                items: $request->validated('items'),
                bookingId: $request->validated('booking_id'),
                roomId: $request->validated('room_id'),
                guestCount: $request->validated('guest_count'),
                roomDuration: $request->validated('room_duration'),
                rooms: $request->validated('rooms') ?? [],
                notes: $request->validated('notes'),
            );

            if ($paymentMethod = $request->validated('payment_method')) {
                $amountTendered = $request->validated('amount_tendered');

                $order->update([
                    'payment_method' => $paymentMethod,
                    'payment_status' => 'paid',
                    'status' => 'completed',
                    'amount_tendered' => $amountTendered,
                    'change' => $amountTendered !== null
                        ? max(0, $amountTendered - $order->total) : null,
                ]);
            }

            $invoice = $this->generateInvoice->execute($order->fresh());

            return response()->json([
                'status' => 'success',
                'data' => [
                    'order' => new OrderResource($order->fresh('items', 'user', 'room')),
                    'invoice' => new InvoiceResource($invoice),
                ],
            ], 201);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'items' => $e->getMessage(),
            ]);
        }
    }

    public function show(Order $order): JsonResponse
    {
        $order->load('items', 'user', 'room');

        return response()->json([
            'status' => 'success',
            'data' => new OrderResource($order),
        ]);
    }

    public function cancel(Order $order): JsonResponse
    {
        try {
            $this->cancelOrder->execute($order->id);

            return response()->json([
                'status' => 'success',
                'message' => 'Order cancelled successfully.',
                'data' => new OrderResource($order->fresh('items')),
            ]);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'order' => $e->getMessage(),
            ]);
        }
    }

    public function pay(PayOrderRequest $request, Order $order): JsonResponse
    {
        if ($order->payment_status === 'paid') {
            throw ValidationException::withMessages([
                'payment' => 'Order is already paid.',
            ]);
        }

        $amountTendered = $request->validated('amount_tendered');

        $order->update([
            'payment_method' => $request->validated('payment_method'),
            'payment_status' => 'paid',
            'status' => 'completed',
            'amount_tendered' => $amountTendered,
            'change' => $amountTendered !== null
                ? max(0, $amountTendered - $order->total) : null,
        ]);

        $invoice = $this->generateInvoice->execute($order);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment recorded successfully.',
            'data' => [
                'order' => new OrderResource($order->fresh('items', 'user', 'room')),
                'invoice' => new InvoiceResource($invoice),
            ],
        ]);
    }
}
