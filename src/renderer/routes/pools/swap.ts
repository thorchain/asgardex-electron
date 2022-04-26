import { Route } from '../types'
import { base as poolsBase } from './base'

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
   * `walletType` - wallet type of the source
   */
  template: `${base.template}/:source|:target`,
  path: ({ source, target }) => {
    console.log('swap pth:', source, target)
    if (!!source && !!target) {
      return `${base.template}/${source.toLowerCase()}|${target.toLowerCase()}`
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
