import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { Upgrade } from '../../components/wallet/txs/upgrade'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { AssetDetailsParams } from '../../routes/wallet'
// import { assetWithDecimal$ } from '../../services/chain'
import { DEFAULT_NETWORK } from '../../services/const'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import { AssetWithDecimal } from '../../types/asgardex'

type Props = {}

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress } = useParams<AssetDetailsParams>()

  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { addressByChain$, upgradeRuneToNative$, assetWithDecimal$ } = useChainContext()

  // accept BNB.Rune only
  const runeNonNativeAsset$ = useMemo(
    () =>
      FP.pipe(
        assetFromString(asset),
        O.fromNullable,
        O.filter(isRuneAsset),
        O.map((asset) => FP.pipe(assetWithDecimal$(asset, network), liveData.toOption$)),
        O.getOrElse((): Rx.Observable<O.Option<AssetWithDecimal>> => Rx.EMPTY)
      ),
    [asset, network, assetWithDecimal$]
  )

  const oRuneNonNativeAsset = useObservableState(runeNonNativeAsset$, O.none)

  const {
    balancesState$,
    getExplorerTxUrl$,
    keystoreService: { validatePassword$ },
    reloadBalancesByChain
  } = useWalletContext()
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const oGetExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const { fees$: bnbFees$, reloadFees: reloadBnbFees } = useBinanceContext()

  const {
    service: {
      pools: { poolAddressesByChain$, reloadInboundAddresses }
    }
  } = useMidgardContext()

  // reload inbound addresses at `onMount` to get always latest `pool address`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const [upgradeFeeRD] = useObservableState(
    () =>
      FP.pipe(
        oRuneNonNativeAsset,
        O.fold(
          // No subscription of `fees$ ` needed for other assets than BNB.RUNE
          () => Rx.EMPTY,
          (_) =>
            FP.pipe(
              bnbFees$(),
              liveData.map((fees) => fees.fast)
            )
        )
      ),
    RD.initial
  )

  const [oRuneNativeAddress] = useObservableState(
    () =>
      FP.pipe(
        oRuneNonNativeAsset,
        O.fold(
          () => Rx.of(O.none),
          // We do need rune native address to upgrade BNB.RUNE only
          () => addressByChain$(THORChain)
        )
      ),
    O.none
  )

  const [targetPoolAddressRD] = useObservableState(
    () =>
      FP.pipe(
        oRuneNonNativeAsset,
        O.fold(
          // No subscription of `poolAddresses$ ` needed for other assets than BNB.RUNE
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'wallet.errors.asset.notExist' }, { asset })))),
          ({ asset }) => poolAddressesByChain$(asset.chain)
        )
      ),
    RD.initial
  )

  const renderAssetError = useMemo(
    () =>
      O.isNone(oRuneNonNativeAsset) ? (
        <>
          <BackLink />
          <ErrorView
            title={intl.formatMessage(
              { id: 'routes.invalid.asset' },
              {
                asset
              }
            )}
          />
        </>
      ) : (
        <></>
      ),
    [asset, intl, oRuneNonNativeAsset]
  )

  return FP.pipe(
    // Show an error by invalid or missing asset in route only
    // All other values should be immediately available by entering the `UpgradeView`
    sequenceTOption(oRuneNonNativeAsset, oRuneNativeAddress, oGetExplorerTxUrl),
    O.fold(
      () => renderAssetError,
      ([runeBnbAsset, runeNativeAddress, getExplorerTxUrl]) => {
        const successActionHandler = (txHash: string): Promise<void> =>
          FP.pipe(txHash, getExplorerTxUrl, window.apiUrl.openExternal)

        return (
          <>
            <BackLink />
            <Upgrade
              walletAddress={walletAddress}
              runeAsset={runeBnbAsset}
              runeNativeAddress={runeNativeAddress}
              bnbPoolAddressRD={targetPoolAddressRD}
              validatePassword$={validatePassword$}
              upgrade$={upgradeRuneToNative$}
              reloadFeeHandler={reloadBnbFees}
              fee={upgradeFeeRD}
              balances={oBalances}
              successActionHandler={successActionHandler}
              reloadBalancesHandler={reloadBalancesByChain(runeBnbAsset.asset.chain)}
              network={network}
            />
          </>
        )
      }
    )
  )
}
