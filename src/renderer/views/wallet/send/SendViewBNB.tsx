import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as BinanceClient } from '@xchainjs/xchain-binance'
import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { Send } from '../../../components/wallet/txs/send/'
import { SendFormBNB } from '../../../components/wallet/txs/send/'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { AddressValidation } from '../../../services/binance/types'
import { GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { NonEmptyWalletBalances, TxHashRD } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'

type Props = {
  selectedAsset: Asset
  walletBalances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  network: Network
}

export const SendViewBNB: React.FC<Props> = (props): JSX.Element => {
  const {
    selectedAsset,
    walletBalances: oWalletBalances,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    network
  } = props

  const oSelectedWalletBalance = useMemo(() => getWalletBalanceByAsset(oWalletBalances, O.some(selectedAsset)), [
    oWalletBalances,
    selectedAsset
  ])

  const { client$, fees$, txRD$, resetTx, subscribeTx } = useBinanceContext()

  const txRD = useObservableState<TxHashRD>(txRD$, RD.initial)
  const [fee] = useObservableState<O.Option<AssetAmount>>(
    () =>
      FP.pipe(
        fees$(),
        liveData.map((fees) => baseToAsset(fees.fast)),
        RxOp.map(RD.toOption)
      ),
    O.none
  )
  const oClient = useObservableState<O.Option<BinanceClient>>(client$, O.none)

  /**
   * Address validation provided by BinanceClient
   */
  const addressValidation = useMemo(
    () =>
      FP.pipe(
        oClient,
        O.map((client) => client.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [oClient]
  )

  /**
   * Custom send form used by BNB chain only
   */
  const sendForm = useCallback(
    (selectedAssetWalletBalance: WalletBalance) => (
      <SendFormBNB
        balance={selectedAssetWalletBalance}
        onSubmit={subscribeTx}
        balances={FP.pipe(
          oWalletBalances,
          O.getOrElse(() => [] as WalletBalances)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        fee={fee}
        network={network}
      />
    ),
    [subscribeTx, oWalletBalances, txRD, addressValidation, fee, network]
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
          <Send
            txRD={txRD}
            successActionHandler={successActionHandler}
            inititalActionHandler={resetTx}
            errorActionHandler={resetTx}
            sendForm={sendForm(selectedWalletBalance)}
          />
        )
      }
    )
  )
}
