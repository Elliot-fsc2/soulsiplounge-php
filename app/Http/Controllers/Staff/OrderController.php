<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Invoice\GenerateInvoice;
use App\Actions\Order\CancelOrder;
use App\Actions\Order\CreateOrder;
use App\Models\Order;
use App\Services\PrintDispatcher;
use App\Services\PrinterService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController
{
    public function __construct(
        private CreateOrder $createOrder,
        private CancelOrder $cancelOrder,
        private PrinterService $printerService,
        private GenerateInvoice $generateInvoice,
        private PrintDispatcher $printDispatcher,
    ) {}

    public function index()
    {
        return Order::with('items', 'user')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string|in:cash,gcash,card,bank_transfer',
            'amount_tendered' => 'nullable|integer|min:0',
            'booking_id' => 'nullable|string|exists:bookings,id',
            'room_id' => 'nullable|string|exists:rooms,id',
            'guest_count' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $order = $this->createOrder->execute(
                user: $request->user(),
                items: $validated['items'],
                bookingId: $validated['booking_id'] ?? null,
                roomId: $validated['room_id'] ?? null,
                guestCount: $validated['guest_count'] ?? null,
                notes: $validated['notes'] ?? null,
            );

            $order->load('items');

            if (config('printer.print_kitchen_chit') && $order->items->contains(fn ($item) => $item->item_type === 'product')) {
                $this->printerService->printKitchenChit($order);
            }

            if ($paymentMethod = $validated['payment_method'] ?? null) {
                $amountTendered = $validated['amount_tendered'] ?? null;

                $order->update([
                    'payment_method' => $paymentMethod,
                    'payment_status' => 'paid',
                    'status' => 'completed',
                    'amount_tendered' => $amountTendered,
                    'change' => $amountTendered !== null ? max(0, $amountTendered - $order->total) : null,
                ]);
            }

            $this->printDispatcher->send(
                $this->generateInvoice->execute($order->fresh())
            );

            return redirect()->back()->with('success', 'Order created successfully!');
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'items' => $e->getMessage(),
            ]);
        }
    }

    public function show(Order $order)
    {
        return $order->load('items', 'user');
    }

    public function cancel(Request $request, Order $order)
    {
        try {
            $this->cancelOrder->execute($order->id);

            return redirect()->back()->with('success', 'Order cancelled successfully!');
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'order' => $e->getMessage(),
            ]);
        }
    }

    public function pay(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,gcash,card,bank_transfer',
            'amount_tendered' => 'nullable|integer|min:0',
        ]);

        if ($order->payment_status === 'paid') {
            throw ValidationException::withMessages([
                'payment' => 'Order is already paid.',
            ]);
        }

        $amountTendered = $validated['amount_tendered'] ?? null;

        $order->update([
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'paid',
            'status' => 'completed',
            'amount_tendered' => $amountTendered,
            'change' => $amountTendered !== null ? max(0, $amountTendered - $order->total) : null,
        ]);

        $this->printDispatcher->send(
            $this->generateInvoice->execute($order)
        );

        return redirect()->back()->with('success', 'Payment recorded successfully!');
    }

    public function receipt(Order $order)
    {
        $order->load('items', 'user');

        $printed = $this->printerService->printReceipt($order);

        if (! $printed) {
            return redirect()->back()->with('error', 'Printer offline. Receipt available for reprint.');
        }

        return redirect()->back()->with('success', 'Receipt printed!');
    }
}
