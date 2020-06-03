import { base as poolsBase } from './pools'
import { Route } from './types'

export const base: Route<void> = {
  template: `${poolsBase.template}/stake`,
  path() {
    return this.template
  }
}
export type StakeRouteParams = { asset: string }
export const stake: Route<StakeRouteParams> = {
  template: `${base.template}/:asset`,
  path: ({ asset }) => {
    if (asset) {
      return `${base.template}/${asset.toLowerCase()}`
    }
    // Redirect to base route if asset param is empty
    return base.path()
  }
}
