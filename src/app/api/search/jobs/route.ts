import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const apiKey = env.SERPAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Search API is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json() as { keywords: string; location: string; domain: string };
    const { keywords, location, domain } = body;

    if (!keywords?.trim()) {
      return NextResponse.json(
        { error: "Keywords are required." },
        { status: 400 }
      );
    }

    const query = `${keywords} ${domain !== "All" ? domain : ""} jobs`.trim();
    const fullLocation = location ? `${location}, Canada` : "Calgary, AB, Canada";

    const url = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(query)}&location=${encodeURIComponent(fullLocation)}&api_key=${apiKey}&hl=en&gl=ca`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    if (!data.jobs_results || data.jobs_results.length === 0) {
      return NextResponse.json([]);
    }

    const results = data.jobs_results.map((job: any) => {
      let source = job.via || "Other";
      if (source.includes("Indeed")) source = "Indeed";
      else if (source.includes("LinkedIn")) source = "LinkedIn";
      else if (source.includes("Alberta")) source = "Alberta Gov";
      else if (source.includes("Glassdoor")) source = "Glassdoor";

      return {
        title: job.title,
        company: job.company_name,
        location: job.location,
        snippet: job.description?.substring(0, 200) || "",
        url: job.related_links?.[0]?.link || job.share_link || "#",
        source,
      };
    });

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
