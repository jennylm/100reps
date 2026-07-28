/** Format a rep timestamp for display (en-GB date · time). */
export function formatRepWhen(loggedAt: string): string {
  const d = new Date(loggedAt);
  if (Number.isNaN(d.getTime())) return loggedAt;
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}
