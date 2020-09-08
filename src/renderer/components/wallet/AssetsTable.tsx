import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { formatAssetAmountCurrency, baseToAsset, Asset, assetToString } from '@thorchain/asgardex-util'
import { Row, Col } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { RUNE_PRICE_POOL } from '../../const'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { getPoolPriceValue } from '../../services/binance/utils'
import { PoolDetails } from '../../services/midgard/types'
import { AssetsWithBalanceRD, AssetsWithBalance, AssetWithBalance } from '../../services/wallet/types'
import { PricePool } from '../../views/pools/types'
import ErrorView from '../shared/error/ErrorView'
import AssetIcon from '../uielements/assets/assetIcon'
import Label from '../uielements/label'
import { TableWrapper } from './AssetsTable.style'

type Props = {
  assetsRD: AssetsWithBalanceRD
  pricePool?: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: Asset) => void
}

const AssetsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { assetsRD, pricePool = RUNE_PRICE_POOL, poolDetails, selectAssetHandler = (_) => {} } = props

  const intl = useIntl()

  // store previous data of balances to still render these while reloading new data
  const previousBalances = useRef<O.Option<AssetsWithBalance>>(O.none)

  const iconColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: '',
      render: ({ asset }: AssetWithBalance) => <AssetIcon asset={asset} size="normal" />
    }),
    []
  )

  const renderNameColumn = ({ asset }: AssetWithBalance) => <Label>{asset.symbol}</Label>
  const sortNameColumn = ({ asset: a }: AssetWithBalance, { asset: b }: AssetWithBalance) =>
    a.symbol.localeCompare(b.symbol)

  const nameColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.name' }),
      align: 'left',
      render: renderNameColumn,
      sorter: sortNameColumn,
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'ascend'
    }),
    [intl]
  )

  const renderTickerColumn = ({ asset }: AssetWithBalance) => <Label nowrap>{asset.ticker}</Label>
  const sortTickerColumn = ({ asset: a }: AssetWithBalance, { asset: b }: AssetWithBalance) =>
    a.ticker.localeCompare(b.ticker)

  const tickerColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.ticker' }),
      align: 'left',
      render: renderTickerColumn,
      sorter: sortTickerColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const renderBalanceColumn = ({ asset, amount }: AssetWithBalance) => {
    const assetString = assetToString(asset)
    const balance = formatAssetAmountCurrency(baseToAsset(amount), assetString, 3)
    return <Label nowrap>{balance}</Label>
  }

  const balanceColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.balance' }),
      align: 'left',
      render: renderBalanceColumn,
      sorter: (a: AssetWithBalance, b: AssetWithBalance) => a.amount.amount().comparedTo(b.amount.amount()),
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const renderPriceColumn = useCallback(
    (balance: AssetWithBalance) => {
      const oPrice = getPoolPriceValue(balance, poolDetails, pricePool.poolData)
      const label = FP.pipe(
        oPrice,
        O.map((price) => formatAssetAmountCurrency(baseToAsset(price), pricePool.asset, 3)),
        // "empty" label if we don't get a price value
        O.getOrElse(() => '--')
      )
      return <Label nowrap>{label}</Label>
    },
    [poolDetails, pricePool]
  )

  const priceColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.value' }),
      align: 'left',
      render: renderPriceColumn,
      sorter: (a: AssetWithBalance, b: AssetWithBalance) => {
        const oPriceA = getPoolPriceValue(a, poolDetails, pricePool.poolData)
        const oPriceB = getPoolPriceValue(b, poolDetails, pricePool.poolData)
        return FP.pipe(
          sequenceTOption(oPriceA, oPriceB),
          O.fold(
            () => 0,
            ([priceA, priceB]) => priceA.amount().comparedTo(priceB.amount())
          )
        )
      },
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderPriceColumn, poolDetails, pricePool.poolData]
  )

  const columns = [iconColumn, nameColumn, tickerColumn, balanceColumn, priceColumn]

  const onRow = useCallback(
    ({ asset }: AssetWithBalance) => {
      return {
        onClick: () => selectAssetHandler(asset)
      }
    },
    [selectAssetHandler]
  )
  const renderAssetsTable = useCallback(
    (balances: AssetsWithBalance, loading = false) => {
      return <TableWrapper dataSource={balances} loading={loading} rowKey={'tx'} onRow={onRow} columns={columns} />
    },
    [columns, onRow]
  )

  const renderAssets = useMemo(
    () => (
      <>
        {RD.fold(
          // initial state
          () => renderAssetsTable([], true),
          // loading state
          () => {
            const pools = O.getOrElse(() => [] as AssetsWithBalance)(previousBalances.current)
            return renderAssetsTable(pools, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} />
          },
          // success state
          (balances: AssetsWithBalance): JSX.Element => {
            previousBalances.current = O.some(balances)
            return renderAssetsTable(balances)
          }
        )(assetsRD)}
      </>
    ),
    [assetsRD, renderAssetsTable]
  )

  return (
    <Row>
      <Col span={24}>{renderAssets}</Col>
    </Row>
  )
}

export default AssetsTable
