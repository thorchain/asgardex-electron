import { Route } from './types'

export const base: Route<void> = {
  template: '/swap',
  path() {
    return this.template
  }
}

export type SwapRouteParams = { source: string; target: string }
export const swap: Route<SwapRouteParams> = {
  template: `${base.template}/:source-:target`,
  path: ({ source, target }) => {
    if (source && target) {
      return `/swap/${source.toLowerCase()}-${target.toLowerCase()}`
    } else {
      // Redirect to base route if passed params are empty
      return base.path()
    }
  }
}
