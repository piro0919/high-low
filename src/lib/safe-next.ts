// Where to send someone after the auth callback. `next` comes from the query
// string, so it must stay a path on this site: "@evil.example" turns the origin
// in `${origin}${next}` into userinfo, and "/\evil.example" is read by
// browsers as another host.
export function safeNext(value: string | null, fallback = "/") {
  if (!value?.startsWith("/")) {
    return fallback;
  }
  const base = "http://high-low.invalid";
  const url = new URL(value, base);
  if (url.origin !== base) {
    return fallback;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
