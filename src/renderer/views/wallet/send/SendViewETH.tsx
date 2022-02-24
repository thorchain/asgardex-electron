import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { Asset, baseAmount, ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { WalletType } from '../../../../shared/wallet/types'
import { LoadingView } from '../../../components/shared/loading'
import { SendFormETH } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getWalletBalanceByAddressAndAsset } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { FeesRD, WalletBalances } from '../../../services/clients'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'

type Props = {
  walletType: WalletType
  walletIndex: number
  walletAddress: Address
  asset: Asset
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const { walletType, walletIndex, walletAddress, asset } = props

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

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getWalletBalanceByAddressAndAsset({ balances, address: walletAddress, asset }))
      ),
    [asset, oBalances, walletAddress]
  )

  const { transfer$ } = useChainContext()

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

  return FP.pipe(
    oWalletBalance,
    O.fold(
      () => <LoadingView size="large" />,
      (walletBalance) => (
        <SendFormETH
          walletType={walletType}
          walletIndex={walletIndex}
          walletAddress={walletAddress}
          balance={walletBalance}
          balances={FP.pipe(
            oBalances,
            O.getOrElse<WalletBalances>(() => [])
          )}
          fees={feesRD}
          transfer$={transfer$}
          openExplorerTxUrl={openExplorerTxUrl}
          getExplorerTxUrl={getExplorerTxUrl}
          reloadFeesHandler={reloadFees}
          validatePassword$={validatePassword$}
          network={network}
        />
      )
    )
  )
}
