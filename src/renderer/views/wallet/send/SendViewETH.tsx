import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { Send, SendFormETH } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { FeesRD, OpenExplorerTxUrl, WalletBalances } from '../../../services/clients'
import {
  NonEmptyWalletBalances,
  ValidatePasswordHandler,
  WalletBalance,
  WalletType
} from '../../../services/wallet/types'
import * as Helper from './SendView.helper'

type Props = {
  walletType: WalletType
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  openExplorerTxUrl: OpenExplorerTxUrl
  network: Network
  validatePassword$: ValidatePasswordHandler
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const { walletType, asset, balances: oBalances, openExplorerTxUrl, validatePassword$, network } = props

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

  const { fees$, reloadFees } = useEthereumContext()

  const [feesRD] = useObservableState<FeesRD>(
    // First fees are based on "default" values
    // Whenever an user enters valid values into input fields,
    // `reloadFees` will be called and with it, `feesRD` will be updated with fees
    () => {
      return fees$({
        asset,
        amount: baseAmount(1),
        recipient: ETHAddress
      })
    },
    RD.initial
  )

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const sendTxStatusMsg = useMemo(
    () => Helper.sendTxStatusMsg({ sendTxState, asset, intl }),
    [asset, intl, sendTxState]
  )

  /**
   * Custom send form used by ETH chain only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormETH
        walletType={walletType}
        balance={walletBalance}
        balances={FP.pipe(
          oBalances,
          O.getOrElse<WalletBalances>(() => [])
        )}
        fees={feesRD}
        isLoading={isLoading}
        onSubmit={onSend}
        sendTxStatusMsg={sendTxStatusMsg}
        reloadFeesHandler={reloadFees}
        validatePassword$={validatePassword$}
        network={network}
      />
    ),
    [walletType, oBalances, feesRD, isLoading, onSend, sendTxStatusMsg, reloadFees, validatePassword$, network]
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
          errorActionHandler={finishActionHandler}
          sendForm={sendForm(walletBalance)}
        />
      )
    )
  )
}
