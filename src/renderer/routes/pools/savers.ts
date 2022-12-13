import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/savers`,
  path() {
    return this.template
  }
}

export type SaversRouteParams = { asset: string }

export const earn: Route<SaversRouteParams> = {
  template: `${base.template}/:asset/earn`,
  path: ({ asset }) => {
    if (asset) {
      return `${base.template}/${asset.toLowerCase()}/earn`
    }
    // Redirect to base route if asset param is empty
    return base.path()
  }
}

export const withdraw: Route<SaversRouteParams> = {
  template: `${base.template}/:asset/withdraw`,
  path: ({ asset }) => {
    if (asset) {
      return `${base.template}/${asset.toLowerCase()}/withdraw`
    }
    // Redirect to base route if asset param is empty
    return base.path()
  }
}
