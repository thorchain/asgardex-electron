import * as O from 'fp-ts/Option'
import { useLocation } from 'react-router'

export const useSearchQuery = <T extends object>(): { [key in keyof T]: O.Option<T[key]> } => {
  const searchParams = new URLSearchParams(useLocation().search)

  const getter = (_: unknown, prop: string) => {
    return O.fromNullable(searchParams.get(prop))
  }

  return new Proxy({}, { get: getter }) as { [key in keyof T]: O.Option<T[key]> }
}
