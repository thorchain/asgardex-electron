import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { Asset, baseAmount, ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { WalletType } from '../../../../shared/wallet/types'
import { Send, SendFormETH } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { FeesRD, WalletBalances } from '../../../services/clients'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { WalletBalance } from '../../../services/wallet/types'
import * as Helper from './SendView.helper'

type Props = {
  walletType: WalletType
  walletIndex: number
  asset: Asset
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const { walletType, walletIndex, asset } = props

  const intl = useIntl()
  const history = useHistory()

  const { network } = useNetwork()

  const {
    balancesState$,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(ETHChain))

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
        walletIndex={walletIndex}
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
    [
      walletType,
      walletIndex,
      oBalances,
      feesRD,
      isLoading,
      onSend,
      sendTxStatusMsg,
      reloadFees,
      validatePassword$,
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
          getExplorerTxUrl={getExplorerTxUrl}
          finishActionHandler={finishActionHandler}
          errorActionHandler={finishActionHandler}
          sendForm={sendForm(walletBalance)}
        />
      )
    )
  )
}
