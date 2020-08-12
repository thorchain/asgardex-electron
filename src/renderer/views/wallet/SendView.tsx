import React, { useMemo } from 'react'

import { initial } from '@devexperts/remote-data-ts'
import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, Asset, assetAmount } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import Send from '../../components/wallet/Send'
import { SendAction } from '../../components/wallet/types'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { SendParams } from '../../routes/wallet'
import { bncSymbolToAsset } from '../../services/binance/utils'
import { AssetWithBalance } from '../../types/asgardex'

type Props = {
  sendAction?: SendAction
}

const SendView: React.FC<Props> = ({ sendAction = 'send' }): JSX.Element => {
  const { transaction, balancesState$ } = useBinanceContext()
  const { asset: assetParam } = useParams<SendParams>()
  const balancesState = useObservableState(balancesState$, initial)
  const intl = useIntl()

  const asset = assetFromString(assetParam)

  const balances = useMemo(
    () =>
      pipe(
        balancesState,
        RD.map((balances) =>
          pipe(
            balances.map((balance) =>
              pipe(
                bncSymbolToAsset(balance.symbol),
                O.map<Asset, AssetWithBalance>((asset) => ({
                  asset,
                  balance: assetAmount(balance.free),
                  frozenBalance: assetAmount(balance.frozen)
                }))
              )
            ),
            sequenceTOptionFromArray
          )
        ),
        RD.chain((balances) =>
          RD.fromOption(balances, () => Error(intl.formatMessage({ id: 'wallet.send.errors.balancesFailed' })))
        )
      ),
    [balancesState, intl]
  )
  const initialActiveAsset = useMemo(
    () => pipe(balances, RD.map(A.findFirst((assetWB) => assetWB.asset.symbol === asset?.symbol))),
    [asset, balances]
  )

  return (
    <Send
      sendAction={sendAction}
      transactionService={transaction}
      balances={balances}
      initialActiveAsset={initialActiveAsset}
    />
  )
}

export default SendView
