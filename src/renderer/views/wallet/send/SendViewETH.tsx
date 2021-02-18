import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

// import { Send } from '../../../components/wallet/txs/send/'
import { SendFormETH } from '../../../components/wallet/txs/send/'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { FeesRD, GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, TxHashRD, ValidatePasswordHandler } from '../../../services/wallet/types'
// import { WalletBalance } from '../../../types/wallet'

type Props = {
  selectedAsset: Asset
  walletBalances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  validatePassword$: ValidatePasswordHandler
  reloadBalancesHandler: FP.Lazy<void>
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const {
    selectedAsset,
    walletBalances: oWalletBalances,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    validatePassword$,
    reloadBalancesHandler
  } = props

  const oSelectedWalletBalance = useMemo(() => getWalletBalanceByAsset(oWalletBalances, O.some(selectedAsset)), [
    oWalletBalances,
    selectedAsset
  ])

  const { txRD$, fees$, reloadFees } = useEthereumContext()

  const txRD = useObservableState<TxHashRD>(txRD$, RD.initial)
  const [feesRD] = useObservableState<FeesRD>(
    // First fees are based on "default" values
    // Whenever an user enters valid values into input fields,
    // `reloadFees` will be called and with it, `feesRD` will be updated with fees
    () => {
      return fees$({
        asset: selectedAsset,
        amount: baseAmount(1),
        recipient: ETHAddress
      })
    },

    RD.initial
  )

  /**
   * Custom send form used by ETH chain only
   */
  // const sendForm = useCallback(
  //   (selectedAssetWalletBalance: WalletBalance) => (
  //     <SendFormETH
  //       balance={selectedAssetWalletBalance}
  //       balances={FP.pipe(
  //         oWalletBalances,
  //         O.getOrElse(() => [] as WalletBalances)
  //       )}
  //       fees={feesRD}
  //       isLoading={RD.isPending(txRD)}
  //       reloadFeesHandler={reloadFees}
  //       reloadBalancesHandler={reloadBalancesHandler}
  //       validatePassword$={validatePassword$}
  //       successActionHandler={successActionHandler}
  //       send$={tx$}
  //     />
  //   ),
  //   [oWalletBalances, feesRD, txRD, reloadFees, reloadBalancesHandler]
  // )

  return FP.pipe(
    sequenceTOption(oSelectedWalletBalance, oGetExplorerTxUrl),
    O.fold(
      () => <></>,
      ([selectedWalletBalance, getExplorerTxUrl]) => {
        const successActionHandler: (txHash: string) => Promise<void> = FP.flow(
          getExplorerTxUrl,
          window.apiUrl.openExternal
        )
        return (
          <SendFormETH
            balance={selectedWalletBalance}
            balances={FP.pipe(
              oWalletBalances,
              O.getOrElse(() => [] as WalletBalances)
            )}
            fees={feesRD}
            isLoading={RD.isPending(txRD)}
            reloadFeesHandler={reloadFees}
            reloadBalancesHandler={reloadBalancesHandler}
            validatePassword$={validatePassword$}
            successActionHandler={successActionHandler}
            send$={}
          />
          // <Send
          //   txRD={txRD}
          //   successActionHandler={successActionHandler}
          //   inititalActionHandler={resetTx}
          //   errorActionHandler={resetTx}
          //   sendForm={sendForm(selectedWalletBalance)}
          // />
        )
      }
    )
  )
}
