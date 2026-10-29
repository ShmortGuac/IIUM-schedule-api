import { describe, expect, test } from "bun:test";
import { ParseTimeRange } from "../src/parsers/ParseTime";
import { ParseDays } from "../src/parsers/ParseDay";
import { PageCountParser } from "../src/scraper/PageCountParser";
import { IiumScheduleUrlBuilder } from "../src/scraper/IiumScheduleUrlBuilder";

// Every input below appears in real IIUM data.
describe("ParseTimeRange", () => {
  test.each([
    ["8.30 - 9.50 AM", ["0830", "0950"]],
    ["2 - 3.20 PM", ["1400", "1520"]],
    ["12 - 1.50 PM", ["1200", "1350"]],
    ["11.30 - 12.50 AM", ["1130", "1250"]],
    ["9 - 12 AM", ["0900", "1200"]],
    ["11.30 - 1.20 PM", ["1130", "1320"]],
    ["12 - 13 PM", ["1200", "1300"]],
    ["3.30 - 5", ["1530", "1700"]],
    ["10.30 - 12.30", ["1030", "1230"]],
    ["11.20 - 12.50 AN", ["1120", "1250"]],
    ["2.30 - 5.30 AM", ["1430", "1730"]],
    ["7.30 - 8.20 AM", ["0730", "0820"]],
  ])("%s", (input, expected) => {
    expect(ParseTimeRange(input)).toEqual(expected as [string, string]);
  });

  test.each(["", "AM", "PM", "0 - 0", "0 - 0 0", "TBA"])("no usable time: %p", (input) => {
    expect(ParseTimeRange(input)).toEqual(["", ""]);
  });
});

describe("ParseDays", () => {
  test.each([
    ["M-W", [1, 3]],
    ["T-TH", [2, 4]],
    ["THUR", [4]],
    ["SAT-SUN", [6, 7]],
    ["MTWTH", [1, 2, 3, 4]],
    ["MTWTHF", [1, 2, 3, 4, 5]],
    ["M-W-TH", [1, 3, 4]],
    ["", [""]],
    ["XYZ", [""]],
  ])("%p", (input, expected) => {
    expect(ParseDays(input)).toEqual(expected as (number | "")[]);
  });
});

describe("PageCountParser", () => {
  const parser = new PageCountParser();
  const link = (view: number, label: string) =>
    `<a href="schedule1.php?action=view&view=${view}&kuly=KICT&tot_pages=6&ctype=<">${label}</a>`;

  test("reads the total on a middle page", () => {
    expect(parser.parse(link(50, "1") + link(150, "3") + link(150, "NEXT"))).toBe(6);
  });

  test("reads the total on the last page, which has no NEXT link", () => {
    expect(parser.parse(link(50, "PREV") + link(50, "1") + link(250, "5"))).toBe(6);
  });

  test("defaults to 1 when there are no pagination links", () => {
    expect(parser.parse("<table></table>")).toBe(1);
  });
});

describe("IiumScheduleUrlBuilder", () => {
  const builder = new IiumScheduleUrlBuilder("https://example.test/schedule1.php", 50);
  const query = { page: 2, kuliyyah: "kict", study: "PG", course: "bics1301", sem: "1", session: "2026/2027" };

  test("normalizes the course code and encodes parameters", () => {
    const params = new URL(builder.build(query)).searchParams;
    expect(params.get("view")).toBe("100");
    expect(params.get("kuly")).toBe("KICT");
    expect(params.get("ctype")).toBe(">=");
    expect(params.get("course")).toBe("BICS 1301");
    expect(params.get("ses")).toBe("2026/2027");
  });

  test("cannot inject extra upstream parameters", () => {
    const params = new URL(builder.build({ ...query, course: "BICS 1301&sem=3" })).searchParams;
    expect(params.get("sem")).toBe("1");
  });
});
