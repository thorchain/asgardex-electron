import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BinanceClient } from '@thorchain/asgardex-binance'
import { Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import Send from '../../../components/wallet/txs/send/Send'
import SendFormBNB from '../../../components/wallet/txs/send/SendFormBNB'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getAssetWBByAsset } from '../../../helpers/walletHelper'
import { useSingleTxFee } from '../../../hooks/useSingleTxFee'
import { AddressValidation } from '../../../services/binance/types'
import { AssetsWithBalance, AssetWithBalance, NonEmptyAssetsWithBalance, TxRD } from '../../../services/wallet/types'

type Props = {
  selectedAsset: Asset
  assetsWB: O.Option<NonEmptyAssetsWithBalance>
}

const SendViewBNB: React.FC<Props> = (props): JSX.Element => {
  const { selectedAsset, assetsWB } = props

  const oSelectedAssetWB = useMemo(() => getAssetWBByAsset(assetsWB, O.some(selectedAsset)), [assetsWB, selectedAsset])

  const { transaction: transactionService, explorerUrl$, client$, transferFees$ } = useBinanceContext()

  const { txRD$, resetTx, pushTx } = transactionService
  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
  const oExplorerUrl = useObservableState(explorerUrl$, O.none)
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
    (selectedAsset: AssetWithBalance) => (
      <SendFormBNB
        assetWB={selectedAsset}
        onSubmit={pushTx}
        assetsWB={FP.pipe(
          assetsWB,
          O.getOrElse(() => [] as AssetsWithBalance)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        fee={fee}
      />
    ),
    [pushTx, assetsWB, txRD, addressValidation, fee]
  )

  return FP.pipe(
    sequenceTOption(oSelectedAssetWB, oExplorerUrl),
    O.fold(
      () => <></>,
      ([selectedAssetWB, explorerUrl]) => {
        const successActionHandler = (txHash: string) => window.apiUrl.openExternal(`${explorerUrl}/tx/${txHash}`)
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

export default SendViewBNB
