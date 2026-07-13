<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Public;
use App\Http\Controllers\Staff;
use App\Models\BankAccount;
use App\Models\Booking;
use App\Models\Contact;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('booking')->name('booking.')->group(function () {
    Route::get('/', [Public\BookingController::class, 'create'])->name('create');
    Route::post('/', [Public\BookingController::class, 'store'])->name('store');
});

Route::prefix('payment')->name('payment.')->group(function () {
    Route::get('/{booking}', [Public\PaymentController::class, 'show'])->name('show');
    Route::post('/{booking}/receipt', [Public\PaymentController::class, 'uploadReceipt'])->name('receipt');
});

Route::prefix('contact')->name('contact.')->group(function () {
    Route::get('/', fn () => inertia('contact/create'))->name('create');
    Route::post('/', [Public\ContactController::class, 'store'])->name('store');
});

// Staff dashboard & POS — visible to both staff and admin
Route::middleware(['auth', 'role:admin,staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/', function () {
        $pendingPayments = Payment::with('booking')
            ->where('status', 'Pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $todayBookings = Booking::whereDate('date', today())->get();

        return inertia('staff/index', [
            'stats' => [
                'pendingCount' => $pendingPayments->count(),
                'pendingTotal' => $pendingPayments->sum('amount'),
                'todayBookingsCount' => $todayBookings->count(),
            ],
            'pendingPayments' => $pendingPayments,
            'todayBookings' => $todayBookings,
        ]);
    })->name('dashboard');

    Route::get('/pos', [Staff\PosController::class, 'index'])->name('pos');
    Route::post('/orders', [Staff\OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [Staff\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [Staff\OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [Staff\OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/pay', [Staff\OrderController::class, 'pay'])->name('orders.pay');
    Route::get('/orders/{order}/receipt', [Staff\OrderController::class, 'receipt'])->name('orders.receipt');
});

// Admin-only routes (Bookings, Contacts, Rooms, Vouchers, Settings, Analytics)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // ── Page routes (GET only · renders Inertia pages) ──
    Route::get('/', function () {
        $bookings = Booking::orderBy('created_at', 'desc')->get();
        $confirmedTotal = Payment::where('status', 'Confirmed')->sum('amount');
        $contacts = Contact::orderBy('created_at', 'desc')->get();

        return inertia('admin/index', [
            'stats' => [
                'totalBookings' => $bookings->count(),
                'totalRevenue' => $confirmedTotal,
                'confirmedBookings' => $bookings->where('status', 'Confirmed')->count(),
                'pendingBookings' => $bookings->where('status', 'Pending')->count(),
                'cancelledBookings' => $bookings->where('status', 'Cancelled')->count(),
                'newContacts' => $contacts->where('status', 'New')->count(),
            ],
        ]);
    })->name('dashboard');

    Route::get('/bookings', fn () => inertia('admin/bookings/index', [
        'bookings' => Booking::orderBy('created_at', 'desc')->get(),
    ]))->name('bookings');

    Route::get('/contacts', fn () => inertia('admin/contacts/index', [
        'contacts' => Contact::orderBy('created_at', 'desc')->get(),
    ]))->name('contacts');

    Route::get('/rooms', fn () => inertia('admin/rooms/index', [
        'rooms' => Room::orderBy('sort_order')->get(),
    ]))->name('rooms');

    Route::get('/vouchers', fn () => inertia('admin/vouchers/index', [
        'vouchers' => Voucher::orderBy('created_at', 'desc')->get(),
    ]))->name('vouchers');

    Route::get('/analytics', function () {
        $bookings = Booking::orderBy('created_at', 'desc')->get();
        $confirmedTotal = Payment::where('status', 'Confirmed')->sum('amount');
        $contacts = Contact::orderBy('created_at', 'desc')->get();

        return inertia('admin/analytics/index', [
            'stats' => [
                'totalBookings' => $bookings->count(),
                'totalRevenue' => $confirmedTotal,
                'confirmedBookings' => $bookings->where('status', 'Confirmed')->count(),
                'pendingBookings' => $bookings->where('status', 'Pending')->count(),
                'cancelledBookings' => $bookings->where('status', 'Cancelled')->count(),
                'newContacts' => $contacts->where('status', 'New')->count(),
            ],
        ]);
    })->name('analytics');

    Route::get('/settings', fn () => inertia('admin/settings/index', [
        'bankAccounts' => BankAccount::orderBy('bank_name')->get(),
        'users' => User::orderBy('created_at', 'desc')->get(),
    ]))->name('settings');

    // ── API routes (POST / PUT / PATCH / DELETE · controllers) ──
    Route::resource('bookings', Admin\BookingController::class)->except(['create', 'edit', 'show', 'index']);
    Route::patch('contacts/{contact}/status', [Admin\ContactController::class, 'updateStatus'])->name('contacts.status');
    Route::delete('contacts/{contact}', [Admin\ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::resource('vouchers', Admin\VoucherController::class)->except(['create', 'edit', 'show', 'index']);
    Route::get('vouchers/generate-code', [Admin\VoucherController::class, 'generateCode'])->name('vouchers.generate-code');
    Route::resource('rooms', Admin\RoomController::class)->except(['create', 'edit', 'show', 'index']);
    Route::resource('bank-accounts', Admin\BankAccountController::class)->except(['create', 'edit', 'show', 'index']);
    Route::resource('users', Admin\UserController::class)->except(['create', 'edit', 'show', 'index']);
    Route::put('settings', [Admin\SettingsController::class, 'update'])->name('settings.update');

    Route::get('/inventory', [Admin\InventoryController::class, 'index'])->name('inventory');
    Route::post('/inventory/{inventoryItem}/add-stock', [Admin\InventoryController::class, 'addStock'])->name('inventory.add-stock');
    Route::post('/inventory/{inventoryItem}/adjust', [Admin\InventoryController::class, 'adjust'])->name('inventory.adjust');
    Route::post('/inventory/weekly-restock', [Admin\InventoryController::class, 'weeklyRestock'])->name('inventory.weekly-restock');

    Route::get('/products', [Admin\ProductController::class, 'index'])->name('products');
    Route::resource('products', Admin\ProductController::class)->except(['create', 'edit', 'show', 'index']);
});

// Admin + Staff routes (Payments page + actions)
Route::middleware(['auth', 'role:admin,staff'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/payments', fn () => inertia('admin/payments/index', [
        'payments' => Payment::orderBy('created_at', 'desc')->get(),
        'bookings' => Booking::orderBy('created_at', 'desc')->get(['id', 'name', 'email', 'phone', 'room_name', 'date', 'time']),
    ]))->name('payments');

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::post('{payment}/confirm', [Admin\PaymentController::class, 'confirm'])->name('confirm');
        Route::post('{payment}/cancel', [Admin\PaymentController::class, 'cancel'])->name('cancel');
        Route::post('{payment}/refund', [Admin\PaymentController::class, 'refund'])->name('refund');
        Route::delete('{payment}', [Admin\PaymentController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__.'/settings.php';
