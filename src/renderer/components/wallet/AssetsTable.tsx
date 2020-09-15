import React, { useMemo, useCallback, useRef, useEffect } from 'react'

import { formatAssetAmountCurrency, baseToAsset, Asset, assetToString } from '@thorchain/asgardex-util'
import { Row, Col } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { RUNE_PRICE_POOL } from '../../const'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { getPoolPriceValue } from '../../services/binance/utils'
import { PoolDetails } from '../../services/midgard/types'
import {
  AssetWithBalance,
  NonEmptyAssetsWithBalance,
  NonEmptyApiErrors,
  AssetsWithBalance
} from '../../services/wallet/types'
import { filterNullableBalances, sortBalances } from '../../services/wallet/util'
import { PricePool } from '../../views/pools/types'
import ErrorAlert from '../uielements/alert/ErrorAlert'
import AssetIcon from '../uielements/assets/assetIcon'
import Label from '../uielements/label'
import { TableWrapper } from './AssetsTable.style'

type Props = {
  assetsWB?: O.Option<NonEmptyAssetsWithBalance>
  assetsLoading?: boolean
  assetsErrors?: O.Option<NonEmptyApiErrors>
  pricePool?: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: Asset) => void
}

const AssetsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    assetsWB = O.none,
    assetsLoading = false,
    assetsErrors = O.none,
    pricePool = RUNE_PRICE_POOL,
    poolDetails,
    selectAssetHandler = (_) => {}
  } = props

  const intl = useIntl()

  // store previous data of balances to render these while reloading
  const previousBalances = useRef<AssetsWithBalance>()

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
      sortDirections: ['descend', 'ascend']
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
      sorter: (a: AssetWithBalance, b: AssetWithBalance) => ordBaseAmount.compare(a.amount, b.amount),
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
            ([priceA, priceB]) => ordBaseAmount.compare(priceA, priceB)
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

  const renderApiErrors = useMemo(
    () =>
      FP.pipe(
        assetsErrors,
        O.map(
          A.map(({ apiId, msg }) =>
            intl.formatMessage({ id: 'wallet.errors.balancesFailed' }, { apiId, errorMsg: msg })
          )
        ),
        O.fold(
          () => <></>,
          (descriptions) => (
            <ErrorAlert message={intl.formatMessage({ id: 'common.error' })} descriptions={descriptions} />
          )
        )
      ),
    [assetsErrors, intl]
  )

  const tableData = useMemo(
    // filter out assets with zero balances
    // and order assets to BTC -> RUNE -> BNB -> others
    () => FP.pipe(assetsWB, O.map(FP.flow(filterNullableBalances, sortBalances)), O.toUndefined),
    [assetsWB]
  )

  useEffect(() => {
    if (tableData) previousBalances.current = tableData
  }, [tableData])

  const renderAssetsTable = useMemo(() => {
    return (
      <TableWrapper
        dataSource={assetsLoading && previousBalances.current ? previousBalances.current : tableData}
        loading={assetsLoading}
        rowKey={({ asset }) => asset.symbol}
        onRow={onRow}
        columns={columns}
      />
    )
  }, [tableData, assetsLoading, onRow, columns])

  return (
    <Row>
      <Col span={24}>{renderApiErrors}</Col>
      <Col span={24}>{renderAssetsTable}</Col>
    </Row>
  )
}

export default AssetsTable
