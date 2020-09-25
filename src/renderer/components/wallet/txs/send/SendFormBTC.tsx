import React from 'react'

import { Address } from '@thorchain/asgardex-binance'

import { AddressValidation, FeesRD, SendTxParams } from '../../../../services/bitcoin/types'
import { AssetsWithBalance, AssetWithBalance } from '../../../../services/wallet/types'

export type FormValues = {
  recipient: Address
  amount: string
  memo?: string
}

type Props = {
  assetsWB: AssetsWithBalance
  assetWB: AssetWithBalance
  onSubmit: ({ to, amount, feeRate, memo }: SendTxParams) => void
  isLoading?: boolean
  addressValidation: AddressValidation
  fees: FeesRD
}

const SendFormBTC: React.FC<Props> = (): JSX.Element => {
  return <h1>SendFormBTC - coming soon ...</h1>
}

export default SendFormBTC
