import { Elysia, t } from "elysia";
import * as cheerio from "cheerio";
import { ParseTimeRange } from "./ParseTime";
import { ParseDay } from "./ParseDay";

const app = new Elysia()
  .post("/schedule", async ({ body }) => {
    const { page, kuliyyah, study, course, sem, session } = body;
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

    return courses;
  }, {
    body: t.Object({
      page: t.Optional(t.Number({ default: 1 })),
      kuliyyah: t.String(),
      study: t.Optional(t.String({ default: "UG" })),
      course: t.Optional(t.String({ default: "" })),
      sem: t.String(),
      session: t.String(),
    }),
  })
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);