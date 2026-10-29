import { t } from "elysia";
import { config } from "../config";

export const scheduleQuery = t.Object({
  page: t.Optional(t.Integer({ default: 1, minimum: 1 })),
  kuliyyah: t.String({ default: "KICT" }),
  study: t.Optional(t.Union([t.Literal("UG"), t.Literal("PG")], { default: "UG" })),
  course: t.Optional(t.String({ default: "" })),
  sem: t.String({ default: config.defaults.sem }),
  session: t.String({ default: config.defaults.session }),
});

const scheduleSlot = t.Object({
  day: t.Union([t.Number(), t.Literal("")]),
  start_time: t.String(),
  end_time: t.String(),
  venue: t.String(),
});

const course = t.Object({
  course_code: t.String(),
  course_section: t.String(),
  course_name: t.String(),
  course_credits: t.String(),
  lecturer: t.String(),
  schedule: t.Array(scheduleSlot),
});

export const coursesResponse = t.Object({
  data: t.Array(course),
  message: t.String(),
});

export const pagesResponse = t.Object({
  data: t.Number(),
  message: t.String(),
});

export const errorResponse = t.Object({
  message: t.String(),
});
