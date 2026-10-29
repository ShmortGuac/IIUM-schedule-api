import type { Course, ScheduleQuery } from "../domain/schedule";

export interface IHtmlFetcher {
  fetchHtml(url: string): Promise<string>;
}

export interface IScheduleUrlBuilder {
  build(query: ScheduleQuery): string;
}

export interface ICourseParser {
  parse(html: string): Course[];
}

export interface IPageCountParser {
  parse(html: string): number;
}
