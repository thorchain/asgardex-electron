import React from 'react'

import { AssetAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Row } from 'antd'
import BigNumber from 'bignumber.js'

import Label from '../label'
import Trend from '../trend'
import { PoolStatusWrapper } from './PoolStatus.style'

type Props = {
  amount: AssetAmount
  asset: string
  label: string
  target: string
  trend: BigNumber
}

const PoolStatus: React.FC<Props> = (props: Props): JSX.Element => {
  const { amount, asset, label, target, trend } = props

  return (
    <PoolStatusWrapper {...props}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label color="light">{asset + ' / ' + target}</Label>
        <Trend amount={trend} />
      </Row>
      <Label size="big" className="amount">
        {formatAssetAmountCurrency(amount)}
      </Label>
      <Label color="light">{label}</Label>
    </PoolStatusWrapper>
  )
}

export default PoolStatus
