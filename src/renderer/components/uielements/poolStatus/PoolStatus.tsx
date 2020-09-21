import React from 'react'

import { Row } from 'antd'
import BigNumber from 'bignumber.js'

import Label from '../label'
import Trend from '../trend'
import * as Styled from './PoolStatus.style'

type Props = {
  asset: string
  label: string
  target: string
  trend?: BigNumber
}

const PoolStatus: React.FC<Props> = (props): JSX.Element => {
  const { children, asset, label, target, trend } = props

  return (
    <Styled.PoolStatusWrapper {...props}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label textTransform="uppercase" color="light">
          {asset + ' / ' + target}
        </Label>
        {trend && <Trend amount={trend} />}
      </Row>
      <Styled.Value className="amount">{children}</Styled.Value>
      <Label textTransform="uppercase" color="light">
        {label}
      </Label>
    </Styled.PoolStatusWrapper>
  )
}

export default PoolStatus
