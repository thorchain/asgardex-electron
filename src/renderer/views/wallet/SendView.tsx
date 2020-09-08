import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BinanceClient } from '@thorchain/asgardex-binance'
import { assetFromString, assetToString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import ErrorView from '../../components/shared/error/ErrorView'
import BackLink from '../../components/uielements/backLink'
import Send from '../../components/wallet/txs/Send'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { getAssetWBByAsset } from '../../helpers/walletHelper'
import { useSingleTxFee } from '../../hooks/useSingleTxFee'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { AddressValidation } from '../../services/binance/types'
import { AssetsWithBalance } from '../../services/wallet/types'

type Props = {}

const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const { transaction: transactionService, assetsWB$, explorerUrl$, client$, transferFees$ } = useBinanceContext()
  const balancesState = useObservableState(assetsWB$, RD.initial)
  const explorerUrl = useObservableState(explorerUrl$, O.none)
  const client = useObservableState<O.Option<BinanceClient>>(client$, O.none)

  const fee = useSingleTxFee(transferFees$)

  const balances = useMemo(
    () =>
      FP.pipe(
        balancesState,
        RD.getOrElse(() => [] as AssetsWithBalance)
      ),
    [balancesState]
  )
  const oSelectedAssetWB = useMemo(() => getAssetWBByAsset(balancesState, oSelectedAsset), [
    balancesState,
    oSelectedAsset
  ])

  const addressValidation = useMemo(
    () =>
      FP.pipe(
        client,
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
      (wb) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(wb.asset) })} />

          <Send
            selectedAsset={wb}
            transactionService={transactionService}
            assetsWB={balances}
            explorerUrl={explorerUrl}
            addressValidation={addressValidation}
            fee={fee}
          />
        </>
      )
    )
  )
}

export default SendView
