import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBTC } from '../../../components/wallet/txs/send/'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getBalanceByAsset } from '../../../helpers/walletHelper'
import { AddressValidation } from '../../../services/bitcoin/types'
import { GetExplorerTxUrl } from '../../../services/clients/types'
import { NonEmptyBalances, TxRD } from '../../../services/wallet/types'

type Props = {
  btcAsset: Asset
  balances: O.Option<NonEmptyBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  reloadFeesHandler: () => void
}

export const SendViewBTC: React.FC<Props> = (props): JSX.Element => {
  const {
    btcAsset: selectedAsset,
    balances: oBalances,
    reloadFeesHandler,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none
  } = props

  const oBtcAssetWB = useMemo(() => getBalanceByAsset(oBalances, O.some(selectedAsset)), [oBalances, selectedAsset])

  const { fees$, pushTx, txRD$, client$, resetTx } = useBitcoinContext()

  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
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
    (assetWB: Balance) => (
      <SendFormBTC
        assetWB={assetWB}
        onSubmit={pushTx}
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as Balances)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        reloadFeesHandler={reloadFeesHandler}
        feesWithRates={fees}
      />
    ),
    [pushTx, oBalances, txRD, addressValidation, reloadFeesHandler, fees]
  )

  return FP.pipe(
    sequenceTOption(oGetExplorerTxUrl, oBtcAssetWB),
    O.fold(
      () => <></>,
      ([getExplorerTxUrl, btcAssetWB]) => {
        const successActionHandler: (txHash: string) => Promise<void> = FP.flow(
          getExplorerTxUrl,
          window.apiUrl.openExternal
        )
        return (
          <>
            <Send
              txRD={txRD}
              successActionHandler={successActionHandler}
              inititalActionHandler={resetTx}
              errorActionHandler={resetTx}
              sendForm={sendForm(btcAssetWB)}
            />
          </>
        )
      }
    )
  )
}
