import type { ScheduleQuery } from "../domain/schedule";
import type { IScheduleUrlBuilder } from "./ports";

export class IiumScheduleUrlBuilder implements IScheduleUrlBuilder {
  constructor(
    private readonly baseUrl: string,
    private readonly coursesPerPage: number,
  ) {}

  build({ page, kuliyyah, study, course, sem, session }: ScheduleQuery): string {
    const params = new URLSearchParams({
      action: "view",
      // IIUM paginates by the index of the last row on the page.
      view: String(page * this.coursesPerPage),
      kuly: kuliyyah.toUpperCase(),
      ctype: study.toUpperCase() === "PG" ? ">=" : "<",
      course: normalizeCourseCode(course),
      sem,
      ses: session,
    });
    return `${this.baseUrl}?${params}`;
  }
}

// IIUM only matches "BICS 1301", so "bics1301" is reformatted the same way the site's own form does.
function normalizeCourseCode(course: string): string {
  const compact = course.toUpperCase().replace(/\s+/g, "");
  return compact.replace(/^([A-Z]+)(\d)/, "$1 $2");
}
