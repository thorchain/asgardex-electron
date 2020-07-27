import * as O from 'fp-ts/lib/Option'

/**
 * Helper to get `hostname` from url
 */
export const getHostnameFromUrl = (url: string): O.Option<string> => O.tryCatch(() => new URL(url).hostname)
