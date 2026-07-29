/**
 * Parse a session length id into minutes.
 * Presets store minutes as digits ("45"). Custom values may include
 * hour/minute labels ("1 hour", "25 minutes", "90m").
 */
export function parseSessionMinutes(sessionLengthId: string | undefined): number {
  if (!sessionLengthId) return 0;
  if (/^\d+$/.test(sessionLengthId)) return Number(sessionLengthId);

  const hours = sessionLengthId.match(/(\d+(?:\.\d+)?)\s*(?:h|hour)/i);
  const minutes = sessionLengthId.match(/(\d+)\s*(?:m|min)/i);
  return Math.round(
    (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0),
  );
}

export function parseSessionSeconds(sessionLengthId: string | undefined): number {
  return parseSessionMinutes(sessionLengthId) * 60;
}

export function formatDurationLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatPractisedDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    const hourPart = `${hours} hour${hours === 1 ? '' : 's'}`;
    if (minutes === 0) return hourPart;
    return `${hourPart} ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  if (minutes > 0) {
    if (seconds === 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`;
}
