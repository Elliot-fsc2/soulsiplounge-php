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
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string|in:cash,gcash,card,bank_transfer',
            'amount_tendered' => 'nullable|integer|min:0',
            'booking_id' => 'nullable|string|exists:bookings,id',
            'room_id' => 'nullable|string|exists:rooms,id',
            'guest_count' => 'nullable|integer|min:1',
            'room_duration' => 'nullable|string',
            'rooms' => 'nullable|array',
            'rooms.*.room_id' => 'required|string|exists:rooms,id',
            'rooms.*.guest_count' => 'required|integer|min:1',
            'rooms.*.room_duration' => 'required|string',
            'notes' => 'nullable|string|max:500',
        ]);

        if (empty($validated['items']) && empty($validated['room_id']) && empty($validated['rooms'])) {
            throw ValidationException::withMessages([
                'items' => 'An order must contain at least one item or a room charge.',
            ]);
        }

        try {
            $order = $this->createOrder->execute(
                user: $request->user(),
                items: $validated['items'] ?? [],
                bookingId: $validated['booking_id'] ?? null,
                roomId: $validated['room_id'] ?? null,
                guestCount: $validated['guest_count'] ?? null,
                roomDuration: $validated['room_duration'] ?? null,
                rooms: $validated['rooms'] ?? [],
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

            $this->printDispatcher->send($invoice);

            session()->flash('print_data', [
                'invoice' => [
                    'invoice_number' => $invoice->invoice_number,
                    'created_at' => $invoice->created_at->toIso8601String(),
                    'staff_name' => $invoice->staff_name,
                    'room_name' => $invoice->room_name,
                    'guest_count' => $invoice->guest_count,
                    'subtotal' => $invoice->subtotal / 100,
                    'total' => $invoice->total / 100,
                    'amount_tendered' => $invoice->amount_tendered !== null
                        ? $invoice->amount_tendered / 100 : null,
                    'change' => $invoice->change !== null
                        ? $invoice->change / 100 : null,
                    'payment_method' => $invoice->payment_method,
                    'items' => $invoice->items->map(fn ($item) => [
                        'product_name' => $item->product_name,
                        'product_price' => $item->product_price / 100,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->subtotal / 100,
                    ])->toArray(),
                ],
                'print_kitchen_chit' => (bool) config('printer.print_kitchen_chit'),
            ]);

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

        $this->printDispatcher->send($invoice);

        session()->flash('print_data', [
            'invoice' => [
                'invoice_number' => $invoice->invoice_number,
                'created_at' => $invoice->created_at->toIso8601String(),
                'staff_name' => $invoice->staff_name,
                'room_name' => $invoice->room_name,
                'guest_count' => $invoice->guest_count,
                'subtotal' => $invoice->subtotal / 100,
                'total' => $invoice->total / 100,
                'amount_tendered' => $invoice->amount_tendered !== null
                    ? $invoice->amount_tendered / 100 : null,
                'change' => $invoice->change !== null
                    ? $invoice->change / 100 : null,
                'payment_method' => $invoice->payment_method,
                'items' => $invoice->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'product_price' => $item->product_price / 100,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal / 100,
                ])->toArray(),
            ],
            'print_kitchen_chit' => (bool) config('printer.print_kitchen_chit'),
        ]);

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
