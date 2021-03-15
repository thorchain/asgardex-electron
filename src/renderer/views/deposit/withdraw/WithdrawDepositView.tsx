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
import { Withdraw } from '../../../components/deposit/withdraw'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as shareHelpers from '../../../helpers/poolShareHelper'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolDetailRD, PoolShareRD, PoolDetail, PoolAddress, PoolShare } from '../../../services/midgard/types'
import { getBalanceByAsset } from '../../../services/wallet/util'

type Props = {
  asset: Asset
  poolShare: PoolShareRD
}

export const WithdrawDepositView: React.FC<Props> = (props): JSX.Element => {
  const { asset, poolShare: poolShareRD } = props
  const {
    service: {
      pools: { poolDetail$, selectedPricePoolAsset$, priceRatio$, selectedPoolAddress$ }
    }
  } = useMidgardContext()

  const { withdrawFee$, reloadWithdrawFees, symWithdraw$, getExplorerUrlByAsset$ } = useChainContext()

  const runePrice = useObservableState(priceRatio$, bn(1))

  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)

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

  const runeBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        balances,
        O.chain(getBalanceByAsset(AssetRuneNative)),
        O.map(({ amount }) => amount)
      ),
    [balances]
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
      <Withdraw
        fee$={withdrawFee$}
        assetPrice={ZERO_BN}
        runePrice={runePrice}
        runeBalance={runeBalance}
        selectedPriceAsset={AssetRuneNative}
        shares={{ rune: ZERO_BASE_AMOUNT, asset: ZERO_BASE_AMOUNT }}
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
      runeBalance,
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
      poolDetail,
      selectedPriceAsset
    }: {
      assetPrice: BigNumber
      poolShare: PoolShare
      poolDetail: PoolDetail
      selectedPriceAsset: Asset
    }) => (
      <Withdraw
        assetPrice={assetPrice}
        runePrice={runePrice}
        runeBalance={runeBalance}
        selectedPriceAsset={selectedPriceAsset}
        shares={{
          rune: shareHelpers.getRuneShare(poolShare.units, poolDetail),
          asset: shareHelpers.getAssetShare(poolShare.units, poolDetail)
        }}
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
      runeBalance,
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
    RD.combine(assetPriceRD, poolShareRD, poolDetailRD, selectedPriceAssetRD),
    RD.fold(
      renderEmptyForm,
      renderEmptyForm,
      renderEmptyForm,
      ([assetPrice, oPoolShare, poolDetail, selectedPriceAsset]) =>
        FP.pipe(
          oPoolShare,
          O.fold(
            () => renderEmptyForm(),
            (poolShare) => renderWithdrawReady({ assetPrice, poolShare, poolDetail, selectedPriceAsset })
          )
        )
    )
  )
}
