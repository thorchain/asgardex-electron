import React, { useMemo } from 'react'

import {
  Asset,
  AssetRuneNative,
  baseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  formatBN
} from '@xchainjs/xchain-util'
import { Grid, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { AssetIcon } from '../uielements/assets/assetIcon'
import { AssetLabel } from '../uielements/assets/assetLabel'
import { Label } from '../uielements/label'
import * as H from './helpers'
import * as Styled from './PoolShares.styles'
import { PoolShareTableRowData, PoolShareTableData } from './PoolShares.types'

export type Props = {
  data: PoolShareTableData
  loading: boolean
  priceAsset: Asset | undefined
  network: Network
  goToStakeInfo: () => void
}

export const PoolShares: React.FC<Props> = ({ data, priceAsset, goToStakeInfo, loading, network }) => {
  const intl = useIntl()

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const iconColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: '',
      width: 90,
      render: ({ asset }: PoolShareTableRowData) => (
        <Row justify="center" align="middle">
          <AssetIcon asset={asset} size="normal" network={network} />
        </Row>
      )
    }),
    [network]
  )

  const poolColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'common.pool' }),
      align: 'left',
      responsive: ['md'],
      render: ({ asset }: PoolShareTableRowData) => <AssetLabel asset={asset} />
    }),
    [intl]
  )

  const ownershipColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'poolshares.ownership' }),
      align: 'center',
      render: ({ sharePercent }: PoolShareTableRowData) => (
        <Styled.OwnershipLabel align="center">{formatBN(sharePercent, 2)}%</Styled.OwnershipLabel>
      )
    }),
    [intl]
  )

  const valueColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'common.value' }),
      align: isDesktopView ? 'right' : 'center',
      render: ({ assetDepositPrice, runeDepositPrice }: PoolShareTableRowData) => {
        const totalPrice = baseAmount(runeDepositPrice.amount().plus(assetDepositPrice.amount()))
        return (
          <Label align={isDesktopView ? 'right' : 'center'}>
            {formatAssetAmountCurrency({ amount: baseToAsset(totalPrice), asset: priceAsset, decimal: 2 })}
          </Label>
        )
      }
    }),
    [intl, priceAsset, isDesktopView]
  )

  const assetColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'common.asset' }),
      align: 'right',
      render: ({ asset, assetShare }: PoolShareTableRowData) => (
        <Label align="right">
          {formatAssetAmountCurrency({
            amount: baseToAsset(assetShare),
            asset,
            decimal: 2
          })}
        </Label>
      )
    }),
    [intl]
  )

  const runeColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: AssetRuneNative.symbol,
      align: 'right',
      render: ({ runeShare }: PoolShareTableRowData) => (
        <Label align="right">
          {formatAssetAmountCurrency({
            amount: baseToAsset(runeShare),
            asset: AssetRuneNative,
            decimal: 2
          })}
        </Label>
      )
    }),
    []
  )

  const manageColumn: ColumnType<PoolShareTableRowData> = useMemo(
    () => ({
      title: '',
      align: 'right',
      render: ({ asset }: PoolShareTableRowData) => <Styled.ManageButton asset={asset} isTextView={isDesktopView} />
    }),
    [isDesktopView]
  )

  const desktopColumns: ColumnsType<PoolShareTableRowData> = useMemo(
    () => [iconColumn, poolColumn, ownershipColumn, valueColumn, assetColumn, runeColumn, manageColumn],
    [iconColumn, poolColumn, ownershipColumn, valueColumn, assetColumn, runeColumn, manageColumn]
  )

  const mobileColumns: ColumnsType<PoolShareTableRowData> = useMemo(() => [iconColumn, valueColumn, manageColumn], [
    iconColumn,
    valueColumn,
    manageColumn
  ])

  return (
    <Styled.Container>
      <Styled.Table
        loading={loading}
        columns={isDesktopView ? desktopColumns : mobileColumns}
        dataSource={data}
        rowKey={({ asset }) => asset.symbol}
      />
      <H.StakeInfo goToStakeInfo={goToStakeInfo} />
    </Styled.Container>
  )
}
