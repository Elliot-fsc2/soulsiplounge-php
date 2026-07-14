<?php

namespace App\Http\Controllers\Staff;

use App\Actions\Invoice\GenerateInvoice;
use App\Actions\Order\CancelOrder;
use App\Actions\Order\CreateOrder;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController
{
    public function __construct(
        private CreateOrder $createOrder,
        private CancelOrder $cancelOrder,
        private GenerateInvoice $generateInvoice,
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

            $invoice = $this->generateInvoice->execute($order->fresh());

            $this->flashPrintData(
                $invoice,
                config('printer.print_kitchen_chit') && $order->items->contains(fn ($item) => $item->item_type === 'product'),
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

        $invoice = $this->generateInvoice->execute($order);

        $this->flashPrintData($invoice, false);

        return redirect()->back()->with('success', 'Payment recorded successfully!');
    }

    public function receipt(Order $order)
    {
        $invoice = $this->generateInvoice->execute($order);

        $this->flashPrintData($invoice, false);

        return redirect()->back()->with('success', 'Receipt ready for printing!');
    }

    private function flashPrintData(Invoice $invoice, bool $printKitchenChit): void
    {
        session()->flash('print_data', [
            'invoice' => [
                'invoice_number' => $invoice->invoice_number,
                'created_at' => $invoice->created_at->toIso8601String(),
                'staff_name' => $invoice->staff_name,
                'room_name' => $invoice->room_name,
                'guest_count' => $invoice->guest_count,
                'subtotal' => $invoice->subtotal,
                'total' => $invoice->total,
                'amount_tendered' => $invoice->amount_tendered,
                'change' => $invoice->change,
                'payment_method' => $invoice->payment_method,
                'items' => $invoice->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'product_price' => $item->product_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                ])->toArray(),
            ],
            'print_kitchen_chit' => $printKitchenChit,
        ]);
    }
}
