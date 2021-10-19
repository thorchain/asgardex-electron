import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, AssetRuneNative, assetToString, BaseAmount, bn, Chain, THORChain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { SymDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { ASYM_DEPOSIT_TOOL_URL, RECOVERY_TOOL_URL, ZERO_BN, ZERO_POOL_DATA } from '../../../const'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { filterWalletBalancesByAssets } from '../../../helpers/walletHelper'
import { FundsCap, useFundsCap } from '../../../hooks/useFundsCap'
import { useLiquidityProviders } from '../../../hooks/useLiquidityProviders'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import * as poolsRoutes from '../../../routes/pools'
import { SymDepositMemo } from '../../../services/chain/types'
import { OpenExplorerTxUrl } from '../../../services/clients'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolAddress, PoolAssetsRD, PoolDetailRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { MimirHalt } from '../../../services/thorchain/types'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { WalletBalances } from '../../../services/wallet/types'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { AssetWithDecimal } from '../../../types/asgardex'

type Props = {
  asset: AssetWithDecimal
  poolDetail: PoolDetailRD
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  runeWalletAddress: Address
  assetWalletAddress: Address
}

export const SymDepositView: React.FC<Props> = (props) => {
  const {
    asset: assetWD,
    poolDetail: poolDetailRD,
    mimirHalt,
    haltedChains,
    runeWalletAddress,
    assetWalletAddress
  } = props
  const { asset } = assetWD
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(poolsRoutes.deposit.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const {
    service: {
      pools: {
        availableAssets$,
        priceRatio$,
        selectedPricePoolAsset$,
        reloadSelectedPoolDetail,
        selectedPoolAddress$,
        reloadInboundAddresses,
        poolsState$
      },
      shares: { reloadShares }
    }
  } = useMidgardContext()

  const { symDepositFees$, symDeposit$, reloadSymDepositFees, symDepositTxMemo$ } = useChainContext()

  const [poolsDataRD] = useObservableState(
    () =>
      FP.pipe(
        poolsState$,
        liveData.map(({ poolsData }) => poolsData)
      ),
    RD.initial
  )

  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const {
    balancesState$,
    keystoreService: { validatePassword$ },
    reloadBalancesByChain
  } = useWalletContext()

  const { data: fundsCapRD } = useFundsCap()

  const { approveERC20Token$, isApprovedERC20Token$, approveFee$, reloadApproveFee } = useEthereumContext()

  // reload inbound addresses at `onMount` to get always latest `pool address` + `feeRates`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const runPrice = useObservableState(priceRatio$, bn(1))
  const [selectedPricePoolAsset] = useObservableState(() => FP.pipe(selectedPricePoolAsset$, RxOp.map(O.toUndefined)))

  const { balances: walletBalances, loading: walletBalancesLoading } = useObservableState(
    balancesState$,
    INITIAL_BALANCES_STATE
  )

  const assetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(asset)),
        O.map(({ amount }) => amount)
      ),
    [asset, walletBalances]
  )

  const runeBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(AssetRuneNative)),
        O.map(({ amount }) => amount)
      ),
    [walletBalances]
  )

  const chainAssetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
        O.map(({ amount }) => amount)
      ),
    [asset, walletBalances]
  )

  const reloadBalances = useCallback(() => {
    reloadBalancesByChain(assetWD.asset.chain)()
    reloadBalancesByChain(THORChain)()
  }, [assetWD.asset.chain, reloadBalancesByChain])

  useEffect(() => {
    // reload balances, whenever sourceAsset and targetAsset have been changed (both are properties of `reloadBalances` )
    reloadBalances()
  }, [reloadBalances])

  const [depositTxMemo]: [O.Option<SymDepositMemo>, unknown] = useObservableState(
    () => symDepositTxMemo$(asset.chain),
    O.none
  )

  const poolAssetsRD: PoolAssetsRD = useObservableState(availableAssets$, RD.initial)

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolDetailRD,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runPrice))
  )

  const openAssetExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(O.some(asset.chain))

  const openRuneExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(O.some(THORChain))

  const fundsCap: O.Option<FundsCap> = useMemo(
    () =>
      FP.pipe(
        fundsCapRD,
        RD.getOrElse((): O.Option<FundsCap> => O.none)
      ),
    [fundsCapRD]
  )

  const { symPendingAssets: symPendingAssetsRD, hasAsymAssets: hasAsymAssetsRD } = useLiquidityProviders({
    asset,
    network,
    runeAddress: runeWalletAddress,
    assetAddress: assetWalletAddress
  })

  const openRecoveryTool = useCallback(
    (): Promise<void> => window.apiUrl.openExternal(RECOVERY_TOOL_URL[network]),
    [network]
  )

  const openAsymDepositTool = useCallback(
    (): Promise<void> => window.apiUrl.openExternal(ASYM_DEPOSIT_TOOL_URL[network]),
    [network]
  )

  const renderDisabledAddDeposit = useCallback(
    (error?: Error) => (
      <>
        {error && (
          <Alert type="error" message={intl.formatMessage({ id: 'common.error' })} description={error.toString()} />
        )}
        <SymDeposit
          haltedChains={haltedChains}
          mimirHalt={mimirHalt}
          validatePassword$={validatePassword$}
          openRuneExplorerTxUrl={openRuneExplorerTxUrl}
          openAssetExplorerTxUrl={openAssetExplorerTxUrl}
          onChangeAsset={FP.constVoid}
          asset={assetWD}
          assetPrice={ZERO_BN}
          runePrice={ZERO_BN}
          assetBalance={O.none}
          walletBalancesLoading={false}
          runeBalance={O.none}
          chainAssetBalance={O.none}
          fees$={symDepositFees$}
          reloadFees={FP.constVoid}
          approveFee$={approveFee$}
          reloadApproveFee={FP.constVoid}
          priceAsset={selectedPricePoolAsset}
          disabled={true}
          poolAddress={O.none}
          memos={O.none}
          reloadBalances={reloadBalances}
          reloadShares={reloadShares}
          reloadSelectedPoolDetail={reloadSelectedPoolDetail}
          poolData={ZERO_POOL_DATA}
          deposit$={symDeposit$}
          network={network}
          approveERC20Token$={approveERC20Token$}
          isApprovedERC20Token$={isApprovedERC20Token$}
          balances={[]}
          fundsCap={O.none}
          poolsData={{}}
          symPendingAssets={RD.initial}
          openRecoveryTool={openRecoveryTool}
          hasAsymAssets={RD.initial}
          openAsymDepositTool={openAsymDepositTool}
        />
      </>
    ),
    [
      intl,
      haltedChains,
      mimirHalt,
      validatePassword$,
      openRuneExplorerTxUrl,
      openAssetExplorerTxUrl,
      assetWD,
      symDepositFees$,
      approveFee$,
      selectedPricePoolAsset,
      reloadBalances,
      reloadShares,
      reloadSelectedPoolDetail,
      symDeposit$,
      network,
      approveERC20Token$,
      isApprovedERC20Token$,
      openRecoveryTool,
      openAsymDepositTool
    ]
  )

  return FP.pipe(
    sequenceTRD(assetPriceRD, poolAssetsRD, poolDetailRD, poolsDataRD),
    RD.fold(
      renderDisabledAddDeposit,
      (_) => renderDisabledAddDeposit(),
      (error) => renderDisabledAddDeposit(error),
      ([assetPrice, poolAssets, poolDetail, poolsData]) => {
        const filteredBalances = FP.pipe(
          walletBalances,
          O.map((balances) => filterWalletBalancesByAssets(balances, poolAssets)),
          O.getOrElse<WalletBalances>(() => [])
        )

        return (
          <>
            <SymDeposit
              haltedChains={haltedChains}
              mimirHalt={mimirHalt}
              validatePassword$={validatePassword$}
              openRuneExplorerTxUrl={openRuneExplorerTxUrl}
              openAssetExplorerTxUrl={openAssetExplorerTxUrl}
              poolData={toPoolData(poolDetail)}
              onChangeAsset={onChangeAsset}
              asset={assetWD}
              assetPrice={assetPrice}
              runePrice={runPrice}
              walletBalancesLoading={walletBalancesLoading}
              assetBalance={assetBalance}
              runeBalance={runeBalance}
              chainAssetBalance={chainAssetBalance}
              poolAddress={oPoolAddress}
              memos={depositTxMemo}
              fees$={symDepositFees$}
              reloadFees={reloadSymDepositFees}
              approveFee$={approveFee$}
              reloadApproveFee={reloadApproveFee}
              priceAsset={selectedPricePoolAsset}
              reloadBalances={reloadBalances}
              reloadShares={reloadShares}
              reloadSelectedPoolDetail={reloadSelectedPoolDetail}
              balances={filteredBalances}
              deposit$={symDeposit$}
              network={network}
              approveERC20Token$={approveERC20Token$}
              isApprovedERC20Token$={isApprovedERC20Token$}
              fundsCap={fundsCap}
              poolsData={poolsData}
              symPendingAssets={symPendingAssetsRD}
              openRecoveryTool={openRecoveryTool}
              hasAsymAssets={hasAsymAssetsRD}
              openAsymDepositTool={openAsymDepositTool}
            />
          </>
        )
      }
    )
  )
}
