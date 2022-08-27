import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { LTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { LoadingView } from '../../../components/shared/loading'
import { SendFormLTC } from '../../../components/wallet/txs/send/'
import { useChainContext } from '../../../contexts/ChainContext'
import { useLitecoinContext } from '../../../contexts/LitecoinContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getWalletBalanceByAddress } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { WalletBalances } from '../../../services/clients'
import { FeesWithRatesLD } from '../../../services/litecoin/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SelectedWalletAsset } from '../../../services/wallet/types'

type Props = {
  asset: SelectedWalletAsset
}

export const SendViewLTC: React.FC<Props> = (props): JSX.Element => {
  const { asset } = props

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

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getWalletBalanceByAddress(balances, asset.walletAddress))
      ),
    [oBalances, walletAddress]
  )

  const { transfer$ } = useChainContext()

  const { feesWithRates$, reloadFeesWithRates } = useLitecoinContext()

  const feesWithRatesLD: FeesWithRatesLD = useMemo(() => feesWithRates$(), [feesWithRates$])
  const feesWithRatesRD = useObservableState(feesWithRatesLD, RD.initial)

  const { validateAddress } = useValidateAddress(LTCChain)

  return FP.pipe(
    oWalletBalance,
    O.fold(
      () => <LoadingView size="large" />,
      (walletBalance) => (
        <SendFormLTC
          asset={asset}
          balances={FP.pipe(
            oBalances,
            O.getOrElse<WalletBalances>(() => [])
          )}
          balance={walletBalance}
          transfer$={transfer$}
          openExplorerTxUrl={openExplorerTxUrl}
          getExplorerTxUrl={getExplorerTxUrl}
          addressValidation={validateAddress}
          feesWithRates={feesWithRatesRD}
          reloadFeesHandler={reloadFeesWithRates}
          validatePassword$={validatePassword$}
          network={network}
        />
      )
    )
  )
}
