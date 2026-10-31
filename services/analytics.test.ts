import { afterEach, describe, expect, it, vi } from 'vitest';
import { isProductionHostname, track } from './analytics';

const stubWindow = (hostname: string, gtag?: () => void): void => {
  vi.stubGlobal('window', { location: { hostname }, gtag });
};

describe('isProductionHostname', () => {
  it('accepts the production host', () => {
    expect(isProductionHostname('elf-invaders.vercel.app')).toBe(true);
  });

  it.each(['localhost', '127.0.0.1', 'elf-invaders-git-x.vercel.app', 'elf-invaders.vercel.app.evil.com'])(
    'rejects %s',
    (host) => {
      expect(isProductionHostname(host)).toBe(false);
    }
  );
});

describe('track', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends the event to gtag on the production hostname', () => {
    const gtag = vi.fn();
    stubWindow('elf-invaders.vercel.app', gtag);
    track('post_score', { level: 1, score: 120 });
    expect(gtag).toHaveBeenCalledWith('event', 'post_score', { level: 1, score: 120 });
  });

  it('logs instead of sending elsewhere', () => {
    const gtag = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    stubWindow('localhost', gtag);
    track('level_start', { level: 1 });
    expect(gtag).not.toHaveBeenCalled();
  });

  it('does not throw when gtag throws or is missing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    stubWindow('elf-invaders.vercel.app', () => {
      throw new Error('boom');
    });
    expect(() => track('level_start', { level: 1 })).not.toThrow();
    stubWindow('elf-invaders.vercel.app', undefined);
    expect(() => track('level_start', { level: 1 })).not.toThrow();
  });
});
