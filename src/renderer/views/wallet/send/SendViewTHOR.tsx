import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { Send, SendFormTHOR } from '../../../components/wallet/txs/send/'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { GetExplorerTxUrl } from '../../../services/clients'
import { AddressValidation } from '../../../services/thorchain/types'
import { NonEmptyWalletBalances, TxRD } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'

type Props = {
  thorAsset: Asset
  balances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
}

export const SendViewTHOR: React.FC<Props> = (props): JSX.Element => {
  const { thorAsset: selectedAsset, balances: oBalances, getExplorerTxUrl: oGetExplorerTxUrl = O.none } = props

  const selectedAssetBalance = useMemo(() => getWalletBalanceByAsset(oBalances, O.some(selectedAsset)), [
    oBalances,
    selectedAsset
  ])

  const { fees$, pushTx, txRD$, client$, resetTx } = useThorchainContext()

  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
  const oClient = useObservableState<O.Option<ThorchainClient>>(client$, O.none)

  const [fee] = useObservableState<O.Option<AssetAmount>>(
    () =>
      FP.pipe(
        fees$,
        liveData.map((fees) => baseToAsset(fees.fast)),
        RxOp.map(RD.toOption)
      ),
    O.none
  )

  const addressValidation = useMemo(
    () =>
      FP.pipe(
        oClient,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [oClient]
  )

  /**
   * Custom send form used by THOR chain only
   */
  const sendForm = useCallback(
    (balance: WalletBalance) => (
      <SendFormTHOR
        balance={balance}
        onSubmit={pushTx}
        balances={FP.pipe(
          oBalances,
          O.getOrElse(() => [] as WalletBalance[])
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        fee={fee}
      />
    ),
    [pushTx, oBalances, txRD, addressValidation, fee]
  )

  return FP.pipe(
    sequenceTOption(oGetExplorerTxUrl, selectedAssetBalance),
    O.fold(
      () => <></>,
      ([getExplorerTxUrl, selectedAssetBalance]) => {
        const successActionHandler: (txHash: string) => Promise<void> = FP.flow(
          getExplorerTxUrl,
          window.apiUrl.openExternal
        )
        return (
          <>
            <Send
              txRD={txRD}
              successActionHandler={successActionHandler}
              inititalActionHandler={resetTx}
              errorActionHandler={resetTx}
              sendForm={sendForm(selectedAssetBalance)}
            />
          </>
        )
      }
    )
  )
}
