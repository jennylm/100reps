import { describe, expect, it } from 'vitest';
import {
  formatDurationLabel,
  formatPractisedDuration,
  parseSessionMinutes,
  parseSessionSeconds,
} from './sessionDuration';

describe('sessionDuration', () => {
  it('parses preset minute ids', () => {
    expect(parseSessionMinutes('45')).toBe(45);
    expect(parseSessionSeconds('45')).toBe(45 * 60);
  });

  it('parses custom hour and minute labels', () => {
    expect(parseSessionMinutes('1 hour')).toBe(60);
    expect(parseSessionMinutes('25 minutes')).toBe(25);
    expect(parseSessionMinutes('90m')).toBe(90);
    expect(parseSessionMinutes('1 hour 15 minutes')).toBe(75);
    expect(parseSessionMinutes('2h')).toBe(120);
  });

  it('returns zero for missing or empty values', () => {
    expect(parseSessionMinutes(undefined)).toBe(0);
    expect(parseSessionMinutes('')).toBe(0);
    expect(parseSessionSeconds(undefined)).toBe(0);
  });

  it('formats countdown labels', () => {
    expect(formatDurationLabel(65)).toBe('1:05');
    expect(formatDurationLabel(3600 + 65)).toBe('1:01:05');
    expect(formatDurationLabel(0)).toBe('0:00');
  });

  it('formats affirming practised duration copy', () => {
    expect(formatPractisedDuration(18 * 60)).toBe('18 minutes');
    expect(formatPractisedDuration(60)).toBe('1 minute');
    expect(formatPractisedDuration(90)).toBe('1 minute 30 seconds');
    expect(formatPractisedDuration(3600)).toBe('1 hour');
    expect(formatPractisedDuration(3660)).toBe('1 hour 1 minute');
    expect(formatPractisedDuration(12)).toBe('12 seconds');
  });
});
