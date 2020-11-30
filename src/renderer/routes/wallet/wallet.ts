import { Route } from '../types'
import * as createRoutes from './create'

type RedirectUrl = string

export const base: Route<RedirectUrl | void> = {
  template: '/wallet',
  path(redirectUrl) {
    return redirectUrl ? `${this.template}?redirectUrl=${redirectUrl}` : this.template
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

export const REDIRECT_PARAMETER_NAME = 'redirectUrl'

export const locked: Route<RedirectUrl | void> = {
  template: `${base.template}/locked`,
  path(redirectUrl) {
    return redirectUrl ? `${this.template}?${REDIRECT_PARAMETER_NAME}=${redirectUrl}` : this.template
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

export const deposits: Route<void> = {
  template: `${base.template}/deposits`,
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

export type AssetDetailsParams = { asset: string }
export const assetDetail: Route<AssetDetailsParams> = {
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
