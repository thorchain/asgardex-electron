import React, { useMemo } from 'react'

import { initial } from '@devexperts/remote-data-ts'
import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, bn } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import Send from '../../components/wallet/Send'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { FundSendParams } from '../../routes/wallet'
import { bncSymbolToAsset } from '../../services/binance/utils'

const SendView: React.FC = (): JSX.Element => {
  const { transaction, balancesState$ } = useBinanceContext()
  const { asset: assetParam } = useParams<FundSendParams>()
  const balancesState = useObservableState(balancesState$, initial)

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
                O.map((asset) => ({ ...asset, balance: bn(balance.free) }))
              )
            ),
            sequenceTOptionFromArray
          )
        ),
        RD.chain((balances) => RD.fromOption(balances, () => Error('')))
      ),
    [balancesState]
  )
  const initialActiveAsset = useMemo(
    () => pipe(balances, RD.map(A.findFirst((balance) => balance.symbol === asset?.symbol))),
    [balances, asset]
  )

  return <Send transactionService={transaction} balances={balances} initialActiveAsset={initialActiveAsset} />
}

export default SendView
