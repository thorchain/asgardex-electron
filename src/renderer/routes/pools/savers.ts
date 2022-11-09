import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/savers`,
  path() {
    return this.template
  }
}
export type SaversRouteParams = { asset: string }
export const savers: Route<SaversRouteParams> = {
  template: `${base.template}/:asset`,
  path: ({ asset }) => {
    if (asset) {
      return `${base.template}/${asset.toLowerCase()}`
    }
    // Redirect to base route if asset param is empty
    return base.path()
  }
}
