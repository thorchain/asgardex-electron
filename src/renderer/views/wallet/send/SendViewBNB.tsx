import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, BNBChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { WalletType } from '../../../../shared/wallet/types'
import { Send, SendFormBNB } from '../../../components/wallet/txs/send/'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAddressAndAsset } from '../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { FeeRD, SendTxParams, SendTxState } from '../../../services/chain/types'
import { OpenExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, ValidatePasswordHandler, WalletBalance } from '../../../services/wallet/types'
import * as Helper from './SendView.helper'

type Props = {
  walletType: WalletType
  walletAddress: Address
  walletIndex: number
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  openExplorerTxUrl: OpenExplorerTxUrl
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendViewBNB: React.FC<Props> = (props): JSX.Element => {
  const {
    walletAddress,
    asset,
    balances: oBalances,
    openExplorerTxUrl,
    validatePassword$,
    network,
    walletType,
    walletIndex
  } = props

  const intl = useIntl()
  const history = useHistory()

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getWalletBalanceByAddressAndAsset({ balances, address: walletAddress, asset }))
      ),
    [asset, oBalances, walletAddress]
  )

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

  const { fees$, reloadFees } = useBinanceContext()

  const [feeRD] = useObservableState<FeeRD>(
    () =>
      FP.pipe(
        fees$(),
        liveData.map((fees) => fees.fast)
      ),
    RD.initial
  )

  /**
   * Address validation provided by BinanceClient
   */
  const { validateAddress } = useValidateAddress(BNBChain)

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const sendTxStatusMsg = useMemo(
    () => Helper.sendTxStatusMsg({ sendTxState, asset, intl }),
    [asset, intl, sendTxState]
  )

  /**
   * Custom send form used by BNB chain only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormBNB
        walletType={walletType}
        walletIndex={walletIndex}
        balances={FP.pipe(
          oBalances,
          O.getOrElse<WalletBalances>(() => [])
        )}
        balance={walletBalance}
        isLoading={isLoading}
        walletAddress={walletAddress}
        onSubmit={onSend}
        addressValidation={validateAddress}
        fee={feeRD}
        reloadFeesHandler={reloadFees}
        validatePassword$={validatePassword$}
        sendTxStatusMsg={sendTxStatusMsg}
        network={network}
      />
    ),
    [
      walletType,
      walletIndex,
      oBalances,
      isLoading,
      walletAddress,
      onSend,
      validateAddress,
      feeRD,
      reloadFees,
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
          errorActionHandler={finishActionHandler}
          sendForm={sendForm(walletBalance)}
        />
      )
    )
  )
}
