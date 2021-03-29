import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/detail`,
  path() {
    return this.template
  }
}

export type PoolDetailRouteParams = { asset: string }
export const poolDetail: Route<PoolDetailRouteParams> = {
  template: `${base.template}/:asset`,
  path: ({ asset }) => {
    if (asset) {
      return `${base.template}/${asset}`
    }
    // Redirect to pools base route if passed params are empty
    return poolsBase.path()
  }
}
