/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  JOB_HUNT_DB: D1Database;
  AI: Ai;
  ASSETS: Fetcher;
  APP_PASSWORD: string;
  GOOGLE_SEARCH_API_KEY: string;
  GOOGLE_SEARCH_ENGINE_ID: string;
}
