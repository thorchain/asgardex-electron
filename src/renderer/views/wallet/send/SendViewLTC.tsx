import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as LitecoinClient } from '@xchainjs/xchain-litecoin'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { Send } from '../../../components/wallet/txs/send/'
import { SendFormLTC } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useLitecoinContext } from '../../../contexts/LitecoinContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { AddressValidation, FeesWithRatesLD } from '../../../services/litecoin/types'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'
import * as Helper from './SendView.helper'

type Props = {
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendViewLTC: React.FC<Props> = (props): JSX.Element => {
  const { asset, balances: oBalances, getExplorerTxUrl: oGetExplorerTxUrl = O.none, validatePassword$, network } = props

  const intl = useIntl()
  const history = useHistory()

  const oWalletBalance = useMemo(() => getWalletBalanceByAsset(oBalances, O.some(asset)), [oBalances, asset])

  const { transfer$ } = useChainContext()

  const {
    state: sendTxState,
    reset: resetSendTxState,
    subscribe: subscribeSendTxState
  } = useSubscriptionState<SendTxState>(INITIAL_SEND_STATE)

  const onSend = useCallback(
    (params: SendTxParams) => {
      subscribeSendTxState(transfer$(params))
    },
    [subscribeSendTxState, transfer$]
  )

  const { feesWithRates$, client$, reloadFeesWithRates } = useLitecoinContext()

  const feesWithRatesLD: FeesWithRatesLD = useMemo(() => feesWithRates$(), [feesWithRates$])
  const feesWithRatesRD = useObservableState(feesWithRatesLD, RD.initial)

  const oClient = useObservableState<O.Option<LitecoinClient>>(client$, O.none)
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
   * Custom send form used by LTC only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormLTC
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as WalletBalances)
        )}
        balance={walletBalance}
        isLoading={isLoading}
        onSubmit={onSend}
        addressValidation={addressValidation}
        feesWithRates={feesWithRatesRD}
        reloadFeesHandler={reloadFeesWithRates}
        validatePassword$={validatePassword$}
        sendTxStatusMsg={sendTxStatusMsg}
        network={network}
      />
    ),
    [
      oBalances,
      isLoading,
      onSend,
      addressValidation,
      feesWithRatesRD,
      reloadFeesWithRates,
      validatePassword$,
      sendTxStatusMsg,
      network
    ]
  )

  const finishActionHandler = useCallback(() => {
    resetSendTxState()
    history.goBack()
  }, [history, resetSendTxState])

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
              errorActionHandler={resetSendTxState}
              sendForm={sendForm(walletBalance)}
            />
          </>
        )
      }
    )
  )
}
