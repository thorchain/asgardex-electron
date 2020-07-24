import { parse } from 'url'

import * as O from 'fp-ts/lib/Option'

/**
 * Helper to get `hostname` from url
 */
export const getHostnameFromUrl = (url: string): O.Option<string> => {
  const parsed = parse(url, true)
  return O.fromNullable(parsed.hostname)
}
