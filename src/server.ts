// Server entry point - disabled for SPA testing
// This file is only used in SSR mode (Cloudflare Workers)
// In SPA mode on FTP, this should not be executed

console.log("Server.ts loaded - SSR mode (should not appear in SPA)");

export default {
  async fetch(request: Request) {
    return new Response("SPA Mode - Server not used", { status: 200 });
  },
};
