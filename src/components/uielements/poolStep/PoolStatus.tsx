import React from 'react'

import { Row } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import Label from '../label'
import Trend from '../trend'
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
  const amountVal = intl.formatNumber(amount.toNumber(), { currency: 'USD', style: 'currency' })

  return (
    <PoolStatusWrapper {...props}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label color="light">{asset + ' / ' + target}</Label>
        <Trend amount={trend} />
      </Row>
      <Label size="big" className="amount">
        {amountVal}
      </Label>
      <Label color="light">{label}</Label>
    </PoolStatusWrapper>
  )
}

export default PoolStatus
