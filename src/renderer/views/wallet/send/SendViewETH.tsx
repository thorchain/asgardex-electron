import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'

import { Network } from '../../../../shared/api/types'
import { Send, SendFormETH } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { INITIAL_SEND_STATE } from '../../../services/chain/const'
import { SendTxParams, SendTxState } from '../../../services/chain/types'
import { FeesRD, GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'

type Props = {
  asset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  network: Network
  validatePassword$: ValidatePasswordHandler
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const { asset, balances: oBalances, getExplorerTxUrl: oGetExplorerTxUrl = O.none, validatePassword$, network } = props

  const oWalletBalance = useMemo(() => getWalletBalanceByAsset(oBalances, O.some(asset)), [oBalances, asset])

  const { transfer$ } = useChainContext()

  // TODO (@Veado)
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

  /**
   * Custom send form used by BNB chain only
   */
  const sendForm = useCallback(
    (walletBalance: WalletBalance) => (
      <SendFormETH
        balance={walletBalance}
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as WalletBalances)
        )}
        fees={feesRD}
        isLoading={isLoading}
        onSubmit={onSend}
        reloadBalancesHandler={FP.constVoid}
        reloadFeesHandler={reloadFees}
        validatePassword$={validatePassword$}
        network={network}
      />
    ),
    [oBalances, feesRD, isLoading, onSend, reloadFees, validatePassword$, network]
  )

  return FP.pipe(
    sequenceTOption(oWalletBalance, oGetExplorerTxUrl),
    O.fold(
      () => <></>,
      ([walletBalance, getExplorerTxUrl]) => {
        const successActionHandler: (txHash: string) => Promise<void> = FP.flow(
          getExplorerTxUrl,
          window.apiUrl.openExternal
        )
        return (
          <>
            <Send
              txRD={sendTxState.status}
              successActionHandler={successActionHandler}
              inititalActionHandler={resetTxState}
              errorActionHandler={resetTxState}
              sendForm={sendForm(walletBalance)}
            />
          </>
        )
      }
    )
  )
}
