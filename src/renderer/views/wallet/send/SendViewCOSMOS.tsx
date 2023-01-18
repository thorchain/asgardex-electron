import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { CosmosChain } from '../../../../shared/utils/chain'
import { LoadingView } from '../../../components/shared/loading'
import { SendFormCOSMOS } from '../../../components/wallet/txs/send'
import { useChainContext } from '../../../contexts/ChainContext'
import { useCosmosContext } from '../../../contexts/CosmosContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAddress } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { FeeRD } from '../../../services/chain/types'
import { WalletBalances } from '../../../services/clients'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SelectedWalletAsset } from '../../../services/wallet/types'

type Props = {
  asset: SelectedWalletAsset
}

export const SendViewCOSMOS: React.FC<Props> = (props): JSX.Element => {
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

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(CosmosChain))

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getWalletBalanceByAddress(balances, asset.walletAddress))
      ),
    [asset.walletAddress, oBalances]
  )

  const { transfer$ } = useChainContext()

  const { fees$, reloadFees } = useCosmosContext()

  const [feeRD] = useObservableState<FeeRD>(
    () =>
      FP.pipe(
        fees$(),
        liveData.map((fees) => fees.fast)
      ),
    RD.initial
  )

  const { validateAddress } = useValidateAddress(CosmosChain)

  return FP.pipe(
    oWalletBalance,
    O.fold(
      () => <LoadingView size="large" />,
      (walletBalance) => (
        <SendFormCOSMOS
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
          fee={feeRD}
          reloadFeesHandler={reloadFees}
          validatePassword$={validatePassword$}
          network={network}
        />
      )
    )
  )
}
