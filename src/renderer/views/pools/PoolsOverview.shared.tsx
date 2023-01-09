import { SyncOutlined } from '@ant-design/icons'
import { Asset, BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'

import { Network } from '../../../shared/api/types'
import { ErrorView } from '../../components/shared/error'
import { AssetIcon } from '../../components/uielements/assets/assetIcon'
import { AssetLabel } from '../../components/uielements/assets/assetLabel'
import { ReloadButton, TextButton } from '../../components/uielements/button'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { sortByDepth } from '../../helpers/poolHelper'
import * as Styled from './PoolsOverview.styles'

const renderWatchColumn = ({
  data: { watched },
  add,
  remove
}: {
  data: { watched: boolean }
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

const sortWatchColumn = ({ watched: watchedA }: { watched: boolean }, { watched: watchedB }: { watched: boolean }) =>
  watchedA === watchedB ? 0 : 1

export const watchColumn = <T extends { watched: boolean; asset: Asset }>(
  add: (asset: Asset) => void,
  remove: (asset: Asset) => void
): ColumnType<T> => ({
  key: 'watch',
  align: 'center',
  width: 50,
  render: (data: { watched: boolean; asset: Asset }) =>
    renderWatchColumn({ data, add: () => add(data.asset), remove: () => remove(data.asset) }),
  sorter: sortWatchColumn,
  sortDirections: ['descend', 'ascend']
})

const renderAssetColumn = ({ asset }: { asset: Asset }) => <AssetLabel asset={asset} />

const sortAssetColumn = ({ asset: assetA }: { asset: Asset }, { asset: assetB }: { asset: Asset }) =>
  assetA.symbol.localeCompare(assetB.symbol)

export const assetColumn = <T extends { asset: Asset }>(title: string): ColumnType<T> => ({
  key: 'asset',
  title,
  align: 'left',
  render: renderAssetColumn,
  sorter: sortAssetColumn,
  sortDirections: ['descend', 'ascend']
})

const renderPoolColumn = ({ asset, network }: { asset: Asset; network: Network }) => (
  <Row justify="center" align="middle">
    <AssetIcon asset={asset} network={network} />
  </Row>
)

export const poolColumn = <T extends { network: Network; asset: Asset }>(title: string): ColumnType<T> => ({
  key: 'pool',
  align: 'center',
  title,
  width: 100,
  render: renderPoolColumn
})

const renderPoolColumnMobile = ({ asset, network }: { network: Network; asset: Asset }) => (
  <Row justify="center" align="middle" style={{ width: '100%' }}>
    <AssetIcon asset={asset} network={network} />
  </Row>
)
export const poolColumnMobile = <T extends { network: Network; asset: Asset }>(title: string): ColumnType<T> => ({
  key: 'pool',
  title,
  render: renderPoolColumnMobile
})

const renderPriceColumn =
  (pricePoolAsset: Asset) =>
  ({ poolPrice }: { poolPrice: BaseAmount }) =>
    (
      <Styled.Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(poolPrice),
          asset: pricePoolAsset,
          decimal: 3
        })}
      </Styled.Label>
    )

const sortPriceColumn = (a: { poolPrice: BaseAmount }, b: { poolPrice: BaseAmount }) =>
  ordBaseAmount.compare(a.poolPrice, b.poolPrice)

export const priceColumn = <T extends { poolPrice: BaseAmount }>(
  title: string,
  pricePoolAsset: Asset
): ColumnType<T> => ({
  key: 'poolprice',
  align: 'right',
  title,
  render: renderPriceColumn(pricePoolAsset),
  sorter: sortPriceColumn,
  sortDirections: ['descend', 'ascend']
})

const renderDepthColumn =
  (pricePoolAsset: Asset) =>
  ({ asset, depthPrice, depthAmount }: { asset: Asset; depthPrice: BaseAmount; depthAmount: BaseAmount }) =>
    (
      <div className="flex flex-col items-end justify-center font-main">
        <div className="whitespace-nowrap text-16 text-text0 dark:text-text0d">
          {formatAssetAmountCurrency({
            amount: baseToAsset(depthAmount),
            asset,
            decimal: 2
          })}
        </div>
        <div className="whitespace-nowrap text-14 text-gray2 dark:text-gray2d">
          {formatAssetAmountCurrency({
            amount: baseToAsset(depthPrice),
            asset: pricePoolAsset,
            decimal: 2
          })}
        </div>
      </div>
    )

export const depthColumn = <T extends { depthPrice: BaseAmount }>(
  title: string,
  pricePoolAsset: Asset
): ColumnType<T> => ({
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
      extra={<ReloadButton label={reloadBtnLabel} onClick={reloadBtnAction} />}
    />
  )
