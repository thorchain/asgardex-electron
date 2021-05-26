import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, BNBChain, ETHChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { Network } from '../../../../shared/api/types'
import { ErrorView } from '../../../components/shared/error'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { isRuneAsset } from '../../../helpers/assetHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { AssetDetailsParams } from '../../../routes/wallet'
import { AssetWithDecimalLD } from '../../../services/chain/types'
import { DEFAULT_NETWORK } from '../../../services/const'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { AssetWithDecimal } from '../../../types/asgardex'
import { CommonUpgradeProps } from './types'
import { UpgradeBNB } from './UpgradeViewBNB'
import { UpgradeETH } from './UpgradeViewETH'

type Props = {}

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress } = useParams<AssetDetailsParams>()

  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { addressByChain$, upgradeRuneToNative$, assetWithDecimal$ } = useChainContext()

  // Accept [CHAIN].Rune only
  const runeNonNativeAsset = useMemo(
    () => FP.pipe(assetFromString(asset), O.fromNullable, O.filter(isRuneAsset)),
    [asset]
  )

  const runeNonNativeAssetWithDecimal$ = useMemo(
    () =>
      FP.pipe(
        runeNonNativeAsset,
        O.map((asset) => assetWithDecimal$(asset, network)),
        O.getOrElse((): AssetWithDecimalLD => Rx.EMPTY)
      ),
    [runeNonNativeAsset, network, assetWithDecimal$]
  )

  const runeNonNativeAssetRD = useObservableState(runeNonNativeAssetWithDecimal$, RD.initial)

  const {
    balancesState$,
    getExplorerTxUrl$,
    keystoreService: { validatePassword$ },
    reloadBalancesByChain
  } = useWalletContext()
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const oGetExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const {
    service: {
      pools: { poolAddressesByChain$, reloadInboundAddresses }
    }
  } = useMidgardContext()

  // reload inbound addresses at `onMount` to get always latest `pool address`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const [oRuneNativeAddress] = useObservableState(() => addressByChain$(THORChain), O.none)

  const [targetPoolAddressRD] = useObservableState(
    () =>
      FP.pipe(
        runeNonNativeAsset,
        O.fold(
          // No subscription of `poolAddresses$ ` needed for other assets than [CHAIN].RUNE
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'wallet.errors.asset.notExist' }, { asset })))),
          (asset) => poolAddressesByChain$(asset.chain)
        )
      ),
    RD.initial
  )

  const renderAssetError = useCallback(
    () =>
      FP.pipe(
        runeNonNativeAssetRD,
        RD.fold(
          () => <>initial</>,
          () => <>pending</>,
          () => (
            <ErrorView
              title={intl.formatMessage(
                { id: 'routes.invalid.asset' },
                {
                  asset
                }
              )}
            />
          ),
          () => <>success</>
        )
      ),
    [asset, intl, runeNonNativeAssetRD]
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
    FP.pipe(O.some(reloadInboundAddresses), O.ap(O.fromPredicate(RD.isFailure)(targetPoolAddressRD)))

    // Reload chain's balances in case previously it was failed
    FP.pipe(
      runeNonNativeAsset,
      O.map(({ chain }) => chain),
      O.map(reloadBalancesByChain),
      O.ap(O.fromPredicate(O.isNone)(oBalances))
    )
  }, [reloadInboundAddresses, reloadBalancesByChain, runeNonNativeAsset, oBalances, targetPoolAddressRD])

  return (
    <>
      <BackLink />
      {FP.pipe(
        runeNonNativeAssetRD,
        RD.fold(
          () => <></>,
          () => <>pending</>,
          renderAssetError,
          (runeAsset) =>
            FP.pipe(
              // Show an error by invalid or missing asset in route only
              // All other values should be immediately available by entering the `UpgradeView`
              sequenceTOption(oRuneNativeAddress, oGetExplorerTxUrl),
              O.fold(
                () => <>no runeAsset</>,
                ([runeNativeAddress, getExplorerTxUrl]) => {
                  const successActionHandler = (txHash: string): Promise<void> =>
                    FP.pipe(txHash, getExplorerTxUrl, window.apiUrl.openExternal)

                  return renderUpgradeComponent(runeAsset, {
                    walletAddress,
                    runeAsset,
                    runeNativeAddress,
                    targetPoolAddressRD,
                    validatePassword$,
                    upgrade$: upgradeRuneToNative$,
                    balances: oBalances,
                    successActionHandler,
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
