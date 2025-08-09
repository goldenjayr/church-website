/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time in HH:MM format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) {
    return time24; // Return as-is if invalid format
  }

  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time24; // Return as-is if parsing fails
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight, and 13-23 to 1-11

  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert 12-hour time format to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM")
 * @returns Time in HH:MM format (e.g., "14:30")
 */
export function formatTime24Hour(time12: string): string {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (!match) {
    return time12; // Return as-is if invalid format
  }

  let [_, hoursStr, minutes, period] = match;
  let hours = parseInt(hoursStr, 10);

  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}
