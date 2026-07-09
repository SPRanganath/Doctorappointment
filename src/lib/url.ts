// Render's Blueprint `fromService` env var references resolve to a bare
// hostname (no scheme), so normalize any scheme-less value to https.
export function withScheme(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}
