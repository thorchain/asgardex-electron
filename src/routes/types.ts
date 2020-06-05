import * as H from 'history'
/**
 * Generic type for any routes
 * `P` can be anything to define parameter(s)
 *
 *
 */
export type Route<P> = {
  template: string
  path: (p: P) => string
}

export type RedirectRouteState = {
  from: H.Location
}
