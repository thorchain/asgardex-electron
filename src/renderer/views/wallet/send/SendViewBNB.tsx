import React, { useMemo } from 'react'

import { BinanceClient } from '@thorchain/asgardex-binance'
import { Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import Send from '../../../components/wallet/txs/Send'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getAssetWBByAsset } from '../../../helpers/walletHelper'
import { useSingleTxFee } from '../../../hooks/useSingleTxFee'
import { AddressValidation } from '../../../services/binance/types'
import { INITIAL_ASSETS_WB_STATE } from '../../../services/wallet/const'
import { AssetsWithBalance } from '../../../services/wallet/types'

type Props = {
  selectedAsset: Asset
}

const SendViewBNB: React.FC<Props> = (props): JSX.Element => {
  const { selectedAsset } = props
  const { transaction: transactionService, explorerUrl$, client$, transferFees$ } = useBinanceContext()
  const { assetsWBState$ } = useWalletContext()

  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)
  const explorerUrl = useObservableState(explorerUrl$, O.none)
  const client = useObservableState<O.Option<BinanceClient>>(client$, O.none)

  const fee = useSingleTxFee(transferFees$)

  const oSelectedAssetWB = useMemo(() => getAssetWBByAsset(assetsWB, O.some(selectedAsset)), [assetsWB, selectedAsset])

  const addressValidation = useMemo(
    () =>
      FP.pipe(
        client,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [client]
  )

  return FP.pipe(
    oSelectedAssetWB,
    O.fold(
      () => <></>,
      (selectedAssetWB) => (
        <Send
          selectedAsset={selectedAssetWB}
          transactionService={transactionService}
          assetsWB={FP.pipe(
            assetsWB,
            O.getOrElse(() => [] as AssetsWithBalance)
          )}
          explorerUrl={explorerUrl}
          addressValidation={addressValidation}
          fee={fee}
        />
      )
    )
  )
}

export default SendViewBNB
