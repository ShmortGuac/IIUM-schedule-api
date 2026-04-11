const DAY_MAP: Record<string, number> = {
  M: 1, MON: 1,
  T: 2, TUE: 2,
  W: 3, WED: 3,
  TH: 4, THUR: 4,
  F: 5, FRI: 5,
  SA: 6, SAT: 6,
  SU: 7, SUN: 7,
};

export function ParseDay(day: string){
    const key = day.trim().toUpperCase();
    return DAY_MAP[key] || 0;
}