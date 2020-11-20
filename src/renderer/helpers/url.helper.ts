import * as O from 'fp-ts/Option'

/**
 * queryString might be a full valid address or just a search query
 */
export const getUrlSearchParam = (queryString: string, paramName: string): O.Option<string> => {
  // Need to have fully valid address for URL constructor
  const base = queryString.startsWith('http') ? '' : 'https://base'
  const url = new URL(`${base}${queryString}`)

  const searchStartIndex = url.href.indexOf('?')

  // if there is no `?` symbol => there is no search query at the address
  if (searchStartIndex < 0) {
    return O.none
  }

  const searchQuery = url.href.slice(searchStartIndex)

  const searchParams = new URLSearchParams(searchQuery)

  return O.fromNullable(searchParams.get(paramName))
}
