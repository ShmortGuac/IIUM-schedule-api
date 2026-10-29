// 1 = Monday ... 7 = Sunday, "" when IIUM lists no day.
export type Day = number | "";

export interface ScheduleQuery {
  page: number;
  kuliyyah: string;
  study: string;
  course: string;
  sem: string;
  session: string;
}

export interface ScheduleSlot {
  day: Day;
  start_time: string;
  end_time: string;
  venue: string;
}

export interface Course {
  course_code: string;
  course_section: string;
  course_name: string;
  course_credits: string;
  lecturer: string;
  schedule: ScheduleSlot[];
}

// What the HTTP layer depends on. Any data source (scraper, cache, DB) can implement it.
export interface IScheduleReader {
  getCourses(query: ScheduleQuery): Promise<Course[]>;
  getTotalPages(query: ScheduleQuery): Promise<number>;
}
