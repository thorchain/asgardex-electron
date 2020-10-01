import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import Send from '../../../components/wallet/txs/send/Send'
import SendFormBTC from '../../../components/wallet/txs/send/SendFormBTC'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getAssetWBByAsset } from '../../../helpers/walletHelper'
import { AddressValidation } from '../../../services/bitcoin/types'
import { AssetsWithBalance, AssetWithBalance, NonEmptyAssetsWithBalance, TxRD } from '../../../services/wallet/types'

type Props = {
  btcAsset: Asset
  assetsWB: O.Option<NonEmptyAssetsWithBalance>
  reloadFeesHandler: () => void
}

const SendViewBTC: React.FC<Props> = (props): JSX.Element => {
  const { btcAsset: selectedAsset, assetsWB, reloadFeesHandler } = props

  const oBtcAssetWB = useMemo(() => getAssetWBByAsset(assetsWB, O.some(selectedAsset)), [assetsWB, selectedAsset])

  const { fees$, pushTx, txRD$, client$, explorerUrl$, resetTx } = useBitcoinContext()

  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
  const oExplorerUrl = useObservableState(explorerUrl$, O.none)
  const oClient = useObservableState<O.Option<BitcoinClient>>(client$, O.none)

  const fees = useObservableState(fees$, RD.initial)

  const addressValidation = useMemo(
    () =>
      FP.pipe(
        oClient,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [oClient]
  )

  /**
   * Custom send form used by BNB chain only
   */
  const sendForm = useCallback(
    (assetWB: AssetWithBalance) => (
      <SendFormBTC
        assetWB={assetWB}
        onSubmit={pushTx}
        assetsWB={FP.pipe(
          assetsWB,
          O.getOrElse(() => [] as AssetsWithBalance)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        reloadFeesHandler={reloadFeesHandler}
        fees={fees}
      />
    ),
    [pushTx, assetsWB, txRD, addressValidation, reloadFeesHandler, fees]
  )

  return FP.pipe(
    sequenceTOption(oBtcAssetWB, oExplorerUrl),
    O.fold(
      () => <></>,
      ([btcAssetWB, explorerUrl]) => {
        const successActionHandler = (txHash: string) => window.apiUrl.openExternal(`${explorerUrl}tx/${txHash}`)

        return (
          <Send
            txRD={txRD}
            successActionHandler={successActionHandler}
            inititalActionHandler={resetTx}
            errorActionHandler={resetTx}
            sendForm={sendForm(btcAssetWB)}
          />
        )
      }
    )
  )
}

export default SendViewBTC
