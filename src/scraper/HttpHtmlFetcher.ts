import type { IHtmlFetcher } from "./ports";

export class UpstreamError extends Error {}

export class HttpHtmlFetcher implements IHtmlFetcher {
  constructor(private readonly timeoutMs: number) {}

  async fetchHtml(url: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (cause) {
      throw new UpstreamError("IIUM schedule site is unreachable", { cause });
    }

    if (!response.ok) {
      throw new UpstreamError(`IIUM schedule site responded with HTTP ${response.status}`);
    }
    return response.text();
  }
}
