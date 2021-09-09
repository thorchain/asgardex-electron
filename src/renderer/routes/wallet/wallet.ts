import { Address } from '@xchainjs/xchain-client'
import { assetFromString, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { isNonNativeRuneAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { WalletType } from '../../services/wallet/types'
import { Route } from '../types'

export * as imports from './imports'

export * as create from './create'

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

export const REDIRECT_PARAMETER_NAME = 'redirectUrl'

export const locked: Route<RedirectUrl | void> = {
  template: `${base.template}/locked`,
  path(redirectUrl) {
    return redirectUrl ? `${this.template}?${REDIRECT_PARAMETER_NAME}=${redirectUrl}` : this.template
  }
}

export const assets: Route<void> = {
  template: `${base.template}/assets`,
  path() {
    return this.template
  }
}

export const poolShares: Route<void> = {
  template: `${base.template}/poolshares`,
  path() {
    return this.template
  }
}

export type DepositParams = { walletAddress: string; walletType: WalletType }
export const deposit: Route<DepositParams> = {
  template: `${assets.template}/deposit/:walletType/:walletAddress`,
  path({ walletType, walletAddress }) {
    if (walletAddress) {
      return `${assets.template}/deposit/${walletType}/${walletAddress}`
    } else {
      // Redirect to assets route if passed param are invalid
      return assets.path()
    }
  }
}

export const bonds: Route<void> = {
  template: `${base.template}/bonds`,
  path() {
    return this.template
  }
}

export type AssetDetailsParams = { asset: string; walletAddress: Address; walletType: WalletType }
export const assetDetail: Route<AssetDetailsParams> = {
  template: `${assets.template}/detail/:walletType/:walletAddress/:asset`,
  path: ({ walletType, asset, walletAddress }) => {
    if (asset && !!walletAddress) {
      return `${assets.template}/detail/${walletType}/${walletAddress}/${asset}`
    } else {
      // Redirect to assets route if passed param is empty
      return assets.path()
    }
  }
}

export type SendParams = { asset: string; walletAddress: string; walletType: WalletType }
export const send: Route<SendParams> = {
  template: `${assetDetail.template}/send`,
  path: ({ asset, walletAddress, walletType }) => {
    if (asset && !!walletAddress) {
      return `${assetDetail.path({ walletType, asset, walletAddress })}/send`
    } else {
      // Redirect to assets route if passed params are empty
      return assets.path()
    }
  }
}

export type AssetUpgradeDetailsParams = {
  asset: string
  walletAddress: string
  network: Network
  walletType: WalletType
}
export const upgradeRune: Route<AssetUpgradeDetailsParams> = {
  template: `${assetDetail.template}/upgrade`,
  path: ({ asset: assetString, walletAddress, network, walletType }) => {
    // Validate asset string to accept BNB.Rune only
    const oAsset = FP.pipe(
      assetFromString(assetString),
      O.fromNullable,
      O.filter((asset) => isNonNativeRuneAsset(asset, network))
    )
    // Simple validation of address
    const oWalletAddress = FP.pipe(
      walletAddress,
      O.fromPredicate((s: string) => s.length > 0)
    )
    return FP.pipe(
      sequenceTOption(oAsset, oWalletAddress),
      O.fold(
        // Redirect to assets route if passed params are empty
        () => assets.path(),
        ([asset, walletAddress]) =>
          `${assetDetail.path({ walletType, asset: assetToString(asset), walletAddress })}/upgrade`
      )
    )
  }
}

export const walletSettings: Route<void> = {
  template: `${base.template}/wallet-settings`,
  path() {
    return this.template
  }
}

export const history: Route<void> = {
  template: `${base.template}/history`,
  path() {
    return this.template
  }
}
