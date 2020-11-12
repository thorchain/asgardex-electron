import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BinanceClient } from '@xchainjs/xchain-binance'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBNB } from '../../../components/wallet/txs/send/'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getBalanceByAsset } from '../../../helpers/walletHelper'
import { useSingleTxFee } from '../../../hooks/useSingleTxFee'
import { AddressValidation } from '../../../services/binance/types'
import { GetExplorerTxUrl } from '../../../services/clients/types'
import { NonEmptyBalances, TxRD } from '../../../services/wallet/types'

type Props = {
  selectedAsset: Asset
  assetsWB: O.Option<NonEmptyBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
}

export const SendViewBNB: React.FC<Props> = (props): JSX.Element => {
  const { selectedAsset, assetsWB, getExplorerTxUrl: oGetExplorerTxUrl = O.none } = props

  const oSelectedAssetWB = useMemo(() => getBalanceByAsset(assetsWB, O.some(selectedAsset)), [assetsWB, selectedAsset])

  const { transaction: transactionService, client$, transferFees$ } = useBinanceContext()

  const { txRD$, resetTx, pushTx } = transactionService
  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
  const oClient = useObservableState<O.Option<BinanceClient>>(client$, O.none)

  const fee = useSingleTxFee(transferFees$)

  /**
   * Address validation provided by BinanceClient
   */
  const addressValidation = useMemo(
    () =>
      FP.pipe(
        oClient,
        O.map((client) => client.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [oClient]
  )

  /**
   * Custom send form used by BNB chain only
   */
  const sendForm = useCallback(
    (selectedAsset: Balance) => (
      <SendFormBNB
        assetWB={selectedAsset}
        onSubmit={pushTx}
        assetsWB={FP.pipe(
          assetsWB,
          O.getOrElse(() => [] as Balances)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        fee={fee}
      />
    ),
    [pushTx, assetsWB, txRD, addressValidation, fee]
  )

  return FP.pipe(
    sequenceTOption(oSelectedAssetWB, oGetExplorerTxUrl),
    O.fold(
      () => <></>,
      ([selectedAssetWB, getExplorerTxUrl]) => {
        const successActionHandler: (txHash: string) => Promise<void> = FP.flow(
          getExplorerTxUrl,
          window.apiUrl.openExternal
        )
        return (
          <Send
            txRD={txRD}
            successActionHandler={successActionHandler}
            inititalActionHandler={resetTx}
            errorActionHandler={resetTx}
            sendForm={sendForm(selectedAssetWB)}
          />
        )
      }
    )
  )
}
