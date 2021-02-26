import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, BNBChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { Upgrade } from '../../components/wallet/txs/upgrade'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneBnbAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { AssetDetailsParams } from '../../routes/wallet'
import { DEFAULT_NETWORK } from '../../services/const'
import { getPoolAddressByChain } from '../../services/midgard/utils'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'

type Props = {}

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const { asset } = useParams<AssetDetailsParams>()

  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  // accept BNB.Rune only
  const oRuneBnbAsset = useMemo(() => FP.pipe(assetFromString(asset), O.fromNullable, O.filter(isRuneBnbAsset)), [
    asset
  ])

  const {
    balancesState$,
    getExplorerTxUrl$,
    keystoreService: { validatePassword$ },
    reloadBalances
  } = useWalletContext()
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const oGetExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const { fees$: bnbFees$, reloadFees: reloadBnbFees } = useBinanceContext()
  const { addressByChain$, upgradeBnbRune$ } = useChainContext()

  const {
    service: {
      pools: { poolAddresses$ }
    }
  } = useMidgardContext()

  const [upgradeFeeRD] = useObservableState(
    () =>
      FP.pipe(
        oRuneBnbAsset,
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
        oRuneBnbAsset,
        O.fold(
          () => Rx.of(O.none),
          // We do need rune native address to upgrade BNB.RUNE only
          () => addressByChain$(THORChain)
        )
      ),
    O.none
  )

  const [bnbPoolAddressRD] = useObservableState(
    () =>
      FP.pipe(
        oRuneBnbAsset,
        O.fold(
          // No subscription of `poolAddresses$ ` needed for other assets than BNB.RUNE
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'wallet.errors.asset.notExist' }, { asset })))),
          (_) =>
            FP.pipe(
              poolAddresses$,
              liveData.map((endpoints) => getPoolAddressByChain(endpoints, BNBChain)),
              RxOp.map((rd) =>
                FP.pipe(
                  rd,
                  RD.chain((oAddress) =>
                    RD.fromOption(oAddress, () =>
                      Error(intl.formatMessage({ id: 'wallet.errors.address.couldNotFind' }, { pool: BNBChain }))
                    )
                  )
                )
              )
            )
        )
      ),
    RD.initial
  )

  const renderAssetError = useMemo(
    () =>
      O.isNone(oRuneBnbAsset) ? (
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
    [asset, intl, oRuneBnbAsset]
  )

  return FP.pipe(
    // Show an error by invalid or missing asset in route only
    // All other values should be immediately available by entering the `UpgradeView`
    sequenceTOption(oRuneBnbAsset, oRuneNativeAddress, oGetExplorerTxUrl),
    O.fold(
      () => renderAssetError,
      ([runeBnbAsset, runeNativeAddress, getExplorerTxUrl]) => {
        const successActionHandler = (txHash: string): Promise<void> =>
          FP.pipe(txHash, getExplorerTxUrl, window.apiUrl.openExternal)

        return (
          <>
            <BackLink />
            <Upgrade
              runeAsset={runeBnbAsset}
              runeNativeAddress={runeNativeAddress}
              bnbPoolAddressRD={bnbPoolAddressRD}
              validatePassword$={validatePassword$}
              upgrade$={upgradeBnbRune$}
              reloadFeeHandler={reloadBnbFees}
              fee={upgradeFeeRD}
              balances={oBalances}
              successActionHandler={successActionHandler}
              reloadBalancesHandler={reloadBalances}
              network={network}
            />
          </>
        )
      }
    )
  )
}
