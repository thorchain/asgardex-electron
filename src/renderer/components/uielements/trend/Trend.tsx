import React from 'react'

import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { bn, isValidBN, formatBN } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import * as Styled from './Trend.style'

type Props = {
  amount?: BigNumber
  className?: string
}

export const Trend: React.FC<Props> = (props): JSX.Element => {
  const { amount = bn(0), className } = props
  const trend = isValidBN(amount) && amount.isGreaterThanOrEqualTo(0)
  const trendIcon = trend ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  const value = `${formatBN(amount)}%`

  return (
    <Styled.Wrapper trend={trend} className={className}>
      {trendIcon}
      <Styled.Label color={trend ? 'primary' : 'error'}>{value}</Styled.Label>
    </Styled.Wrapper>
  )
}
