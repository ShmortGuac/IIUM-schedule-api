import type { Day } from "../domain/schedule";

const DAY_MAP: Record<string, number> = {
  M: 1, MON: 1,
  T: 2, TUE: 2,
  W: 3, WED: 3,
  TH: 4, THU: 4, THUR: 4,
  F: 5, FRI: 5,
  SA: 6, SAT: 6,
  SU: 7, SUN: 7,
};

// Single-letter codes written without separators, e.g. "MTWTH" or "MTWTHF".
const COMPACT_DAY_PATTERN = /TH|SA|SU|M|T|W|F/g;

export function ParseDay(day: string): Day {
  const key = day.trim().toUpperCase();
  return DAY_MAP[key] ?? "";
}

// "M-W" -> [1, 3], "MTWTH" -> [1, 2, 3, 4], "" -> [""]
export function ParseDays(days: string): Day[] {
  return days.split("-").flatMap((token) => {
    const key = token.trim().toUpperCase();
    if (Object.hasOwn(DAY_MAP, key) || key === "") return [ParseDay(key)];

    const compact = key.match(COMPACT_DAY_PATTERN);
    return compact?.join("") === key ? compact.map(ParseDay) : [""];
  });
}
