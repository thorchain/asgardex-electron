import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, BaseAmount, bn, THORChain } from '@xchainjs/xchain-util'
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
import * as ShareHelpers from '../../../helpers/poolShareHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { OpenExplorerTxUrl } from '../../../services/clients'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolShare, PoolsDataMap } from '../../../services/midgard/types'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { PoolDetail } from '../../../types/generated/midgard'
import { Props } from './WithdrawDepositView.types'

export const WithdrawDepositView: React.FC<Props> = (props): JSX.Element => {
  const {
    asset: assetWD,
    poolShare: poolShareRD,
    poolDetail: poolDetailRD,
    haltedChains,
    mimirHalt,
    assetWalletAddress,
    runeWalletAddress
  } = props
  const { decimal: assetDecimal } = assetWD
  const {
    service: {
      pools: { selectedPricePoolAsset$, priceRatio$, poolsState$ },
      shares: { reloadShares }
    }
  } = useMidgardContext()

  const { symWithdrawFee$, reloadWithdrawFees, symWithdraw$ } = useChainContext()
  const runePrice = useObservableState(priceRatio$, bn(1))

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

  const [poolsDataRD] = useObservableState(
    () =>
      FP.pipe(
        poolsState$,
        liveData.map(({ poolsData }) => poolsData)
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

  const openRuneExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(O.some(THORChain))

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const reloadBalancesAndShares = useCallback(() => {
    reloadBalances()
    reloadShares(5000)
  }, [reloadBalances, reloadShares])

  const renderEmptyForm = useCallback(
    () => (
      <Withdraw
        haltedChains={haltedChains}
        mimirHalt={mimirHalt}
        fees$={symWithdrawFee$}
        assetPrice={ZERO_BN}
        assetWalletAddress={assetWalletAddress}
        runePrice={runePrice}
        runeWalletAddress={runeWalletAddress}
        runeBalance={runeBalance}
        selectedPriceAsset={AssetRuneNative}
        shares={{ rune: ZERO_BASE_AMOUNT, asset: ZERO_BASE_AMOUNT }}
        asset={assetWD}
        reloadFees={reloadWithdrawFees}
        disabled
        validatePassword$={validatePassword$}
        openRuneExplorerTxUrl={openRuneExplorerTxUrl}
        reloadBalances={reloadBalancesAndShares}
        withdraw$={symWithdraw$}
        network={network}
        poolsData={{}}
      />
    ),
    [
      haltedChains,
      mimirHalt,
      symWithdrawFee$,
      assetWalletAddress,
      runePrice,
      runeWalletAddress,
      runeBalance,
      assetWD,
      reloadWithdrawFees,
      validatePassword$,
      openRuneExplorerTxUrl,
      reloadBalancesAndShares,
      symWithdraw$,
      network
    ]
  )

  const renderWithdrawReady = useCallback(
    ({
      assetPrice,
      poolShare: { units: liquidityUnits },
      poolDetail,
      selectedPriceAsset,
      poolsData
    }: {
      assetPrice: BigNumber
      poolShare: PoolShare
      poolDetail: PoolDetail
      selectedPriceAsset: Asset
      poolsData: PoolsDataMap
    }) => (
      <Withdraw
        haltedChains={haltedChains}
        mimirHalt={mimirHalt}
        assetPrice={assetPrice}
        assetWalletAddress={assetWalletAddress}
        runePrice={runePrice}
        runeWalletAddress={runeWalletAddress}
        runeBalance={runeBalance}
        selectedPriceAsset={selectedPriceAsset}
        shares={{
          rune: ShareHelpers.getRuneShare(liquidityUnits, poolDetail),
          asset: ShareHelpers.getAssetShare({ liquidityUnits, detail: poolDetail, assetDecimal })
        }}
        asset={assetWD}
        fees$={symWithdrawFee$}
        reloadFees={reloadWithdrawFees}
        validatePassword$={validatePassword$}
        openRuneExplorerTxUrl={openRuneExplorerTxUrl}
        reloadBalances={reloadBalancesAndShares}
        withdraw$={symWithdraw$}
        network={network}
        poolsData={poolsData}
      />
    ),
    [
      haltedChains,
      mimirHalt,
      assetWalletAddress,
      runePrice,
      runeWalletAddress,
      runeBalance,
      assetDecimal,
      assetWD,
      symWithdrawFee$,
      reloadWithdrawFees,
      validatePassword$,
      openRuneExplorerTxUrl,
      reloadBalancesAndShares,
      symWithdraw$,
      network
    ]
  )

  return FP.pipe(
    RD.combine(assetPriceRD, poolShareRD, poolDetailRD, selectedPriceAssetRD, poolsDataRD),
    RD.fold(
      renderEmptyForm,
      renderEmptyForm,
      renderEmptyForm,
      ([assetPrice, oPoolShare, poolDetail, selectedPriceAsset, poolsData]) =>
        FP.pipe(
          oPoolShare,
          O.fold(
            () => renderEmptyForm(),
            (poolShare) => renderWithdrawReady({ assetPrice, poolShare, poolDetail, selectedPriceAsset, poolsData })
          )
        )
    )
  )
}
