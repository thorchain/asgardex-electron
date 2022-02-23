import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, LTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { WalletType } from '../../../../shared/wallet/types'
import { Send } from '../../../components/wallet/txs/send/'
import { SendFormLTC } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useLitecoinContext } from '../../../contexts/LitecoinContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { WalletBalances } from '../../../services/clients'
import { FeesWithRatesLD } from '../../../services/litecoin/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { WalletBalance } from '../../../services/wallet/types'
import * as Helper from './SendView.helper'

type Props = {
  walletType: WalletType
  walletIndex: number
  asset: Asset
}

export const SendViewLTC: React.FC<Props> = (props): JSX.Element => {
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

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(LTCChain))

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

  const { feesWithRates$, reloadFeesWithRates } = useLitecoinContext()

  const feesWithRatesLD: FeesWithRatesLD = useMemo(() => feesWithRates$(), [feesWithRates$])
  const feesWithRatesRD = useObservableState(feesWithRatesLD, RD.initial)

  const { validateAddress } = useValidateAddress(LTCChain)

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const sendTxStatusMsg = useMemo(
    () => Helper.sendTxStatusMsg({ sendTxState, asset, intl }),
    [asset, intl, sendTxState]
  )
  /**
   * Custom send form used by LTC only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormLTC
        walletType={walletType}
        walletIndex={walletIndex}
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
          getExplorerTxUrl={getExplorerTxUrl}
          finishActionHandler={finishActionHandler}
          errorActionHandler={resetSendTxState}
          sendForm={sendForm(walletBalance)}
        />
      )
    )
  )
}
