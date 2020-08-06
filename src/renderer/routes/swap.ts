import { base as poolsBase } from './pools'
import { Route } from './types'

export const base: Route<void> = {
  template: `${poolsBase.template}/swap`,
  path() {
    return this.template
  }
}

export type SwapRouteParams = { source: string; target: string }
export const swap: Route<SwapRouteParams> = {
  /**
   * Use '|' 'cause asset symbols have '-' separator
   */
  template: `${base.template}/:source|:target`,
  path: ({ source, target }) => {
    if (source && target) {
      return `${base.template}/${source.toLowerCase()}|${target.toLowerCase()}`
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
