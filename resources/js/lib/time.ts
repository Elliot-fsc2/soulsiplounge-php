export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const total = timeToMinutes(time) + minutesToAdd;

  return minutesToTime(total);
}

export function getEndTime(startTime: string, duration: string): string {
  const durationMinutes = parseFloat(duration) * 60;

  return addMinutesToTime(startTime, durationMinutes);
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
