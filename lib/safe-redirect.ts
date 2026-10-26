/** Only allow redirects to a page on this site (e.g. "/reset-password"); anything else falls back to "/". */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\') || /[\r\n\t]/.test(next)) return '/';
  return next;
}
