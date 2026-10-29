import { Elysia, type Static } from "elysia";
import type { IScheduleReader, ScheduleQuery } from "../domain/schedule";
import { UpstreamError } from "../scraper/HttpHtmlFetcher";
import { coursesResponse, errorResponse, pagesResponse, scheduleQuery } from "./schemas";

function toScheduleQuery(query: Static<typeof scheduleQuery>): ScheduleQuery {
  return {
    page: query.page ?? 1,
    kuliyyah: query.kuliyyah,
    study: query.study ?? "UG",
    course: query.course ?? "",
    sem: query.sem,
    session: query.session,
  };
}

export const createScheduleRoutes = (reader: IScheduleReader) =>
  new Elysia()
    .onError(({ error, set }) => {
      if (error instanceof UpstreamError) {
        set.status = 502;
        return { message: error.message };
      }
    })

    .get("/schedule", async ({ query }) => {
      const courses = await reader.getCourses(toScheduleQuery(query));
      return {
        data: courses,
        message: courses.length > 0 ? "Schedules fetched successfully" : "No schedules found for the given parameters",
      };
    },
    {
      query: scheduleQuery,
      detail: {
        description: "Fetch IIUM course schedules based on various parameters.",
        tags: ["Schedule"],
      },
      response: { 200: coursesResponse, 502: errorResponse },
    })

    .get("/schedule/pages", async ({ query }) => {
      return {
        data: await reader.getTotalPages(toScheduleQuery(query)),
        message: "Total pages fetched successfully",
      };
    },
    {
      query: scheduleQuery,
      detail: {
        description: "Fetch total number of pages available for the given schedule parameters.",
        tags: ["Schedule"],
      },
      response: { 200: pagesResponse, 502: errorResponse },
    });
