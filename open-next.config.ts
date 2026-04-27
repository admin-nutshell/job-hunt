import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  experimental: {
    disableIncrementalCache: true,
    disableTagCache: true,
  },
});
