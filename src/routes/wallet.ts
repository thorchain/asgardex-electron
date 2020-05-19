import { Route } from './types'

export const base: Route<void> = {
  template: '/wallet',
  path() {
    return this.template
  }
}

export const settings: Route<void> = {
  template: `${base.template}/settings`,
  path() {
    return this.template
  }
}

export const assets: Route<void> = {
  template: `${base.template}/assets`,
  path() {
    return this.template
  }
}

export const stakes: Route<void> = {
  template: `${base.template}/stakes`,
  path() {
    return this.template
  }
}

export const bonds: Route<void> = {
  template: `${base.template}/bonds`,
  path() {
    return this.template
  }
}

export const fundsReceive: Route<void> = {
  // TODO: Add support for asset/symbol
  template: `${base.template}/funds-receive`,
  path() {
    return this.template
  }
}

export type AssetDetailsRouteParams = { symbol: string }
export const assetDetails: Route<AssetDetailsRouteParams> = {
  template: `${base.template}/asset-details/:symbol`,
  path: ({ symbol }) => {
    if (symbol) {
      return `${base.template}/asset-details/${symbol.toLowerCase()}`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}
