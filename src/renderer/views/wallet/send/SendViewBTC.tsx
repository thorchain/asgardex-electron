import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { LoadingView } from '../../../components/shared/loading'
import { SendFormBTC } from '../../../components/wallet/txs/send/'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getWalletBalanceByAddress } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { FeesWithRatesLD } from '../../../services/bitcoin/types'
import { WalletBalances } from '../../../services/clients'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SelectedWalletAsset } from '../../../services/wallet/types'

type Props = {
  asset: SelectedWalletAsset
}

export const SendViewBTC: React.FC<Props> = (props): JSX.Element => {
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

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(BTCChain))

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getWalletBalanceByAddress(balances, asset.walletAddress))
      ),
    [asset.walletAddress, oBalances]
  )

  const { transfer$ } = useChainContext()

  const { feesWithRates$, reloadFeesWithRates } = useBitcoinContext()

  const feesWithRatesLD: FeesWithRatesLD = useMemo(() => feesWithRates$(), [feesWithRates$])
  const feesWithRatesRD = useObservableState(feesWithRatesLD, RD.initial)

  const { validateAddress } = useValidateAddress(BTCChain)

  return FP.pipe(
    oWalletBalance,
    O.fold(
      () => <LoadingView size="large" />,
      (walletBalance) => (
        <SendFormBTC
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
