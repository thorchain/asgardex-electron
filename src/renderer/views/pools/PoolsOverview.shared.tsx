import { SyncOutlined } from '@ant-design/icons'
import { Asset, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'

import { ErrorView } from '../../components/shared/error'
import { AssetIcon } from '../../components/uielements/assets/assetIcon'
import { AssetLabel } from '../../components/uielements/assets/assetLabel'
import { TextButton } from '../../components/uielements/button'
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
    renderWatchColumn({ data, add: () => add(data.asset), remove: () => remove(data.asset) }),
  sorter: sortWatchColumn,
  sortDirections: ['descend', 'ascend']
})

const renderAssetColumn = ({ asset }: PoolTableRowData) => <AssetLabel asset={asset} />

const sortAssetColumn = ({ asset: assetA }: PoolTableRowData, { asset: assetB }: PoolTableRowData) =>
  assetA.symbol.localeCompare(assetB.symbol)

export const assetColumn = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'asset',
  title,
  align: 'left',
  render: renderAssetColumn,
  sorter: sortAssetColumn,
  sortDirections: ['descend', 'ascend']
})

const renderPoolColumn = ({ asset, network }: PoolTableRowData) => (
  <Row justify="center" align="middle">
    <AssetIcon asset={asset} network={network} />
  </Row>
)

export const poolColumn = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'pool',
  align: 'center',
  title,
  width: 100,
  render: renderPoolColumn
})

const renderPoolColumnMobile = ({ asset, network }: PoolTableRowData) => (
  <Row justify="center" align="middle" style={{ width: '100%' }}>
    <AssetIcon asset={asset} network={network} />
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

export const renderRefreshBtnColTitle = ({
  title,
  clickHandler,
  iconOnly
}: {
  title: string
  clickHandler: FP.Lazy<void>
  iconOnly: boolean
}) => (
  <div className="flex items-center justify-center">
    <TextButton size={iconOnly ? 'large' : 'normal'} onClick={clickHandler} className="">
      <div className="flex items-center">
        <SyncOutlined className={iconOnly ? 'mr-0' : 'mr-[8px]'} /> {!iconOnly && title}
      </div>
    </TextButton>
  </div>
)

export const renderTableError = (reloadBtnLabel: string, reloadBtnAction: FP.Lazy<void>) => (error: Error) =>
  (
    <ErrorView
      title={error?.toString() ?? ''}
      extra={<ReloadButton onClick={reloadBtnAction}>{reloadBtnLabel}</ReloadButton>}
    />
  )
