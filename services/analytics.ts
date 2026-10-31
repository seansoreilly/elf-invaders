/**
 * Google Analytics event tracking.
 *
 * Thin typed wrapper around the global `gtag` function. Page views are sent
 * automatically by the `gtag('config', ...)` call in index.html, so only
 * custom events go through here.
 *
 * Events are only sent from the production hostname so preview deployments,
 * localhost and other *.vercel.app traffic don't pollute GA reports.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4/events
 */

const PRODUCTION_HOSTNAMES: readonly string[] = ['elf-invaders.vercel.app'];

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: object) => void;
  }
}

/** Event names and their parameters. Keep in sync with GA4 custom dimensions. */
export interface AnalyticsEvents {
  /** GA4 recommended event: a round started. */
  level_start: { level: number };
  /** GA4 recommended event: a round ended. `success` is true when Christmas was saved. */
  level_end: { level: number; score: number; success: boolean };
  /** GA4 recommended event: the final score of a finished round. */
  post_score: { level: number; score: number };
}

/** True when the hostname is one of the production hostnames. */
export const isProductionHostname = (hostname: string): boolean =>
  PRODUCTION_HOSTNAMES.includes(hostname);

const shouldSend = (): boolean =>
  typeof window !== 'undefined' &&
  isProductionHostname(window.location.hostname) &&
  typeof window.gtag === 'function';

/**
 * Sends a custom event to Google Analytics.
 *
 * Off the production hostname the event is logged to the console instead.
 * Never throws.
 */
export const track = <K extends keyof AnalyticsEvents>(
  eventName: K,
  params: AnalyticsEvents[K]
): void => {
  if (!shouldSend()) {
    console.log(`[Analytics Event]: ${eventName}`, params);
    return;
  }

  try {
    window.gtag?.('event', eventName, params);
  } catch (error) {
    console.error(`[Analytics]: Failed to track event "${eventName}":`, error);
  }
};
