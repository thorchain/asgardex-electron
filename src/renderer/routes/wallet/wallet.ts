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

export type FundsReceiveParams = { asset: string }
export const fundsReceive: Route<FundsReceiveParams> = {
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

export type FundSendParams = { asset: string }
export const fundsSend: Route<FundSendParams> = {
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
