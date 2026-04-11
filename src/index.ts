import { Elysia, t } from "elysia";
import * as cheerio from "cheerio";
import { ParseTimeRange } from "./ParseTime";
import { ParseDay } from "./ParseDay";
import { swagger } from "@elysiajs/swagger";

const scheduleQuery = t.Object({
  page: t.Optional(t.Number({ default: 1 })),
  kuliyyah: t.String({ default: "KICT" }),
  study: t.Optional(t.String({ default: "UG" })),
  course: t.Optional(t.String({ default: "" })),
  sem: t.String({default: "2"}),
  session: t.String({default: "2025/2026"}),
});

const app = new Elysia()
  .use(swagger({
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
  .get("/schedule", async ({ query }) => {
    const { page, kuliyyah, study, course, sem, session } = query;
    const url = `https://myapps.iium.edu.my/StudentOnline/schedule1.php?action=view&view=${(page ?? 1) * 50}&kuly=${kuliyyah}&ctype=${study === "PG" ? ">=" : "<"}&course=${course}&sem=${sem}&ses=${session}`;

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const table = $('tr[bgcolor="ddddf5"], tr[bgcolor="f5f5f5"]');

    const courses: {
      course_code: string;
      course_section: string;
      course_name: string;
      course_credits: string;
      lecturer: string;
      schedule: { day: number | ""; start_time: string; end_time: string; venue: string }[];
    }[] = [];

    table.each((i, row) => {
      const cells = $(row).find(">td");
      const course_code = $(cells[0]).text().trim();
      const course_section = $(cells[1]).text().trim();
      const course_name = $(cells[2]).text().trim();
      const course_credits = $(cells[3]).text().trim();

      const course_schedule = $(cells[4]).find("tr");
      const schedule: { day: number | ""; start_time: string; end_time: string; venue: string }[] = [];
      let lecturer = "";

      course_schedule.each((j, sRow) => {
        const sCells = $(sRow).find(">td");

        const day = $(sCells[0]).text().trim();
        const time = $(sCells[1]).text().trim();
        const venue = $(sCells[2]).text().trim();
        lecturer = $(sCells[3]).text().trim();

        const [startTime, endTime] = ParseTimeRange(time);

        day.split("-").forEach((d) => {
          schedule.push({ day: ParseDay(d), start_time: startTime, end_time: endTime, venue });
        });
      });
      courses.push({ course_code, course_section, course_name, course_credits, lecturer, schedule });
    });

    return {
      data: courses,
      message: courses.length > 0 ? "Schedules fetched successfully" : "No schudules found for the given parameters",
    };
  }, 
  {
    query: scheduleQuery,

    detail:{
      description: "Fetch IIUM course schedules based on various parameters.",
      tags: ["Schedule"],
    },

    response: {
      200: t.Object({
        data: t.Array(t.Object({
          course_code: t.String(),
          course_section: t.String(),
          course_name: t.String(),
          course_credits: t.String(),
          lecturer: t.String(),
          schedule: t.Array(t.Object({
            day: t.Union([t.Number(), t.Literal("")]),
            start_time: t.String(),
            end_time: t.String(),
            venue: t.String(),
          })),
        })),
        message: t.String(),
      })
    }
  })
  .get("/schedule/pages", async ({ query }) => {
    const { page, kuliyyah, study, course, sem, session } = query;
    const url = `https://myapps.iium.edu.my/StudentOnline/schedule1.php?action=view&view=${(page ?? 1) * 50}&kuly=${kuliyyah}&ctype=${study === "PG" ? ">=" : "<"}&course=${course}&sem=${sem}&ses=${session}`;

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const total_page = $('table').eq(1).find('tr').eq(0).find('a').eq(-2)
    
    return {
      data: parseInt(total_page.text().trim()) || 1,
      message: "Total pages fetched successfully",
    }

  },
  {
    query: scheduleQuery,

    detail:{
      description: "Fetch total number of pages available for the given schedule parameters.",
      tags: ["Schedule"],
    },

    response: {
      200: t.Object({
        data: t.Number(),
        message: t.String(),
      })
    }
  })
  .listen(process.env.PORT ?? 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);