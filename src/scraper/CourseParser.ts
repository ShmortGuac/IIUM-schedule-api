import * as cheerio from "cheerio";
import type { Course, ScheduleSlot } from "../domain/schedule";
import type { ICourseParser } from "./ports";
import { ParseDays } from "../parsers/ParseDay";
import { ParseTimeRange } from "../parsers/ParseTime";

const COURSE_ROW_SELECTOR = 'tr[bgcolor="ddddf5"], tr[bgcolor="f5f5f5"]';

export class CourseParser implements ICourseParser {
  parse(html: string): Course[] {
    const $ = cheerio.load(html);
    const courses: Course[] = [];

    $(COURSE_ROW_SELECTOR).each((_, row) => {
      courses.push(this.parseCourseRow($, $(row)));
    });

    return courses;
  }

  private parseCourseRow($: cheerio.CheerioAPI, row: cheerio.Cheerio<any>): Course {
    const cells = row.find(">td");
    const schedule: ScheduleSlot[] = [];
    // Only some slot rows name a lecturer, and team-taught courses name several.
    const lecturers = new Set<string>();

    $(cells[4]).find("tr").each((_, sRow) => {
      const sCells = $(sRow).find(">td");
      const day = $(sCells[0]).text().trim();
      const time = $(sCells[1]).text().trim();
      const venue = $(sCells[2]).text().trim();
      const lecturer = $(sCells[3]).text().trim();

      if (lecturer) lecturers.add(lecturer);
      schedule.push(...this.toSlots(day, time, venue));
    });

    return {
      course_code: $(cells[0]).text().trim(),
      course_section: $(cells[1]).text().trim(),
      course_name: $(cells[2]).text().trim(),
      course_credits: $(cells[3]).text().trim(),
      lecturer: [...lecturers].join(", "),
      schedule,
    };
  }

  // "M-W" becomes one slot per day.
  private toSlots(day: string, time: string, venue: string): ScheduleSlot[] {
    const [start_time, end_time] = ParseTimeRange(time);
    return ParseDays(day).map((d) => ({ day: d, start_time, end_time, venue }));
  }
}
