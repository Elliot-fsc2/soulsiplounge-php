export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`;
}

export function getTimeRangeDisplay(startTime: string, duration: string): string {
  const [hours, minutes] = startTime.split(':');
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + parseFloat(duration) * 60;
  const endHour = Math.floor(totalMinutes / 60);
  const endMin = totalMinutes % 60;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}
