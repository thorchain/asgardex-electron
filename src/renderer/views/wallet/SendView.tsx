import React from 'react'

import { initial } from '@devexperts/remote-data-ts'
import { assetFromString } from '@thorchain/asgardex-util'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import Send from '../../components/wallet/Send'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { FundSendParams } from '../../routes/wallet'

const SendView: React.FC = (): JSX.Element => {
  const { transaction, balancesState$ } = useBinanceContext()
  const { asset: assetParam } = useParams<FundSendParams>()
  const balances = useObservableState(balancesState$, initial)

  const asset = assetFromString(assetParam)

  return <Send transactionService={transaction} balances={balances} initialActiveAsset={asset} />
}

export default SendView
