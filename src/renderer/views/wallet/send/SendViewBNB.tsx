import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BinanceClient } from '@thorchain/asgardex-binance'
import { Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import Send from '../../../components/wallet/txs/send/Send'
import { SendFormBNB } from '../../../components/wallet/txs/send/SendFormBNB'
import { useBinanceContext } from '../../../contexts/BinanceContext'
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
  const explorerUrl = useObservableState(explorerUrl$, O.none)
  const client = useObservableState<O.Option<BinanceClient>>(client$, O.none)

  const fee = useSingleTxFee(transferFees$)

  const addressValidation = useMemo(
    () =>
      FP.pipe(
        client,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [client]
  )

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
        oFee={fee}
      />
    ),
    [pushTx, assetsWB, txRD, addressValidation, fee]
  )

  return FP.pipe(
    oSelectedAssetWB,
    O.fold(
      () => <></>,
      (selectedAssetWB) => (
        <Send
          transactionService={transactionService}
          explorerUrl={explorerUrl}
          resetTx={resetTx}
          form={sendForm(selectedAssetWB)}
        />
      )
    )
  )
}

export default SendViewBNB
