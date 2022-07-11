import { Asset, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'

import { ErrorView } from '../../components/shared/error'
import { AssetIcon } from '../../components/uielements/assets/assetIcon'
import { AssetLabel } from '../../components/uielements/assets/assetLabel'
import { ReloadButton } from '../../components/uielements/reloadButton'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { sortByDepth } from '../../helpers/poolHelper'
import { PoolTableRowData } from './Pools.types'
import * as Styled from './PoolsOverview.styles'

const renderWatchColumn = ({
  data: { watched },
  add,
  remove
}: {
  data: PoolTableRowData
  add: FP.Lazy<void>
  remove: FP.Lazy<void>
}) => (
  <Styled.WatchContainer
    onClick={(event) => {
      event.preventDefault()
      event.stopPropagation()
      watched ? remove() : add()
    }}>
    {watched ? <Styled.StarFilled /> : <Styled.StarOutlined />}
  </Styled.WatchContainer>
)

const sortWatchColumn = ({ watched: watchedA }: PoolTableRowData, { watched: watchedB }: PoolTableRowData) =>
  watchedA === watchedB ? 0 : 1

export const watchColumn = (
  add: (asset: Asset) => void,
  remove: (asset: Asset) => void
): ColumnType<PoolTableRowData> => ({
  key: 'watch',
  align: 'center',
  width: 50,
  render: (data: PoolTableRowData) =>
    renderWatchColumn({ data, add: () => add(data.pool.target), remove: () => remove(data.pool.target) }),
  sorter: sortWatchColumn,
  sortDirections: ['descend', 'ascend']
})

const renderAssetColumn = ({ pool }: PoolTableRowData) => <AssetLabel asset={pool.target} />

const sortAssetColumn = ({ pool: poolA }: PoolTableRowData, { pool: poolB }: PoolTableRowData) =>
  poolA.target.symbol.localeCompare(poolB.target.symbol)

export const assetColumn = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'asset',
  title,
  align: 'left',
  render: renderAssetColumn,
  sorter: sortAssetColumn,
  sortDirections: ['descend', 'ascend']
})

const renderPoolColumn = ({ pool, network }: PoolTableRowData) => (
  <Row justify="center" align="middle">
    <AssetIcon asset={pool.target} network={network} />
  </Row>
)

export const poolColumn = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'pool',
  align: 'center',
  title,
  width: 100,
  render: renderPoolColumn
})

const renderPoolColumnMobile = ({ pool, network }: PoolTableRowData) => (
  <Row justify="center" align="middle" style={{ width: '100%' }}>
    <AssetIcon asset={pool.target} network={network} />
  </Row>
)
export const poolColumnMobile = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'pool',
  title,
  render: renderPoolColumnMobile
})

const renderPriceColumn =
  (pricePoolAsset: Asset) =>
  ({ poolPrice }: PoolTableRowData) =>
    (
      <Styled.Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(poolPrice),
          asset: pricePoolAsset,
          decimal: 3
        })}
      </Styled.Label>
    )

const sortPriceColumn = (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.poolPrice, b.poolPrice)

export const priceColumn = (title: string, pricePoolAsset: Asset): ColumnType<PoolTableRowData> => ({
  key: 'poolprice',
  align: 'right',
  title,
  render: renderPriceColumn(pricePoolAsset),
  sorter: sortPriceColumn,
  sortDirections: ['descend', 'ascend']
})

const renderDepthColumn =
  (pricePoolAsset: Asset) =>
  ({ depthPrice }: PoolTableRowData) =>
    (
      <Styled.Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(depthPrice),
          asset: pricePoolAsset,
          decimal: 2
        })}
      </Styled.Label>
    )

export const depthColumn = (title: string, pricePoolAsset: Asset): ColumnType<PoolTableRowData> => ({
  key: 'depth',
  align: 'right',
  title,
  render: renderDepthColumn(pricePoolAsset),
  sorter: sortByDepth,
  sortDirections: ['descend', 'ascend'],
  // Note: `defaultSortOrder` has no effect here, that's we do a default sort in `getPoolTableRowsData`
  defaultSortOrder: 'descend'
})

export const renderRefreshBtnColTitle = (title: string, clickHandler: FP.Lazy<void>) => (
  <Styled.ActionColumn>
    <ReloadButton onClick={clickHandler}>{title}</ReloadButton>
  </Styled.ActionColumn>
)

export const renderTableError = (reloadBtnLabel: string, reloadBtnAction: FP.Lazy<void>) => (error: Error) =>
  (
    <ErrorView
      title={error?.toString() ?? ''}
      extra={<ReloadButton onClick={reloadBtnAction}>{reloadBtnLabel}</ReloadButton>}
    />
  )
