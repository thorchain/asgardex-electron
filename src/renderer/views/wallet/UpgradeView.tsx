import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, assetToString, BNBChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { Upgrade } from '../../components/wallet/txs/upgrade'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneBnbAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { UpgradeBnbRuneParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { INITIAL_UPGRADE_RUNE_STATE } from '../../services/chain/const'
import { getPoolAddressByChain } from '../../services/midgard/utils'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'

type Props = {}

type ErrorViewData = { invalidAsset: boolean; missingRuneAddress: boolean; missingExplorerUrl: boolean }

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const { runeAsset: runeAssetString, walletAddress } = useParams<UpgradeBnbRuneParams>()

  const intl = useIntl()

  // accept BNB.Rune only
  const oRuneBnbAsset = useMemo(
    () => FP.pipe(assetFromString(runeAssetString), O.fromNullable, O.filter(isRuneBnbAsset)),
    [runeAssetString]
  )

  const {
    balancesState$,
    getExplorerTxUrl$,
    keystoreService: { validatePassword$ },
    reloadBalances
  } = useWalletContext()
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const oGetExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const { fees$: bnbFees$, reloadFees: reloadBnbFees } = useBinanceContext()
  const { addressByChain$ } = useChainContext()

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
              bnbFees$,
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
          () => Rx.of(RD.failure(Error('No BNB.RUNE asset'))),
          (_) =>
            FP.pipe(
              poolAddresses$,
              liveData.map((endpoints) => getPoolAddressByChain(endpoints, BNBChain)),
              RxOp.map((rd) =>
                FP.pipe(
                  rd,
                  // TODO @(Veado) Add i18n
                  RD.chain((oAddress) => RD.fromOption(oAddress, () => Error('Could not find pool address')))
                )
              )
            )
        )
      ),
    RD.initial
  )

  const renderDataError = useCallback(
    ({ invalidAsset, missingRuneAddress, missingExplorerUrl }: ErrorViewData) => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              runeAssetString
            }
          )}
          // TODO (@Veado) Add i18n
          subTitle={JSON.stringify({ invalidAsset, missingRuneAddress, missingExplorerUrl })}
        />
      </>
    ),
    [runeAssetString, intl]
  )

  return FP.pipe(
    // All of following values should be available immediately
    // by entering the `UpgradeView`, because we already have an unlocked wallet.
    // If not (for any reason), we will show an error
    sequenceTOption(oRuneBnbAsset, oRuneNativeAddress, oGetExplorerTxUrl),
    O.fold(
      () =>
        renderDataError({
          invalidAsset: O.isNone(oRuneBnbAsset),
          missingRuneAddress: O.isNone(oRuneNativeAddress),
          missingExplorerUrl: O.isNone(oGetExplorerTxUrl)
        }),
      ([runeBnbAsset, runeNativeAddress, getExplorerTxUrl]) => {
        const successActionHandler: (txHash: string) => Promise<void> = FP.flow(
          getExplorerTxUrl,
          window.apiUrl.openExternal
        )
        return (
          <>
            <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(runeBnbAsset), walletAddress })} />
            <Upgrade
              runeAsset={runeBnbAsset}
              runeNativeAddress={runeNativeAddress}
              bnbPoolAddressRD={bnbPoolAddressRD}
              validatePassword$={validatePassword$}
              // TODO (@Veado) [Upgrade] Refactor business logic #798
              upgrade$={(_) => Rx.of(INITIAL_UPGRADE_RUNE_STATE)}
              reloadFeeHandler={reloadBnbFees}
              fee={upgradeFeeRD}
              balances={oBalances}
              successActionHandler={successActionHandler}
              reloadBalancesHandler={reloadBalances}
            />
          </>
        )
      }
    )
  )
}
