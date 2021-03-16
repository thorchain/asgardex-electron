import React from 'react'

import { AssetWithAmount } from '../../../types/asgardex'
import { UITxType } from '../txType/TxType.types'

export type ActionProps = {
  incomes: AssetWithAmount[]
  outgos: AssetWithAmount[]
  fees?: AssetWithAmount[]
  /**
   * Possible transaction slip in percents
   */
  slip?: number
  className?: string
  date: React.ReactElement
  type: UITxType
}
