import React from 'react'

import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { bn, isValidBN, formatBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { Label } from '../label'
import { TrendWrapper } from './Trend.style'

type Props = {
  amount?: BigNumber
}

export const Trend: React.FC<Props> = (props): JSX.Element => {
  const { amount = bn(0), ...otherProps } = props
  const trend = isValidBN(amount) && amount.isGreaterThanOrEqualTo(0)
  const trendIcon = trend ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  const trendVal = `${formatBN(amount)}%`

  return (
    <TrendWrapper trend={trend} {...otherProps}>
      {trendIcon}
      <Label>{trendVal}</Label>
    </TrendWrapper>
  )
}
