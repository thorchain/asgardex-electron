import * as O from 'fp-ts/Option'

export const getUrlSearchParam = (queryString: string, paramName: string): O.Option<string> => {
  const base = queryString.startsWith('http') ? '' : 'https://base'
  const url = new URL(`${base}${queryString}`)

  const searchStartIndex = url.href.indexOf('?')

  if (searchStartIndex < 0) {
    return O.none
  }

  const searchQuery = url.href.slice(searchStartIndex)

  const searchParams = new URLSearchParams(searchQuery)

  return O.fromNullable(searchParams.get(paramName))
}
