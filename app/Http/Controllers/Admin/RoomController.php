<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use Illuminate\Support\Facades\Storage;

class RoomController
{
    public function index()
    {
        return Room::orderBy('sort_order')->get();
    }

    public function store(StoreRoomRequest $request)
    {
        $data = $request->validated();

        if (isset($data['pricing']) && is_string($data['pricing'])) {
            $data['pricing'] = json_decode($data['pricing'], true);
        }

        if ($request->hasFile('image_file')) {
            $data['image'] = $request->file('image_file')->store('rooms', 'public');
        }

        Room::create($data);

        return redirect()->back()->with('success', 'Room created successfully!');
    }

    public function update(StoreRoomRequest $request, Room $room)
    {
        $data = $request->validated();

        if (isset($data['pricing']) && is_string($data['pricing'])) {
            $data['pricing'] = json_decode($data['pricing'], true);
        }

        if ($request->hasFile('image_file')) {
            if ($room->image) {
                Storage::disk('public')->delete($room->image);
            }
            $data['image'] = $request->file('image_file')->store('rooms', 'public');
        }

        $room->update($data);

        return redirect()->back()->with('success', 'Room updated successfully!');
    }

    public function destroy(Room $room)
    {
        if ($room->image) {
            Storage::disk('public')->delete($room->image);
        }

        $room->delete();

        return redirect()->back()->with('success', 'Room deleted successfully!');
    }
}
