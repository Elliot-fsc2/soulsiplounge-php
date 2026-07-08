<?php

namespace App\Http\Controllers\Public;

use App\Actions\Availability\GenerateAvailableSlots;
use App\Actions\Booking\CreateBooking;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController
{
    public function __construct(
        private CreateBooking $createBooking,
        private GenerateAvailableSlots $generateAvailableSlots,
    ) {}

    public function create(Request $request): Response
    {
        $rooms = Room::orderBy('sort_order')->get();
        $selectedRoomId = $request->query('room_id', $rooms->first()?->id);

        $bookings = Booking::where('status', '!=', 'Cancelled')->get();

        return Inertia::render('booking/create', [
            'rooms' => $rooms,
            'selectedRoomId' => $selectedRoomId,
            'bookings' => $bookings,
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        try {
            $booking = $this->createBooking->execute($request->validated());

            return redirect()->route('payment.show', $booking)
                ->with('success', 'Booking created successfully!');
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'time' => $e->getMessage(),
            ]);
        }
    }
}
