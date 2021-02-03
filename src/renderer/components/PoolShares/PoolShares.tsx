import React, { useMemo } from 'react'

import { Asset } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { useIntl } from 'react-intl'

import { AssetIcon } from '../uielements/assets/assetIcon'
import { Label } from '../uielements/label'
import * as H from './helpers'
import * as Styled from './PoolShares.styles'
import { PoolShare } from './types'

type Props = {
  data: PoolShare[]
  goToStakeInfo: (asset: Asset) => void
  goToDataInfo: (asset: Asset) => void
}

export const PoolShares: React.FC<Props> = ({ data, goToStakeInfo, goToDataInfo }) => {
  const intl = useIntl()

  const iconColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'icon',
      title: '',
      width: 90,
      render: ({ asset }: PoolShare) => (
        <Row justify="center" align="middle">
          <AssetIcon asset={asset} size="normal" />
        </Row>
      )
    }),
    []
  )

  const poolColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'pool',
      title: intl.formatMessage({ id: 'poolshares.pool' }),
      align: 'left',
      responsive: ['md'],
      render: ({ asset }: PoolShare) => <Label>{asset.symbol}</Label>
    }),
    [intl]
  )

  const ownershipColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'ownership',
      title: intl.formatMessage({ id: 'poolshares.ownership' }),
      align: 'left',
      render: ({ ownership }: PoolShare) => <Label>{ownership}%</Label>
    }),
    [intl]
  )

  const valueColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'value',
      title: intl.formatMessage({ id: 'poolshares.value' }),
      align: 'left',
      render: ({ value }: PoolShare) => <Label>${value}</Label>
    }),
    [intl]
  )

  const stakeInfoColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'stakeInfo',
      title: 'RUNEStake.info',
      responsive: ['md'],
      align: 'left',
      render: ({ asset }: PoolShare) => <H.StakeInfo goToStakeInfo={() => goToStakeInfo(asset)} />
    }),
    [goToStakeInfo]
  )

  const dataInfoColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'dataInfo',
      title: 'RUNEData.info',
      responsive: ['md'],
      align: 'left',
      render: ({ asset }: PoolShare) => <H.DataInfo goToDataInfo={() => goToDataInfo(asset)} />
    }),
    [goToDataInfo]
  )

  return (
    <Styled.Container>
      <Styled.Table
        columns={[iconColumn, poolColumn, ownershipColumn, valueColumn, stakeInfoColumn, dataInfoColumn]}
        dataSource={data}
        rowKey={({ asset }) => asset.symbol}
      />
    </Styled.Container>
  )
}
