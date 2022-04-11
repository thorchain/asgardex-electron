import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { TerraChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { WalletType } from '../../../../shared/wallet/types'
import { LoadingView } from '../../../components/shared/loading'
import { SendFormTERRA } from '../../../components/wallet/txs/send'
import { useChainContext } from '../../../contexts/ChainContext'
import { useTerraContext } from '../../../contexts/TerraContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAddress } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { FeeRD } from '../../../services/chain/types'
import { WalletBalances } from '../../../services/clients'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'

type Props = {
  walletType: WalletType
  walletIndex: number
  walletAddress: Address
}

export const SendViewTERRA: React.FC<Props> = (props): JSX.Element => {
  const { walletType, walletIndex, walletAddress } = props

  const { network } = useNetwork()
  const {
    balancesState$,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(TerraChain))

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getWalletBalanceByAddress(balances, walletAddress))
      ),
    [oBalances, walletAddress]
  )

  const { transfer$ } = useChainContext()

  const { fees$, reloadFees } = useTerraContext()

  const [feeRD] = useObservableState<FeeRD>(
    () =>
      FP.pipe(
        fees$(undefined),
        liveData.map((fees) => fees.fast)
      ),
    RD.initial
  )

  const { validateAddress } = useValidateAddress(TerraChain)

  return FP.pipe(
    oWalletBalance,
    O.fold(
      () => <LoadingView size="large" />,
      (walletBalance) => (
        <SendFormTERRA
          walletType={walletType}
          walletIndex={walletIndex}
          walletAddress={walletAddress}
          balances={FP.pipe(
            oBalances,
            O.getOrElse<WalletBalances>(() => [])
          )}
          balance={walletBalance}
          transfer$={transfer$}
          openExplorerTxUrl={openExplorerTxUrl}
          getExplorerTxUrl={getExplorerTxUrl}
          addressValidation={validateAddress}
          fee={feeRD}
          reloadFeesHandler={reloadFees}
          validatePassword$={validatePassword$}
          network={network}
        />
      )
    )
  )
}
