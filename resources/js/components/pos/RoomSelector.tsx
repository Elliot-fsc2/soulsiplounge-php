import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  pricing: unknown[];
  min_group: number;
  max_group: number;
}

interface Props {
  rooms: Room[];
  onSelect: (roomId: string | null, guestCount: number, duration: string | null) => void;
  onClose: () => void;
}

export default function RoomSelector({ rooms, onSelect, onClose }: Props) {
  const [localRoomId, setLocalRoomId] = useState('');
  const [localGuests, setLocalGuests] = useState(1);
  const [localDuration, setLocalDuration] = useState('');

  const selectedRoom = rooms.find((r) => r.id === localRoomId);
  const tiers = selectedRoom ? (selectedRoom.pricing as any[]) : [];
  
  // Auto-select duration if there's only one, or if they switched rooms and the old duration isn't valid.
  if (tiers.length > 0 && !tiers.find((t) => t.duration === localDuration)) {
    setLocalDuration(tiers[0].duration);
  }

  function handleSave() {
    onSelect(localRoomId || null, localRoomId ? localGuests : 0, localRoomId ? localDuration : null);
    onClose();
  }

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
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalRoomId(val);
                  const room = rooms.find((r) => r.id === val);
                  if (room) {
                    if (localGuests < room.min_group || localGuests > room.max_group) {
                      setLocalGuests(room.min_group);
                    }
                  }
                }}
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const min = selectedRoom?.min_group || 1;
                  const max = selectedRoom?.max_group || 50;
                  setLocalGuests(Math.max(min, Math.min(max, val)));
                }}
                min={selectedRoom?.min_group || 1}
                max={selectedRoom?.max_group || 50}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {selectedRoom && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-stone-400">Duration</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {tiers.map((tier) => (
                      <button
                        key={tier.duration}
                        type="button"
                        onClick={() => setLocalDuration(tier.duration)}
                        className={`rounded-xl border px-3 py-2 text-center text-sm font-medium transition ${
                          localDuration === tier.duration
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        {tier.duration} hrs
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-stone-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm font-bold tracking-wide text-stone-300 transition hover:bg-stone-700 hover:text-stone-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!localRoomId}
            className="flex-1 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold tracking-wide text-stone-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Room
          </button>
        </div>
      </div>
    </div>
  );
}
