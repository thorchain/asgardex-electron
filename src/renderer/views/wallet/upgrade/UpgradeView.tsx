import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetFromString, BNBChain, ETHChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { ErrorView } from '../../../components/shared/error'
import { LoadingView } from '../../../components/shared/loading'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { isNonNativeRuneAsset } from '../../../helpers/assetHelper'
import { eqOAsset } from '../../../helpers/fp/eq'
import { addressFromOptionalWalletAddress } from '../../../helpers/walletHelper'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { AssetDetailsParams } from '../../../routes/wallet'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../../services/chain/types'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolAddressRD } from '../../../services/midgard/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { AssetWithDecimal } from '../../../types/asgardex'
import { CommonUpgradeProps } from './types'
import { UpgradeBNB } from './UpgradeViewBNB'
import { UpgradeETH } from './UpgradeViewETH'

type Props = {}

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress, walletType, walletIndex } = useParams<AssetDetailsParams>()

  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { validateAddress } = useValidateAddress(THORChain)

  const { addressByChain$, upgradeRuneToNative$, assetWithDecimal$ } = useChainContext()

  // Accept [CHAIN].Rune only
  const oRuneNonNativeAsset: O.Option<Asset> = useMemo(
    () =>
      FP.pipe(
        assetFromString(asset),
        O.fromNullable,
        O.filter((asset) => isNonNativeRuneAsset(asset, network))
      ),
    [asset, network]
  )

  const [runeNonNativeAssetRD, updateRuneNonNativeAssetRD] = useObservableState<AssetWithDecimalRD, O.Option<Asset>>(
    (oRuneNonNativeAsset$) =>
      FP.pipe(
        // Note: network$ is needed to get latest network changes
        // using `network` from `useObservableState` above  has no effect here
        Rx.combineLatest([oRuneNonNativeAsset$, network$]),
        RxOp.switchMap(([oAsset, network]) =>
          FP.pipe(
            oAsset,
            O.map((asset) => assetWithDecimal$(asset, network)),
            O.getOrElse((): AssetWithDecimalLD => Rx.of(RD.initial))
          )
        )
      ),
    RD.initial
  )

  const {
    balancesState$,
    keystoreService: { validatePassword$ },
    getLedgerAddress$,
    reloadBalancesByChain
  } = useWalletContext()

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  const {
    service: {
      pools: { poolAddressesByChain$, reloadInboundAddresses }
    }
  } = useMidgardContext()

  // reload inbound addresses at `onMount` to get always latest `pool address`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const [oRuneNativeAddress] = useObservableState<O.Option<Address>>(
    () => FP.pipe(addressByChain$(THORChain), RxOp.map(addressFromOptionalWalletAddress)),
    O.none
  )

  const runeNativeLedgerAddress$ = useMemo(
    () =>
      FP.pipe(
        getLedgerAddress$(THORChain, network),
        RxOp.map((rdAddress) => RD.toOption(rdAddress)),
        RxOp.map(addressFromOptionalWalletAddress)
      ),

    [getLedgerAddress$, network]
  )
  const oRuneNativeLedgerAddress = useObservableState(runeNativeLedgerAddress$, O.none)

  const [targetPoolAddressRD, updateTargetPoolAddressRD] = useObservableState<PoolAddressRD, O.Option<Asset>>(
    (oRuneNonNativeAsset$) =>
      FP.pipe(
        oRuneNonNativeAsset$,
        RxOp.distinctUntilChanged(eqOAsset.equals),
        RxOp.switchMap(
          FP.flow(
            O.fold(
              // No subscription of `poolAddresses$ ` needed for other assets than [CHAIN].RUNE
              () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'wallet.errors.asset.notExist' }, { asset })))),
              (asset) => poolAddressesByChain$(asset.chain)
            )
          )
        )
      ),
    RD.initial
  )

  /** Effect to re-trigger calculations for useObservableState's */
  useEffect(() => {
    updateTargetPoolAddressRD(oRuneNonNativeAsset)
    updateRuneNonNativeAssetRD(oRuneNonNativeAsset)
  }, [oRuneNonNativeAsset, updateRuneNonNativeAssetRD, updateTargetPoolAddressRD])

  const renderDataError = useCallback(
    (error: Error) => (
      <ErrorView
        title={intl.formatMessage(
          { id: 'wallet.upgrade.error.data' },
          {
            asset
          }
        )}
        subTitle={error?.message ?? error.toString()}
      />
    ),
    [asset, intl]
  )

  const renderUpgradeComponent = useCallback(({ asset }: AssetWithDecimal, props: CommonUpgradeProps) => {
    switch (asset.chain) {
      case BNBChain: {
        return <UpgradeBNB {...props} />
      }
      case ETHChain: {
        return <UpgradeETH {...props} />
      }
      default:
        return null
    }
  }, [])

  const reloadOnError = useCallback(() => {
    // Reload inbound addresses in case previously it was failed
    FP.pipe(targetPoolAddressRD, O.fromPredicate(RD.isFailure), O.map(reloadInboundAddresses))

    // Reload chain's balances in case previously it was failed
    FP.pipe(
      oRuneNonNativeAsset,
      O.map(({ chain }) => chain),
      O.map(reloadBalancesByChain),
      O.ap(O.fromPredicate(O.isNone)(oBalances))
    )
  }, [reloadInboundAddresses, reloadBalancesByChain, oRuneNonNativeAsset, oBalances, targetPoolAddressRD])

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(
    FP.pipe(
      oRuneNonNativeAsset,
      O.map(({ chain }) => chain)
    )
  )

  return (
    <>
      <BackLink />
      {FP.pipe(
        runeNonNativeAssetRD,
        RD.fold(
          () => <></>,
          () => <LoadingView size="large" />,
          renderDataError,
          (runeAsset) =>
            FP.pipe(
              // Show an error by invalid address
              // All other values should be immediately available by entering the `UpgradeView`
              oRuneNativeAddress,
              O.fold(
                () => renderDataError(Error('Could not get address from asset')),
                (runeNativeAddress) => {
                  return renderUpgradeComponent(runeAsset, {
                    addressValidation: validateAddress,
                    walletAddress,
                    walletType,
                    walletIndex: parseInt(walletIndex),
                    runeAsset,
                    runeNativeAddress,
                    runeNativeLedgerAddress: oRuneNativeLedgerAddress,
                    targetPoolAddressRD,
                    validatePassword$,
                    upgrade$: upgradeRuneToNative$,
                    balances: oBalances,
                    successActionHandler: openExplorerTxUrl,
                    getExplorerTxUrl,
                    reloadBalancesHandler: reloadBalancesByChain(runeAsset.asset.chain),
                    network,
                    reloadOnError
                  })
                }
              )
            )
        )
      )}
    </>
  )
}
