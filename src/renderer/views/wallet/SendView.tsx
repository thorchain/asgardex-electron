import React, { useMemo } from 'react'

import { initial } from '@devexperts/remote-data-ts'
import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, bn } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
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
                O.map((asset) => ({ ...asset, balance: bn(balance.free) }))
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
    () => pipe(balances, RD.map(A.findFirst((balance) => balance.symbol === asset?.symbol))),
    [balances, asset]
  )

  // `balances` will be fixed in https://github.com/thorchain/asgardex-electron/pull/340
  return <Send transactionService={transaction} balances={RD.initial} initialActiveAsset={initialActiveAsset} />
}

export default SendView
