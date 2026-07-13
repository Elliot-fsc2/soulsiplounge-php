import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  pricing: unknown[];
}

interface Props {
  rooms: Room[];
  selectedRoomId: string | null;
  guestCount: number;
  onSelect: (roomId: string | null, guestCount: number) => void;
  onClose: () => void;
}

export default function RoomSelector({ rooms, selectedRoomId, guestCount, onSelect, onClose }: Props) {
  const [localRoomId, setLocalRoomId] = useState(selectedRoomId ?? '');
  const [localGuests, setLocalGuests] = useState(guestCount || 1);

  function handleSave() {
    onSelect(localRoomId || null, localRoomId ? localGuests : 0);
    onClose();
  }

  function handleClear() {
    onSelect(null, 0);
    onClose();
  }

  const selectedRoom = rooms.find((r) => r.id === localRoomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div>
            <div className="text-[10px] font-sans uppercase tracking-widest text-amber-400">Room</div>
            <h4 className="text-sm font-serif font-semibold text-stone-100">Assign a Room</h4>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-stone-800 p-1.5 text-stone-400 transition hover:bg-stone-700 hover:text-stone-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-400">Select Room</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
              <select
                value={localRoomId}
                onChange={(e) => setLocalRoomId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-700 bg-stone-950 py-3 pl-10 pr-4 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="" className="bg-stone-950">No room (walk-in)</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id} className="bg-stone-950">{room.name}</option>
                ))}
              </select>
            </div>
          </div>

          {localRoomId && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400">Guest Count</label>
              <input
                type="number"
                value={localGuests}
                onChange={(e) => setLocalGuests(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {selectedRoom && (
                <p className="mt-1 text-xs text-stone-500">
                  Room charge: {selectedRoom.name} &middot; {localGuests} pax
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-stone-800 px-6 py-4">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold tracking-wide text-stone-300 transition hover:bg-stone-700 hover:text-stone-100"
          >
            Clear Room
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
