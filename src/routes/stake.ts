import { Route } from './types'

export const base: Route<void> = {
  template: '/stake',
  path() {
    return this.template
  }
}

export type AssetRouteParams = { asset: string }
export const asset: Route<AssetRouteParams> = {
  template: `${base.template}/:asset`,
  path: ({ asset }) => {
    if (asset) {
      return `/stake/${asset.toLowerCase()}`
    } else {
      // Redirect to base route if asset param is empty
      return base.path()
    }
  }
}
