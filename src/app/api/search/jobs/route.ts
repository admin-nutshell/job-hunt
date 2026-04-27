import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchRequestBody {
  keywords: string;
  location: string;
  jobType: string;
  domain: string;
}

export interface JobResult {
  title: string;
  company: string;
  location: string;
  snippet: string;
  url: string;
  source: "Indeed" | "LinkedIn" | "Alberta Jobs" | "Other";
}

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  pagemap?: {
    metatags?: Array<Record<string, string>>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  error?: { message: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectSource(url: string): JobResult["source"] {
  if (url.includes("indeed.com")) return "Indeed";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (
    url.includes("jobs.alberta.ca") ||
    url.includes("alis.alberta.ca")
  )
    return "Alberta Jobs";
  return "Other";
}

function extractCompany(item: GoogleSearchItem): string {
  // Try to pull company name from common meta tags
  const metatags = item.pagemap?.metatags?.[0];
  if (metatags) {
    const candidates = [
      metatags["og:site_name"],
      metatags["twitter:site"],
    ];
    for (const c of candidates) {
      if (c && c.toLowerCase() !== "indeed" && c.toLowerCase() !== "linkedin") {
        return c;
      }
    }
  }

  // Fall back: parse "Company · Job Title" patterns in snippet
  const snippetMatch = item.snippet.match(/^([^·\-–|]+)[·\-–|]/);
  if (snippetMatch) return snippetMatch[1].trim();

  // Last resort: use the display domain minus TLD
  return item.displayLink.replace(/^www\./, "").split(".")[0];
}

function buildQuery(
  keywords: string,
  location: string,
  domain: string
): string {
  const loc = location.toLowerCase().includes("canada")
    ? location
    : `${location} Canada`;

  const domainFilter =
    domain && domain !== "All" ? ` ${domain}` : "";

  const sites =
    "site:ca.indeed.com OR site:linkedin.com/jobs OR site:jobs.alberta.ca";

  return `${keywords}${domainFilter} ${loc} (${sites})`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: SearchRequestBody = await request.json();
    const { keywords, location, jobType, domain } = body;

    if (!keywords?.trim()) {
      return NextResponse.json(
        { error: "Keywords are required." },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const apiKey = env.GOOGLE_SEARCH_API_KEY;
    const cx = env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !cx) {
      return NextResponse.json(
        {
          error:
            "Search API is not configured. Add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to .dev.vars.",
        },
        { status: 503 }
      );
    }

    const q = buildQuery(keywords, location || "Calgary, AB", domain);

    const params = new URLSearchParams({
      key: apiKey,
      cx,
      q,
      num: "10",
      gl: "ca",
      hl: "en",
    });

    // Append jobType as an extra keyword if set
    if (jobType) {
      params.set("q", `${q} "${jobType}"`);
    }

    const googleRes = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`
    );
    const data: GoogleSearchResponse = await googleRes.json();

    if (!googleRes.ok) {
      throw new Error(data.error?.message ?? "Google Search API error");
    }

    const results: JobResult[] = (data.items ?? []).map((item) => ({
      title: item.title,
      company: extractCompany(item),
      location: location || "Calgary, AB",
      snippet: item.snippet,
      url: item.link,
      source: detectSource(item.link),
    }));

    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
