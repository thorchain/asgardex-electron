import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/detail`,
  path() {
    return this.template
  }
}

export type PoolDetailRouteParams = { symbol: string }
export const poolDetail: Route<PoolDetailRouteParams> = {
  template: `${base.template}/:symbol`,
  path: ({ symbol }) => {
    if (symbol) {
      return `${base.template}/${symbol}`
    }
    // Redirect to pools base route if passed params are empty
    return poolsBase.path()
  }
}
