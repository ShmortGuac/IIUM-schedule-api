import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { config } from "./config";
import { createScheduleRoutes } from "./routes/schedule";
import { HttpHtmlFetcher } from "./scraper/HttpHtmlFetcher";
import { IiumScheduleUrlBuilder } from "./scraper/IiumScheduleUrlBuilder";
import { CourseParser } from "./scraper/CourseParser";
import { PageCountParser } from "./scraper/PageCountParser";
import { IiumScheduleScraper } from "./scraper/IiumScheduleScraper";

// Composition root: the only place that knows which concrete classes are used.
const scheduleReader = new IiumScheduleScraper(
  new HttpHtmlFetcher(config.iium.timeoutMs),
  new IiumScheduleUrlBuilder(config.iium.scheduleUrl, config.iium.coursesPerPage),
  new CourseParser(),
  new PageCountParser(),
);

const app = new Elysia()
  .use(swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "IIUM Schedule API",
        version: "1.0.0",
        description: "API to fetch IIUM course schedules based on various parameters.",
      },
      tags: [
        {name: "Schedule", description: "Course Schedule Endpoints"}
      ]
    }
  }))
  .group("/api", (app) => app.use(createScheduleRoutes(scheduleReader)))
  .listen(config.port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
