export function ParseTimeRange(range: string) {
  if (range.trim() === "") return ["", ""];
  const match = range.match(/^(\d+(?:\.\d+)?(?:\s?[AP]M)?)\s*-\s*(\d+(?:\.\d+)?\s?[AP]M)$/i);
  if (!match) throw new Error("Invalid time range format");

  let [, start, end] = match;

  if (!/[AP]M/i.test(start)) {
    const period = end.match(/[AP]M/i)![0];
    start = `${start} ${period}`;
  }

  const startTime = to24Hour(start.trim());
  const endTime = to24Hour(end.trim());

  return [startTime, endTime];
}

function to24Hour(time: string): string {
  const match = time.match(/^(\d+)(?:\.(\d+))?\s?(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time: ${time}`);
  let [, h, m = "00", period] = match;
  let hours = parseInt(h);

  if (period.toUpperCase() === "PM") {
    if(hours === 12) hours = 0
    else hours += 12;
  }

  return `${String(hours).padStart(2, "0")}${m}`;
}
