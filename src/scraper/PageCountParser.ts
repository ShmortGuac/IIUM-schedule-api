import type { IPageCountParser } from "./ports";

// Every pagination link carries the total, e.g. "...&tot_pages=6&...". Results that fit on one page have no links.
const TOTAL_PAGES_PATTERN = /tot_pages=(\d+)/;

export class PageCountParser implements IPageCountParser {
  parse(html: string): number {
    const match = html.match(TOTAL_PAGES_PATTERN);
    return match ? parseInt(match[1]) : 1;
  }
}
