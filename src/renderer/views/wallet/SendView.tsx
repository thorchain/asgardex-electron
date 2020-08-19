import React, { useMemo } from 'react'

import { initial } from '@devexperts/remote-data-ts'
import { BinanceClient } from '@thorchain/asgardex-binance'
import { assetFromString, assetToString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import ErrorView from '../../components/shared/error/ErrorView'
import BackLink from '../../components/uielements/backLink'
import Send from '../../components/wallet/txs/Send'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { AddressValidation } from '../../services/binance/types'
import { toAssetWithBalances, getAssetWithBalance } from '../../services/binance/utils'

type Props = {}

const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const intl = useIntl()

  const { transaction: transactionService, balancesState$, explorerUrl$, client$ } = useBinanceContext()
  const balancesState = useObservableState(balancesState$, initial)
  const explorerUrl = useObservableState(explorerUrl$, O.none)
  const client = useObservableState<O.Option<BinanceClient>>(client$, O.none)

  const balances = useMemo(() => toAssetWithBalances(balancesState, intl), [balancesState, intl])
  const oSelectedAssetWB = useMemo(() => getAssetWithBalance(balances, oSelectedAsset), [oSelectedAsset, balances])

  const addressValidation = useMemo(
    () =>
      FP.pipe(
        client,
        O.map((c) => c),
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [client]
  )

  if (O.isNone(oSelectedAsset)) {
    return (
      <>
        <BackLink />
        <ErrorView title={`Parsing asset ${asset} from route failed`} />
      </>
    )
  }

  return FP.pipe(
    oSelectedAssetWB,
    O.fold(
      () => <></>,
      (selectedAsset) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(selectedAsset.asset) })} />

          <Send
            selectedAsset={selectedAsset}
            transactionService={transactionService}
            balances={balances}
            explorerUrl={explorerUrl}
            addressValidation={addressValidation}
          />
        </>
      )
    )
  )
}

export default SendView
