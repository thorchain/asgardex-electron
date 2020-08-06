import React from 'react'

import Send from '../../components/wallet/Send'
import { useBinanceContext } from '../../contexts/BinanceContext'

const SendView: React.FC = (): JSX.Element => {
  const { transaction } = useBinanceContext()
  return <Send transactionService={transaction} />
}

export default SendView
