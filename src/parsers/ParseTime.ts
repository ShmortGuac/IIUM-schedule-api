type Period = "AM" | "PM" | undefined;

interface ClockTime {
  hours: number;
  minutes: string;
  period: Period;
}

// Matches IIUM formats such as "8.30 - 9.50 AM", "2 - 3.20 PM", "11.30 - 12.50 AM", "3.30 - 5".
const RANGE_PATTERN = /^(\d{1,2})(?:[.:](\d{1,2}))?\s*([AP]M)?\s*-\s*(\d{1,2})(?:[.:](\d{1,2}))?\s*([A-Z]+)?$/i;

// No classes start before 7 AM, so IIUM's occasional "2.30 - 5.30 AM" really means PM.
const EARLIEST_CLASS_HOUR = 7;
// Classes run roughly 8 AM - 7 PM, so a bare 1-7 is afternoon.
const LAST_AFTERNOON_HOUR_WITHOUT_PERIOD = 7;

// Returns ["HHMM", "HHMM"], or ["", ""] when the cell has no usable time (e.g. "", "AM", "0 - 0 0").
export function ParseTimeRange(range: string): [string, string] {
  const match = range.trim().match(RANGE_PATTERN);
  if (!match) return ["", ""];

  const [, startH, startM, startPeriod, endH, endM, endPeriod] = match;
  const start = toClockTime(startH, startM, startPeriod);
  const end = toClockTime(endH, endM, endPeriod);
  if (start.hours === 0 || end.hours === 0) return ["", ""];

  let endHours = to24Hour(end);
  let startHours = to24Hour(start.period ? start : { ...start, period: end.period });

  if (startHours > endHours) {
    // "11.30 - 1.20 PM": the PM belongs to the end time only.
    if (!start.period && startHours > 12) startHours -= 12;
    // "9 - 1 AM": the class runs past noon.
    else if (endHours < 12) endHours += 12;
  }

  return [format(startHours, start.minutes), format(endHours, end.minutes)];
}

function toClockTime(hours: string, minutes = "00", period?: string): ClockTime {
  const upper = period?.toUpperCase();
  return {
    hours: parseInt(hours),
    minutes: minutes.padEnd(2, "0"),
    period: upper === "AM" || upper === "PM" ? upper : undefined,
  };
}

function to24Hour({ hours, period }: ClockTime): number {
  // IIUM writes noon as "12 AM" as often as "12 PM"; there are no midnight classes.
  if (hours >= 12) return hours;
  if (period === "PM") return hours + 12;
  if (period === "AM") return hours < EARLIEST_CLASS_HOUR ? hours + 12 : hours;
  return hours <= LAST_AFTERNOON_HOUR_WITHOUT_PERIOD ? hours + 12 : hours;
}

function format(hours: number, minutes: string): string {
  return `${String(hours).padStart(2, "0")}${minutes}`;
}
