import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, assetToString, Chain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { SymDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { ASYM_DEPOSIT_TOOL_URL, RECOVERY_TOOL_URL, ZERO_POOL_DATA } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import { useLiquidityProviders } from '../../../hooks/useLiquidityProviders'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useProtocolLimit } from '../../../hooks/useProtocolLimit'
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
  const navigate = useNavigate()
  const intl = useIntl()

  const { network } = useNetwork()

  const { setAssetWalletType, setRuneWalletType } = useSymDepositAddresses(O.some(asset))

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      navigate(poolsRoutes.deposit.path({ asset: assetToString(asset) }), { replace: true })
    },
    [navigate]
  )

  const { reloadInboundAddresses } = useThorchainContext()

  const {
    service: {
      pools: { availableAssets$, reloadSelectedPoolDetail, selectedPoolAddress$, poolsState$, selectedPricePool$ },
      shares: { reloadShares }
    }
  } = useMidgardContext()

  const { symDepositFees$, symDeposit$, reloadSymDepositFees } = useChainContext()

  const poolsState = useObservableState(poolsState$, RD.initial)

  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const {
    balancesState$,
    keystoreService: { validatePassword$ },
    reloadBalancesByChain
  } = useWalletContext()

  const { data: protocolLimitRD } = useProtocolLimit()

  const { approveERC20Token$, isApprovedERC20Token$, approveFee$, reloadApproveFee } = useEthereumContext()

  // reload inbound addresses at `onMount` to get always latest `pool address` + `feeRates`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const pricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

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

  const { openExplorerTxUrl: openAssetExplorerTxUrl, getExplorerTxUrl: getAssetExplorerTxUrl } = useOpenExplorerTxUrl(
    O.some(asset.chain)
  )

  const { openExplorerTxUrl: openRuneExplorerTxUrl, getExplorerTxUrl: getRuneExplorerTxUrl } = useOpenExplorerTxUrl(
    O.some(THORChain)
  )

  const protocolLimitReached = useMemo(
    () =>
      FP.pipe(
        protocolLimitRD,
        RD.map(({ reached }) => reached && network !== 'testnet' /* ignore it on testnet */),
        RD.getOrElse(() => false)
      ),
    [network, protocolLimitRD]
  )

  const { symPendingAssets, hasAsymAssets, symAssetMismatch } = useLiquidityProviders({
    asset,
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
          walletBalances={balancesState}
          fees$={symDepositFees$}
          reloadFees={FP.constVoid}
          approveFee$={approveFee$}
          reloadApproveFee={FP.constVoid}
          pricePool={pricePool}
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
          protocolLimitReached={protocolLimitReached}
          poolDetails={[]}
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
      pricePool,
      reloadBalances,
      reloadShares,
      reloadSelectedPoolDetail,
      symDeposit$,
      network,
      approveERC20Token$,
      isApprovedERC20Token$,
      protocolLimitReached,
      openRecoveryTool,
      openAsymDepositTool,
      setAssetWalletType,
      setRuneWalletType
    ]
  )

  return FP.pipe(
    sequenceTRD(poolAssetsRD, poolDetailRD, poolsState),
    RD.fold(
      renderDisabledAddDeposit,
      (_) => renderDisabledAddDeposit(),
      (error) => renderDisabledAddDeposit(error),
      ([poolAssets, poolDetail, { poolsData, poolDetails }]) => {
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
              walletBalances={balancesState}
              poolAddress={oPoolAddress}
              fees$={symDepositFees$}
              reloadFees={reloadSymDepositFees}
              approveFee$={approveFee$}
              reloadApproveFee={reloadApproveFee}
              pricePool={pricePool}
              reloadBalances={reloadBalances}
              reloadShares={reloadShares}
              reloadSelectedPoolDetail={reloadSelectedPoolDetail}
              availableAssets={availableAssets}
              deposit$={symDeposit$}
              network={network}
              approveERC20Token$={approveERC20Token$}
              isApprovedERC20Token$={isApprovedERC20Token$}
              protocolLimitReached={protocolLimitReached}
              poolDetails={poolDetails}
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
