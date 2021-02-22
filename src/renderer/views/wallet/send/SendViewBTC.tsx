import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { Network } from '../../../../shared/api/types'
import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBTC } from '../../../components/wallet/txs/send/'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { AddressValidation } from '../../../services/bitcoin/types'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxState, SendTxParams } from '../../../services/chain/types'
import { GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'
import * as Helper from './SendView.helper'

type Props = {
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  reloadBalances: FP.Lazy<void>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendViewBTC: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    balances: oBalances,
    reloadBalances,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    validatePassword$,
    network
  } = props

  const intl = useIntl()

  const oWalletBalance = useMemo(() => getWalletBalanceByAsset(oBalances, O.some(asset)), [oBalances, asset])

  const { transfer$ } = useChainContext()

  // TODO (@asgdx-team)
  // Extract boilerplate for manual Rx.Subscription
  // see https://github.com/thorchain/asgardex-electron/issues/898

  // (Possible) subscription of transfer tx
  const [sendTxSub, _setSendTxSub] = useState<O.Option<Rx.Subscription>>(O.none)

  // unsubscribe transfer$ subscription
  const unsubscribeSendTxSub = useCallback(() => {
    FP.pipe(
      sendTxSub,
      O.map((sub) => sub.unsubscribe())
    )
  }, [sendTxSub])

  const setSendTxSub = useCallback(
    (state) => {
      unsubscribeSendTxSub()
      _setSendTxSub(state)
    },
    [unsubscribeSendTxSub]
  )

  useEffect(() => {
    // Unsubscribe of (possible) previous subscription of `send$`
    return () => {
      unsubscribeSendTxSub()
    }
  }, [unsubscribeSendTxSub])

  // State of send tx
  const [sendTxState, setSendTxState] = useState<SendTxState>(INITIAL_SEND_STATE)

  const resetTxState = useCallback(() => {
    setSendTxState(INITIAL_SEND_STATE)
    setSendTxSub(O.none)
  }, [setSendTxSub])

  // --- END TODO

  const onSend = useCallback(
    (params: SendTxParams) => {
      const subscription = transfer$(params).subscribe(setSendTxState)
      // store subscription
      return setSendTxSub(O.some(subscription))
    },
    [setSendTxSub, transfer$]
  )

  const { fees$, client$, reloadFees } = useBitcoinContext()

  const fees = useObservableState(fees$, RD.initial)
  const oClient = useObservableState<O.Option<BitcoinClient>>(client$, O.none)
  const addressValidation = useMemo(
    () =>
      FP.pipe(
        oClient,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [oClient]
  )

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const sendTxStatusMsg = useMemo(() => Helper.sendTxStatusMsg({ sendTxState, asset, intl }), [
    asset,
    intl,
    sendTxState
  ])
  /**
   * Custom send form used by BTC only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormBTC
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as WalletBalances)
        )}
        walletBalance={walletBalance}
        isLoading={isLoading}
        onSubmit={onSend}
        addressValidation={addressValidation}
        feesWithRates={fees}
        reloadFeesHandler={reloadFees}
        validatePassword$={validatePassword$}
        sendTxStatusMsg={sendTxStatusMsg}
        network={network}
      />
    ),
    [oBalances, isLoading, onSend, addressValidation, fees, reloadFees, validatePassword$, sendTxStatusMsg, network]
  )

  const finishActionHandler = useCallback(() => {
    reloadBalances()
    resetTxState()
  }, [reloadBalances, resetTxState])

  return FP.pipe(
    sequenceTOption(oGetExplorerTxUrl, oWalletBalance),
    O.fold(
      () => <></>,
      ([getExplorerTxUrl, walletBalance]) => {
        const viewTxHandler: (txHash: string) => Promise<void> = FP.flow(getExplorerTxUrl, window.apiUrl.openExternal)
        return (
          <>
            <Send
              txRD={sendTxState.status}
              viewTxHandler={viewTxHandler}
              finishActionHandler={finishActionHandler}
              errorActionHandler={resetTxState}
              sendForm={sendForm(walletBalance)}
            />
          </>
        )
      }
    )
  )
}
