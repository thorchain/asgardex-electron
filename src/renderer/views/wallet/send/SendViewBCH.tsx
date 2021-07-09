import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, BCHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { Send } from '../../../components/wallet/txs/send'
import { SendFormBCH } from '../../../components/wallet/txs/send'
import { useBitcoinCashContext } from '../../../contexts/BitcoinCashContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { FeesWithRatesLD } from '../../../services/bitcoincash/types'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { OpenExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'
import * as Helper from './SendView.helper'

type Props = {
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  openExplorerTxUrl: OpenExplorerTxUrl
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendViewBCH: React.FC<Props> = (props): JSX.Element => {
  const { asset, balances: oBalances, openExplorerTxUrl, validatePassword$, network } = props

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

  const { feesWithRates$, reloadFeesWithRates } = useBitcoinCashContext()

  const feesWithRatesLD: FeesWithRatesLD = useMemo(() => feesWithRates$(), [feesWithRates$])
  const feesWithRatesRD = useObservableState(feesWithRatesLD, RD.initial)
  const addressValidation = useValidateAddress(BCHChain)

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const sendTxStatusMsg = useMemo(
    () => Helper.sendTxStatusMsg({ sendTxState, asset, intl }),
    [asset, intl, sendTxState]
  )
  /**
   * Custom send form used by BTC only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormBCH
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
    oWalletBalance,
    O.fold(
      () => <></>,
      (walletBalance) => (
        <>
          <Send
            txRD={sendTxState.status}
            viewTxHandler={openExplorerTxUrl}
            finishActionHandler={finishActionHandler}
            errorActionHandler={resetSendTxState}
            sendForm={sendForm(walletBalance)}
          />
        </>
      )
    )
  )
}
