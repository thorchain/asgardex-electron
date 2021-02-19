import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { Network } from '../../../../shared/api/types'
import { SendFormETH } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { FeesRD, GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../services/wallet/types'

type Props = {
  selectedAsset: Asset
  walletBalances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  validatePassword$: ValidatePasswordHandler
  reloadBalancesHandler: FP.Lazy<void>
  network: Network
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const {
    selectedAsset,
    walletBalances: oWalletBalances,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    validatePassword$,
    reloadBalancesHandler,
    network
  } = props

  const oSelectedWalletBalance = useMemo(() => getWalletBalanceByAsset(oWalletBalances, O.some(selectedAsset)), [
    oWalletBalances,
    selectedAsset
  ])

  const { transfer$ } = useChainContext()

  const { fees$, reloadFees } = useEthereumContext()

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
            reloadFeesHandler={reloadFees}
            reloadBalancesHandler={reloadBalancesHandler}
            validatePassword$={validatePassword$}
            successActionHandler={successActionHandler}
            transfer$={transfer$}
            network={network}
          />
        )
      }
    )
  )
}
