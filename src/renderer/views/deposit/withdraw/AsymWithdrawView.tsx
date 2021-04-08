import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, BaseAmount, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { map } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { AsymWithdraw } from '../../../components/deposit/withdraw'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolDetailRD, PoolShareRD, PoolAddress, PoolShare } from '../../../services/midgard/types'
import { getBalanceByAsset } from '../../../services/wallet/util'

type Props = {
  asset: Asset
  poolShare: PoolShareRD
  poolDetail: PoolDetailRD
}

export const AsymWithdrawView: React.FC<Props> = (props): JSX.Element => {
  const { asset, poolShare: poolShareRD, poolDetail: poolDetailRD } = props
  const {
    service: {
      pools: { selectedPricePoolAsset$, priceRatio$, selectedPoolAddress$ }
    }
  } = useMidgardContext()

  const { withdrawFee$, reloadWithdrawFees, symWithdraw$, getExplorerUrlByAsset$ } = useChainContext()

  const runePrice = useObservableState(priceRatio$, bn(1))

  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const [selectedPriceAssetRD]: [RD.RemoteData<Error, Asset>, unknown] = useObservableState(
    () =>
      FP.pipe(
        selectedPricePoolAsset$,
        map((asset) => RD.fromOption(asset, () => Error(''))),
        // In case there is no asset for any reason set basic RUNE asset as alt value
        map(RD.alt((): RD.RemoteData<Error, Asset> => RD.success(AssetRuneNative)))
      ),
    RD.initial
  )

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolDetailRD,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runePrice))
  )

  const {
    balancesState$,
    keystoreService: { validatePassword$ },
    reloadBalances
  } = useWalletContext()

  const [balances] = useObservableState(
    () =>
      FP.pipe(
        balancesState$,
        RxOp.map((state) => state.balances)
      ),
    O.none
  )

  const chainAssetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        balances,
        O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
        O.map(({ amount }) => amount)
      ),
    [asset, balances]
  )

  const getRuneExplorerUrl$ = useMemo(() => getExplorerUrlByAsset$(AssetRuneNative), [getExplorerUrlByAsset$])
  const runeExplorerUrl = useObservableState(getRuneExplorerUrl$, O.none)

  const viewRuneTx = useCallback(
    (txHash: string) => {
      FP.pipe(
        runeExplorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [runeExplorerUrl]
  )

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const renderEmptyForm = useCallback(
    () => (
      <AsymWithdraw
        fee$={withdrawFee$}
        assetPrice={ZERO_BN}
        runePrice={runePrice}
        chainAssetBalance={O.none}
        selectedPriceAsset={AssetRuneNative}
        share={ZERO_BASE_AMOUNT}
        asset={asset}
        reloadFees={reloadWithdrawFees}
        disabled
        poolAddresses={O.none}
        validatePassword$={validatePassword$}
        viewRuneTx={viewRuneTx}
        reloadBalances={reloadBalances}
        withdraw$={symWithdraw$}
        network={network}
      />
    ),
    [
      withdrawFee$,
      runePrice,
      asset,
      reloadWithdrawFees,
      validatePassword$,
      viewRuneTx,
      reloadBalances,
      symWithdraw$,
      network
    ]
  )

  const renderWithdrawReady = useCallback(
    ({
      assetPrice,
      poolShare,
      selectedPriceAsset
    }: {
      assetPrice: BigNumber
      poolShare: PoolShare
      selectedPriceAsset: Asset
    }) => (
      <AsymWithdraw
        assetPrice={assetPrice}
        runePrice={runePrice}
        chainAssetBalance={chainAssetBalance}
        selectedPriceAsset={selectedPriceAsset}
        share={poolShare.assetAddedAmount}
        asset={asset}
        poolAddresses={oPoolAddress}
        fee$={withdrawFee$}
        reloadFees={reloadWithdrawFees}
        validatePassword$={validatePassword$}
        viewRuneTx={viewRuneTx}
        reloadBalances={reloadBalances}
        withdraw$={symWithdraw$}
        network={network}
      />
    ),
    [
      runePrice,
      chainAssetBalance,
      asset,
      oPoolAddress,
      withdrawFee$,
      reloadWithdrawFees,
      validatePassword$,
      viewRuneTx,
      reloadBalances,
      symWithdraw$,
      network
    ]
  )

  return FP.pipe(
    RD.combine(assetPriceRD, poolShareRD, selectedPriceAssetRD),
    RD.fold(renderEmptyForm, renderEmptyForm, renderEmptyForm, ([assetPrice, oPoolShare, selectedPriceAsset]) =>
      FP.pipe(
        oPoolShare,
        O.fold(
          () => renderEmptyForm(),
          (poolShare) => renderWithdrawReady({ assetPrice, poolShare, selectedPriceAsset })
        )
      )
    )
  )
}
