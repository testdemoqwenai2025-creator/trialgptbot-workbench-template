"use client";

import { useEffect, useState } from "react";

/**
 * useLiveTick — returns the number of seconds elapsed since the given
 * ISO timestamp, updating every second. Useful for rendering "updated
 * 12s ago" indicators next to live data feeds.
 *
 * Previously a private function inside AdvancedAnalytics.tsx; extracted
 * to /src/hooks/ so any component can reuse it.
 *
 * @param isoTs ISO 8601 timestamp (e.g. "2026-08-14T08:24:11.000Z").
 *   If undefined, the hook returns 0 and does not start a timer.
 *
 * @example
 *   const secs = useLiveTick(edge.lastUpdated);
 *   <span>updated {formatSeconds(secs)} ago</span>
 */
export function useLiveTick(isoTs?: string): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isoTs) return;
    const baseline = Math.max(
      0,
      Math.floor((Date.now() - new Date(isoTs).getTime()) / 1000),
    );
    setSeconds(baseline);
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - new Date(isoTs).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isoTs]);

  return seconds;
}

/**
 * Format a seconds count as a humanized "X ago" string.
 *   - < 60s  → "12s ago"
 *   - < 60m  → "8m ago"
 *   - < 24h  → "3h ago"
 *   - else   → "2d ago"
 */
export function formatSeconds(secs: number): string {
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
