import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/deposit`,
  path() {
    return this.template
  }
}
export type DepositRouteParams = { asset: string }
export const deposit: Route<DepositRouteParams> = {
  template: `${base.template}/:asset`,
  path: ({ asset }) => {
    if (asset) {
      return `${base.template}/${asset.toLowerCase()}`
    }
    // Redirect to base route if asset param is empty
    return base.path()
  }
}
