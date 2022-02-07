import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, BTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { WalletType } from '../../../../shared/wallet/types'
import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBTC } from '../../../components/wallet/txs/send/'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { FeesWithRatesLD } from '../../../services/bitcoin/types'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { OpenExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, ValidatePasswordHandler, WalletBalance } from '../../../services/wallet/types'
import * as Helper from './SendView.helper'

type Props = {
  walletType: WalletType
  walletIndex: number
  walletAddress: Address
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  openExplorerTxUrl: OpenExplorerTxUrl
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendViewBTC: React.FC<Props> = (props): JSX.Element => {
  const {
    walletType,
    walletIndex,
    walletAddress,
    asset,
    balances: oBalances,
    openExplorerTxUrl,
    validatePassword$,
    network
  } = props

  const intl = useIntl()
  const history = useHistory()

  const oWalletBalance = useMemo(() => getWalletBalanceByAsset(oBalances, asset), [oBalances, asset])

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

  const { feesWithRates$, reloadFeesWithRates } = useBitcoinContext()

  const feesWithRatesLD: FeesWithRatesLD = useMemo(() => feesWithRates$(), [feesWithRates$])
  const feesWithRatesRD = useObservableState(feesWithRatesLD, RD.initial)

  const { validateAddress } = useValidateAddress(BTCChain)

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
      <SendFormBTC
        walletType={walletType}
        walletIndex={walletIndex}
        walletAddress={walletAddress}
        balances={FP.pipe(
          oBalances,
          O.getOrElse<WalletBalances>(() => [])
        )}
        balance={walletBalance}
        isLoading={isLoading}
        onSubmit={onSend}
        addressValidation={validateAddress}
        feesWithRates={feesWithRatesRD}
        reloadFeesHandler={reloadFeesWithRates}
        validatePassword$={validatePassword$}
        sendTxStatusMsg={sendTxStatusMsg}
        network={network}
      />
    ),
    [
      walletType,
      walletIndex,
      walletAddress,
      oBalances,
      isLoading,
      onSend,
      validateAddress,
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
        <Send
          txRD={sendTxState.status}
          viewTxHandler={openExplorerTxUrl}
          finishActionHandler={finishActionHandler}
          errorActionHandler={resetSendTxState}
          sendForm={sendForm(walletBalance)}
        />
      )
    )
  )
}
