import type { Course, IScheduleReader, ScheduleQuery } from "../domain/schedule";
import type { ICourseParser, IHtmlFetcher, IPageCountParser, IScheduleUrlBuilder } from "./ports";

export class IiumScheduleScraper implements IScheduleReader {
  constructor(
    private readonly fetcher: IHtmlFetcher,
    private readonly urlBuilder: IScheduleUrlBuilder,
    private readonly courseParser: ICourseParser,
    private readonly pageCountParser: IPageCountParser,
  ) {}

  async getCourses(query: ScheduleQuery): Promise<Course[]> {
    return this.courseParser.parse(await this.fetchPage(query));
  }

  async getTotalPages(query: ScheduleQuery): Promise<number> {
    return this.pageCountParser.parse(await this.fetchPage(query));
  }

  private fetchPage(query: ScheduleQuery): Promise<string> {
    return this.fetcher.fetchHtml(this.urlBuilder.build(query));
  }
}
