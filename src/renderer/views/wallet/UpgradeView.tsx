import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { Upgrade } from '../../components/wallet/txs/upgrade'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneBnbAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { UpgradeBnbRuneParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'

type Props = {}

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const { runeAsset: runeAssetString, walletAddress } = useParams<UpgradeBnbRuneParams>()
  const intl = useIntl()
  // accept BNB.Rune only
  const oRuneAsset = useMemo(
    () => FP.pipe(assetFromString(runeAssetString), O.fromNullable, O.filter(isRuneBnbAsset)),
    [runeAssetString]
  )

  const { balancesState$, getExplorerTxUrl$ } = useWalletContext()
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const oGetExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const renderAssetError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              runeAssetString
            }
          )}
        />
      </>
    ),
    [runeAssetString, intl]
  )

  return FP.pipe(
    sequenceTOption(oRuneAsset, oGetExplorerTxUrl),
    O.fold(
      () => renderAssetError,
      ([runeAsset, getExplorerTxUrl]) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(asset), walletAddress })} />
          <Upgrade runeAsset={runeAsset} txRD={RD.initial} balances={oBalances} getExplorerTxUrl={getExplorerTxUrl} />
        </>
      )
    )
  )
}
