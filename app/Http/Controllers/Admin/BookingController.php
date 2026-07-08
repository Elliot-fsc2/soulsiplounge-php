<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Booking\CreateBooking;
use App\Actions\Booking\UpdateBooking;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use Illuminate\Validation\ValidationException;

class BookingController
{
    public function __construct(
        private CreateBooking $createBooking,
        private UpdateBooking $updateBooking,
    ) {}

    public function index()
    {
        return Booking::orderBy('created_at', 'desc')->get();
    }

    public function store(StoreBookingRequest $request)
    {
        try {
            $booking = $this->createBooking->execute($request->validated());

            return redirect()->back()->with('success', 'Booking created successfully!');
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'time' => $e->getMessage(),
            ]);
        }
    }

    public function update(StoreBookingRequest $request, Booking $booking)
    {
        try {
            $this->updateBooking->execute($booking->id, $request->validated());

            return redirect()->back()->with('success', 'Booking updated successfully!');
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'time' => $e->getMessage(),
            ]);
        }
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->back()->with('success', 'Booking deleted successfully!');
    }
}
