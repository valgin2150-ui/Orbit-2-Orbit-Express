const baseUrl = (process.env.MACHINE_ACCESS_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const paths = ["/", "/tools", "/orbits", "/rockets/firefly-alpha", "/robots.txt", "/sitemap.xml", "/llms.txt"];
const clients = [
  { label: "browser", ua: "Mozilla/5.0 (compatible; MachineAccessCheck/1.0) Chrome/120.0 Safari/537.36" },
  { label: "generic CLI", ua: "curl/8.5.0" },
  { label: "claimed Googlebot (claimed-only)", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { label: "claimed OAI-SearchBot (claimed-only)", ua: "OAI-SearchBot/1.0; +https://openai.com/searchbot" },
];

let failed = false;
for (const client of clients) {
  for (const path of paths) {
    try {
      const response = await fetch(`${baseUrl}${path}`, { headers: { "user-agent": client.ua } });
      console.log(`${client.label.padEnd(42)} ${path.padEnd(30)} ${response.status}`);
      if (response.status === 401 || response.status === 403 || response.status === 429 || response.status >= 500) failed = true;
    } catch (error) {
      failed = true;
      console.error(`${client.label} ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
if (failed) process.exitCode = 1;