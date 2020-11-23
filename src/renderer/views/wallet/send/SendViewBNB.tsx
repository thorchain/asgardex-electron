import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BinanceClient } from '@xchainjs/xchain-binance'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBNB } from '../../../components/wallet/txs/send/'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { getBalanceByAsset } from '../../../helpers/walletHelper'
import { AddressValidation } from '../../../services/binance/types'
import { GetExplorerTxUrl } from '../../../services/clients'
import { NonEmptyBalances, TxRD } from '../../../services/wallet/types'

type Props = {
  selectedAsset: Asset
  balances: O.Option<NonEmptyBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
}

export const SendViewBNB: React.FC<Props> = (props): JSX.Element => {
  const { selectedAsset, balances: oBalances, getExplorerTxUrl: oGetExplorerTxUrl = O.none } = props

  const oSelectedAssetWB = useMemo(() => getBalanceByAsset(oBalances, O.some(selectedAsset)), [
    oBalances,
    selectedAsset
  ])

  const { client$, fees$, txRD$, resetTx, pushTx } = useBinanceContext()

  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
  const [fee] = useObservableState<O.Option<AssetAmount>>(
    () =>
      FP.pipe(
        fees$,
        liveData.map((fees) => baseToAsset(fees.fast)),
        RxOp.map(RD.toOption)
      ),
    O.none
  )
  const oClient = useObservableState<O.Option<BinanceClient>>(client$, O.none)

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
        balance={selectedAsset}
        onSubmit={pushTx}
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as Balances)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        fee={fee}
      />
    ),
    [pushTx, oBalances, txRD, addressValidation, fee]
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
