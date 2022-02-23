import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, assetToString, bn, Chain, THORChain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { SymDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { ASYM_DEPOSIT_TOOL_URL, RECOVERY_TOOL_URL, ZERO_BN, ZERO_POOL_DATA } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { FundsCap, useFundsCap } from '../../../hooks/useFundsCap'
import { useLiquidityProviders } from '../../../hooks/useLiquidityProviders'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useSymDepositAddresses } from '../../../hooks/useSymDepositAddresses'
import * as poolsRoutes from '../../../routes/pools'
import { PoolAddress, PoolAssetsRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { Props } from './SymDepositView.types'

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

  const { network } = useNetwork()

  const { setAssetWalletType, setRuneWalletType } = useSymDepositAddresses(O.some(asset))

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

  const { symDepositFees$, symDeposit$, reloadSymDepositFees } = useChainContext()

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

  const [balancesState] = useObservableState(
    () =>
      balancesState$({
        ...DEFAULT_BALANCES_FILTER,
        [Chain.Bitcoin]: 'confirmed'
      }),
    INITIAL_BALANCES_STATE
  )

  const reloadBalances = useCallback(() => {
    reloadBalancesByChain(assetWD.asset.chain)()
    reloadBalancesByChain(THORChain)()
  }, [assetWD.asset.chain, reloadBalancesByChain])

  useEffect(() => {
    // reload balances, whenever sourceAsset and targetAsset have been changed (both are properties of `reloadBalances` )
    reloadBalances()
  }, [reloadBalances])

  const poolAssetsRD: PoolAssetsRD = useObservableState(availableAssets$, RD.initial)

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolDetailRD,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runPrice))
  )

  const { openExplorerTxUrl: openAssetExplorerTxUrl, getExplorerTxUrl: getAssetExplorerTxUrl } = useOpenExplorerTxUrl(
    O.some(asset.chain)
  )

  const { openExplorerTxUrl: openRuneExplorerTxUrl, getExplorerTxUrl: getRuneExplorerTxUrl } = useOpenExplorerTxUrl(
    O.some(THORChain)
  )

  const fundsCap: O.Option<FundsCap> = useMemo(
    () =>
      FP.pipe(
        fundsCapRD,
        RD.getOrElse((): O.Option<FundsCap> => O.none)
      ),
    [fundsCapRD]
  )

  const { symPendingAssets, hasAsymAssets, symAssetMismatch } = useLiquidityProviders({
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
          getRuneExplorerTxUrl={getRuneExplorerTxUrl}
          getAssetExplorerTxUrl={getAssetExplorerTxUrl}
          onChangeAsset={FP.constVoid}
          asset={assetWD}
          assetPrice={ZERO_BN}
          runePrice={ZERO_BN}
          walletBalances={balancesState}
          fees$={symDepositFees$}
          reloadFees={FP.constVoid}
          approveFee$={approveFee$}
          reloadApproveFee={FP.constVoid}
          priceAsset={selectedPricePoolAsset}
          disabled={true}
          poolAddress={O.none}
          reloadBalances={reloadBalances}
          reloadShares={reloadShares}
          reloadSelectedPoolDetail={reloadSelectedPoolDetail}
          poolData={ZERO_POOL_DATA}
          deposit$={symDeposit$}
          network={network}
          approveERC20Token$={approveERC20Token$}
          isApprovedERC20Token$={isApprovedERC20Token$}
          availableAssets={[]}
          fundsCap={O.none}
          poolsData={{}}
          symPendingAssets={RD.initial}
          openRecoveryTool={openRecoveryTool}
          hasAsymAssets={RD.initial}
          symAssetMismatch={RD.initial}
          openAsymDepositTool={openAsymDepositTool}
          setAssetWalletType={setAssetWalletType}
          setRuneWalletType={setRuneWalletType}
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
      getRuneExplorerTxUrl,
      getAssetExplorerTxUrl,
      assetWD,
      balancesState,
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
      openAsymDepositTool,
      setAssetWalletType,
      setRuneWalletType
    ]
  )

  return FP.pipe(
    sequenceTRD(assetPriceRD, poolAssetsRD, poolDetailRD, poolsDataRD),
    RD.fold(
      renderDisabledAddDeposit,
      (_) => renderDisabledAddDeposit(),
      (error) => renderDisabledAddDeposit(error),
      ([assetPrice, poolAssets, poolDetail, poolsData]) => {
        // Since RUNE is not part of pool assets, add it to the list of available assets
        const availableAssets = [AssetRuneNative, ...poolAssets]

        return (
          <>
            <SymDeposit
              haltedChains={haltedChains}
              mimirHalt={mimirHalt}
              validatePassword$={validatePassword$}
              openRuneExplorerTxUrl={openRuneExplorerTxUrl}
              openAssetExplorerTxUrl={openAssetExplorerTxUrl}
              getRuneExplorerTxUrl={getRuneExplorerTxUrl}
              getAssetExplorerTxUrl={getAssetExplorerTxUrl}
              poolData={toPoolData(poolDetail)}
              onChangeAsset={onChangeAsset}
              asset={assetWD}
              assetPrice={assetPrice}
              runePrice={runPrice}
              walletBalances={balancesState}
              poolAddress={oPoolAddress}
              fees$={symDepositFees$}
              reloadFees={reloadSymDepositFees}
              approveFee$={approveFee$}
              reloadApproveFee={reloadApproveFee}
              priceAsset={selectedPricePoolAsset}
              reloadBalances={reloadBalances}
              reloadShares={reloadShares}
              reloadSelectedPoolDetail={reloadSelectedPoolDetail}
              availableAssets={availableAssets}
              deposit$={symDeposit$}
              network={network}
              approveERC20Token$={approveERC20Token$}
              isApprovedERC20Token$={isApprovedERC20Token$}
              fundsCap={fundsCap}
              poolsData={poolsData}
              symPendingAssets={symPendingAssets}
              openRecoveryTool={openRecoveryTool}
              hasAsymAssets={hasAsymAssets}
              symAssetMismatch={symAssetMismatch}
              openAsymDepositTool={openAsymDepositTool}
              setAssetWalletType={setAssetWalletType}
              setRuneWalletType={setRuneWalletType}
            />
          </>
        )
      }
    )
  )
}
