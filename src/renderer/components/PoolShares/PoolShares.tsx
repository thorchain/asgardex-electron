import React, { useMemo } from 'react'

import { Asset, baseAmount, baseToAsset, formatAssetAmountCurrency, formatBN } from '@xchainjs/xchain-util'
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
  priceAsset: Asset | undefined
  goToStakeInfo: () => void
}

export const PoolShares: React.FC<Props> = ({ data, priceAsset, goToStakeInfo }) => {
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
      title: intl.formatMessage({ id: 'common.pool' }),
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
      render: ({ poolShare }: PoolShare) => <Label>{formatBN(poolShare)}%</Label>
    }),
    [intl]
  )

  const valueColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'value',
      title: intl.formatMessage({ id: 'common.value' }),
      align: 'left',
      render: ({ assetDepositPrice, runeDepositPrice }: PoolShare) => {
        const totalPrice = baseAmount(runeDepositPrice.amount().plus(assetDepositPrice.amount()))
        return (
          <Label>{formatAssetAmountCurrency({ amount: baseToAsset(totalPrice), asset: priceAsset, decimal: 2 })}</Label>
        )
      }
    }),
    [intl, priceAsset]
  )

  const assetColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'assetAmount',
      title: intl.formatMessage({ id: 'common.asset' }),
      align: 'left',
      render: ({ assetDepositPrice }: PoolShare) => (
        <Label>
          {formatAssetAmountCurrency({
            amount: baseToAsset(assetDepositPrice),
            asset: priceAsset,
            decimal: 2
          })}
        </Label>
      )
    }),
    [intl, priceAsset]
  )

  const runeColumn: ColumnType<PoolShare> = useMemo(
    () => ({
      key: 'runeAmount',
      title: 'Rune',
      align: 'left',
      render: ({ runeDepositPrice }: PoolShare) => (
        <Label>
          {formatAssetAmountCurrency({
            amount: baseToAsset(runeDepositPrice),
            asset: priceAsset,
            decimal: 2
          })}
        </Label>
      )
    }),
    [priceAsset]
  )

  return (
    <Styled.Container>
      <Styled.Table
        columns={[iconColumn, poolColumn, ownershipColumn, valueColumn, assetColumn, runeColumn]}
        dataSource={data}
        rowKey={({ asset }) => asset.symbol}
      />
      <H.StakeInfo goToStakeInfo={goToStakeInfo} />
    </Styled.Container>
  )
}
