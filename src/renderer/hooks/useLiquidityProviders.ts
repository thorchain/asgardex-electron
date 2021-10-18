import { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { Network } from '../../shared/api/types'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { eqOString } from '../helpers/fp/eq'
import {
  LiquidityProvider,
  LiquidityProviderHasAsymAssets,
  LiquidityProviderHasAsymAssetsRD,
  LiquidityProviderRD,
  LiquidityProvidersRD,
  PendingAssetsRD
} from '../services/thorchain/types'
import { AssetsWithAmount1e8 } from '../types/asgardex'

export const useLiquidityProviders = ({
  asset,
  network,
  runeAddress,
  assetAddress
}: {
  asset: Asset
  network: Network
  runeAddress: Address
  assetAddress: Address
}) => {
  const { getLiquidityProviders } = useThorchainContext()

  const [providers] = useObservableState(() => getLiquidityProviders({ asset, network }), RD.initial)

  /**
   * Gets liquidity provider data by given RUNE + asset address
   * Sym. deposit only
   */
  const symLiquidityProvider: LiquidityProviderRD = useMemo(
    () =>
      FP.pipe(
        providers,
        RD.map(
          A.findFirst(
            (provider) =>
              eqOString.equals(provider.runeAddress, O.some(runeAddress)) &&
              eqOString.equals(provider.assetAddress, O.some(assetAddress))
          )
        )
      ),
    [assetAddress, providers, runeAddress]
  )

  /**
   * Pending assets by given RUNE + asset address
   * Sym. deposit only
   */
  const symPendingAssets: PendingAssetsRD = useMemo(
    () =>
      FP.pipe(
        symLiquidityProvider,
        // transform `LiquidityProvider` -> `PendingAssets`
        RD.map((oLiquidityProvider) =>
          FP.pipe(
            oLiquidityProvider,
            O.map(({ pendingAsset, pendingRune }) => [pendingAsset, pendingRune]),
            // filter `None` out from list
            O.map(A.filterMap(FP.identity)),
            O.getOrElse<AssetsWithAmount1e8>(() => [])
          )
        )
      ),
    [symLiquidityProvider]
  )

  const asymLiquidityProviders: LiquidityProvidersRD = useMemo(
    () =>
      FP.pipe(
        providers,
        RD.map(
          A.filter(
            (provider) =>
              // rune side
              (eqOString.equals(provider.runeAddress, O.some(runeAddress)) && O.isNone(provider.assetAddress)) ||
              // asset side
              (eqOString.equals(provider.assetAddress, O.some(assetAddress)) && O.isNone(provider.runeAddress))
          )
        )
      ),
    [providers, runeAddress, assetAddress]
  )

  /**
   * Checks an asym. deposits asset
   */
  const hasAsymAssets: LiquidityProviderHasAsymAssetsRD = useMemo(
    () =>
      FP.pipe(
        asymLiquidityProviders,
        RD.map((providers) =>
          FP.pipe(
            providers,
            A.reduce<LiquidityProvider, LiquidityProviderHasAsymAssets>(
              { asset: false, rune: false },
              (acc, provider) => ({
                asset: O.isSome(provider.assetAddress) || acc.asset,
                rune: O.isSome(provider.runeAddress) || acc.rune
              })
            )
          )
        )
      ),
    [asymLiquidityProviders]
  )

  return {
    symLiquidityProvider,
    symPendingAssets,
    asymLiquidityProviders,
    hasAsymAssets
  }
}
