import React from 'react'

import { formatBN } from '@thorchain/asgardex-util'
import { Row } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import Label from '../label'
import { PoolStatusWrapper } from './PoolStatus.style'

type Props = {
  amount: BigNumber
  asset: string
  label: string
  target: string
  trend: BigNumber
}

const PoolStatus: React.FC<Props> = (props: Props): JSX.Element => {
  const { amount, asset, label, target, trend } = props
  const intl = useIntl()

  const trendPositive = trend.isGreaterThanOrEqualTo(0)
  const trendVal = `${trendPositive ? '+' : '-'} ${formatBN(trend)}%`
  const trendColor = trendPositive ? 'error' : 'success'
  const amountVal = intl.formatNumber(amount.toNumber(), { currency: 'USD', style: 'currency' })

  return (
    <PoolStatusWrapper {...props}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label color="light">{asset + ' / ' + target}</Label>
        <Label color={trendColor}>{trendVal}</Label>
      </Row>
      <Label size="big" className="amount">
        {amountVal}
      </Label>
      <Label color="light">{label}</Label>
    </PoolStatusWrapper>
  )
}

export default PoolStatus
