import { Route } from '../types'

export const base: Route<void> = {
  template: `/pools/detail`,
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
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
