/**
 * SSRF protection — blocks requests to private/internal/local addresses.
 */

const BLOCKED_HOSTNAMES = [
  "localhost",
  "::1",
];

// Private IPv4 CIDR blocks as simple prefix checks
const PRIVATE_PREFIXES = [
  "127.",
  "10.",
  "169.254.",  // link-local
  "0.",        // 0.0.0.0/8
];

// 172.16.0.0 – 172.31.255.255
function is172Private(hostname: string): boolean {
  const m = hostname.match(/^172\.(\d+)\./);
  if (!m) return false;
  const n = parseInt(m[1], 10);
  return n >= 16 && n <= 31;
}

// 192.168.x.x
function is192168(hostname: string): boolean {
  return hostname.startsWith("192.168.");
}

export function isSsrfBlocked(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return true; // unparseable URL → block
  }

  // Only allow http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return true;
  }

  const host = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(host)) return true;
  if (PRIVATE_PREFIXES.some((p) => host.startsWith(p))) return true;
  if (is172Private(host)) return true;
  if (is192168(host)) return true;

  return false;
}
