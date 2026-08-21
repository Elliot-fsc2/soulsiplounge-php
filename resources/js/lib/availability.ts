import { OPENING_MINUTES, CLOSING_MINUTES, MAINTENANCE_INTERVAL } from '@/lib/constants';
import type { Booking } from '@/types/domain';

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

export function isSlotAvailable(
  date: string,
  roomName: string,
  startTime: string,
  duration: string,
  bookings: Booking[],
  excludeBookingId?: string,
): boolean {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + parseFloat(duration) * 60 + 5;

  for (const booking of bookings) {
    if (booking.date !== date) continue;
    if (booking.room_name !== roomName) continue;
    if (booking.status === 'Cancelled') continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;

    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + parseFloat(booking.duration) * 60 + 5;

    if (startMinutes < bookingEnd && endMinutes > bookingStart) {
      return false;
    }
  }

  return true;
}

export function generateAvailableSlots(
  date: string,
  roomName: string,
  duration: string,
  bookings: Booking[],
  excludeBookingId?: string,
): string[] {
  const dateObj = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateObj < today) return [];

  const durationMinutes = parseFloat(duration) * 60;
  const lastStart = CLOSING_MINUTES - durationMinutes - MAINTENANCE_INTERVAL;
  const available: string[] = [];

  const now = new Date();
  const isToday = dateObj.getTime() === today.getTime();

  for (let minutes = OPENING_MINUTES; minutes <= lastStart; minutes += MAINTENANCE_INTERVAL) {
    if (isToday) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (minutes <= nowMinutes) continue;
    }

    const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

    if (isSlotAvailable(date, roomName, time, duration, bookings, excludeBookingId)) {
      available.push(time);
    }
  }

  return available;
}

export function isDateFullyBooked(
  date: string,
  roomName: string,
  bookings: Booking[],
  durations: string[],
): boolean {
  for (const duration of durations) {
    const slots = generateAvailableSlots(date, roomName, duration, bookings);
    if (slots.length > 0) return false;
  }

  return true;
}
