import React from 'react'

import { Network } from '../../../../shared/api/types'
import { TxType } from '../../../services/midgard/types'
import { AssetWithAmount } from '../../../types/asgardex'

export type ActionProps = {
  network: Network
  incomes: AssetWithAmount[]
  outgos: AssetWithAmount[]
  fees?: AssetWithAmount[]
  /**
   * Possible transaction slip in percents
   */
  slip?: number
  className?: string
  date: React.ReactElement
  type: TxType
  isDesktopView: boolean
}
