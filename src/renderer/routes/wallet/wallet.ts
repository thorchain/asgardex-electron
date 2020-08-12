import { Route } from '../types'
import * as createRoutes from './create'

export const base: Route<void> = {
  template: '/wallet',
  path() {
    return this.template
  }
}

export const noWallet: Route<void> = {
  template: `${base.template}/noWallet`,
  path() {
    return this.template
  }
}

export const imports: Route<void> = {
  template: `${base.template}/imports`,
  path() {
    return this.template
  }
}

export const locked: Route<void> = {
  template: `${base.template}/locked`,
  path() {
    return this.template
  }
}

export const create = createRoutes

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

export type AssetDetailsRouteParams = { asset: string }
export const assetDetail: Route<AssetDetailsRouteParams> = {
  template: `${assets.template}/detail/:asset`,
  path: ({ asset }) => {
    if (asset) {
      return `${assets.template}/detail/${asset}`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}

export type ReceiveParams = { asset: string }
export const receive: Route<ReceiveParams> = {
  template: `${assetDetail.template}/receive`,
  path: ({ asset }) => {
    if (asset) {
      return `${assetDetail.path({ asset })}/receive`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}

export type SendParams = { asset: string }
export const send: Route<SendParams> = {
  template: `${assetDetail.template}/send`,
  path: ({ asset }) => {
    if (asset) {
      return `${assetDetail.path({ asset })}/send`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}

export type FreezeParams = { asset: string }
export const freeze: Route<FreezeParams> = {
  template: `${assetDetail.template}/freeze`,
  path: ({ asset }) => {
    if (asset) {
      return `${assetDetail.path({ asset })}/freeze`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}

export type UnfreezeParams = { asset: string }
export const unfreeze: Route<UnfreezeParams> = {
  template: `${assetDetail.template}/unfreeze`,
  path: ({ asset }) => {
    if (asset) {
      return `${assetDetail.path({ asset })}/unfreeze`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}
