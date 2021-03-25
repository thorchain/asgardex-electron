import React from 'react'

import { TxType } from '../../../services/midgard/types'
import { AssetAmountAddress, AssetWithAmount } from '../../../types/asgardex'

export type ActionProps = {
  incomes: AssetAmountAddress[]
  outgos: AssetAmountAddress[]
  fees?: AssetWithAmount[]
  /**
   * Possible transaction slip in percents
   */
  slip?: number
  className?: string
  date: React.ReactElement
  type: TxType
}
