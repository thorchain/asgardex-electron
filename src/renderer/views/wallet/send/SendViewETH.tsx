import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as EthereumClient, getTokenAddress } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount, ETHChain, formatBaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { Send } from '../../../components/wallet/txs/send/'
import { SendFormETH } from '../../../components/wallet/txs/send/'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import { GetExplorerTxUrl, WalletBalances } from '../../../services/clients'
import { AddressValidation } from '../../../services/ethereum/types'
import { NonEmptyWalletBalances, TxRD } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'

type Props = {
  selectedAsset: Asset
  walletBalances: O.Option<NonEmptyWalletBalances>
  getExplorerTxUrl: O.Option<GetExplorerTxUrl>
  reloadFeesHandler: () => void
}

export const SendViewETH: React.FC<Props> = (props): JSX.Element => {
  const {
    selectedAsset,
    walletBalances: oWalletBalances,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    reloadFeesHandler
  } = props

  const oSelectedWalletBalance = useMemo(() => getWalletBalanceByAsset(oWalletBalances, O.some(selectedAsset)), [
    oWalletBalances,
    selectedAsset
  ])

  const { client$, fees$, txRD$, resetTx, subscribeTx } = useEthereumContext()

  const txRD = useObservableState<TxRD>(txRD$, RD.initial)
  const fees = useObservableState(fees$, RD.initial)
  const oClient = useObservableState<O.Option<EthereumClient>>(client$, O.none)

  /**
   * Address validation provided by EthereumClient
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
   * estimate fee provided by EthereumClient
   */
  const estimateFee = useCallback(
    (asset: Asset, recipient: string, amount: BaseAmount, gasPrice: string) =>
      FP.pipe(
        oClient,
        O.map((client) =>
          asset.chain === ETHChain
            ? client.estimateGasNormalTx({
                recipient,
                amount,
                overrides: {
                  gasPrice
                }
              })
            : client.estimateGasERC20Tx({
                assetAddress: getTokenAddress(asset) || '',
                recipient,
                amount: formatBaseAmount(amount)
              })
        ),
        O.getOrElse(() => Promise.resolve(ZERO_BASE_AMOUNT))
      ),
    [oClient]
  )

  /**
   * Custom send form used by ETH chain only
   */
  const sendForm = useCallback(
    (selectedAssetWalletBalance: WalletBalance) => (
      <SendFormETH
        balance={selectedAssetWalletBalance}
        onSubmit={subscribeTx}
        balances={FP.pipe(
          oWalletBalances,
          O.getOrElse(() => [] as WalletBalances)
        )}
        isLoading={RD.isPending(txRD)}
        addressValidation={addressValidation}
        reloadFeesHandler={reloadFeesHandler}
        fees={fees}
        estimateFee={estimateFee}
      />
    ),
    [subscribeTx, oWalletBalances, txRD, addressValidation, reloadFeesHandler, fees, estimateFee]
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
