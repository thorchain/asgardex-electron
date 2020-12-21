import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBTC } from '../../../components/wallet/txs/send/'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { AddressValidation } from '../../../services/bitcoin/types'
import { GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, TxRD } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'

type Props = {
  btcAsset: Asset
  balances: O.Option<NonEmptyWalletBalances>
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

  const oBtcAssetWB = useMemo(() => getWalletBalanceByAsset(oBalances, O.some(selectedAsset)), [
    oBalances,
    selectedAsset
  ])

  const { fees$, subscribeTx, txRD$, client$, resetTx } = useBitcoinContext()

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
    (assetWB: WalletBalance) => (
      <SendFormBTC
        walletBalance={assetWB}
        onSubmit={subscribeTx}
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as WalletBalances)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        reloadFeesHandler={reloadFeesHandler}
        feesWithRates={fees}
      />
    ),
    [subscribeTx, oBalances, txRD, addressValidation, reloadFeesHandler, fees]
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
