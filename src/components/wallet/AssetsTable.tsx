import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balances, Balance } from '@thorchain/asgardex-binance'
import {
  assetAmount,
  bnOrZero,
  formatAssetAmountCurrency,
  baseToAsset,
  getAssetFromString
} from '@thorchain/asgardex-util'
import { Row, Col } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import { Option, some, none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import ErrorView from '../../components/shared/error/ErrorView'
import Label from '../../components/uielements/label'
import { RUNE_PRICE_POOL } from '../../const'
import * as walletRoutes from '../../routes/wallet'
import { BalancesRD } from '../../services/binance/types'
import { bncSymbolToAsset, bncSymbolToAssetString, getPoolPriceValue } from '../../services/binance/utils'
import { PoolDetails } from '../../services/midgard/types'
import { PricePool } from '../../views/pools/types'
import AssetIcon from '../uielements/assets/assetIcon'
import { TableWrapper } from './AssetsTable.style'

type Props = {
  balances: BalancesRD
  pricePool?: PricePool
  poolDetails: PoolDetails
}

const AssetsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { balances: balancesRD, pricePool = RUNE_PRICE_POOL, poolDetails } = props

  const history = useHistory()
  const intl = useIntl()

  // store previous data of balances to still render these while reloading new data
  const previousBalances = useRef<Option<Balances>>(none)

  const iconColumn: ColumnType<Balance> = useMemo(
    () => ({
      key: 'icon',
      title: '',
      dataIndex: 'symbol',
      render: (_, { symbol }) => <AssetIcon asset={getAssetFromString(`BNB.${symbol}`)} size="normal" />
    }),
    []
  )

  const nameColumn: ColumnType<Balance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.name' }),
      align: 'left',
      dataIndex: 'symbol',
      render: (_, { symbol }) => <Label>{symbol}</Label>
    }),
    [intl]
  )

  const tickerColumn: ColumnType<Balance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.ticker' }),
      align: 'left',
      dataIndex: 'symbol',
      render: (_, { symbol }) => <Label>{bncSymbolToAsset(symbol)?.ticker ?? ''}</Label>
    }),
    [intl]
  )

  const balanceColumn: ColumnType<Balance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.balance' }),
      align: 'left',
      dataIndex: 'free',
      render: (_, { free, symbol }) => {
        const amount = assetAmount(bnOrZero(free))
        const asset = bncSymbolToAssetString(symbol)
        const label = formatAssetAmountCurrency(amount, asset, 3)
        return <Label>{label}</Label>
      }
    }),
    [intl]
  )

  const priceColumn: ColumnType<Balance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.value' }),
      align: 'left',
      dataIndex: 'free',
      render: (_, balance) => {
        const oPrice = getPoolPriceValue(balance, poolDetails, pricePool.poolData)
        const label = FP.pipe(
          oPrice,
          O.map((price) => formatAssetAmountCurrency(baseToAsset(price), pricePool.asset, 3)),
          // "empty" label if we don't get a price value
          O.getOrElse(() => '--')
        )
        return <Label>{label}</Label>
      },
      sorter: (a: Balance, b: Balance) => {
        const aAmount = bnOrZero(a.free)
        const bAmount = bnOrZero(b.free)
        return aAmount.minus(bAmount).toNumber()
      },
      sortDirections: ['descend', 'ascend']
    }),
    [poolDetails, pricePool, intl]
  )

  const columns = [iconColumn, nameColumn, tickerColumn, balanceColumn, priceColumn]

  const onRow = useCallback(
    (record: Balance) => {
      return {
        onClick: () => {
          history.push(walletRoutes.assetDetails.path({ symbol: record.symbol }))
        }
      }
    },
    [history]
  )
  const renderAssetsTable = useCallback(
    (balances: Balances, loading = false) => {
      return (
        <TableWrapper
          dataSource={balances}
          loading={loading}
          rowKey={({ symbol }: Balance) => symbol}
          onRow={onRow}
          columns={columns}
        />
      )
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
            const pools = O.getOrElse(() => [] as Balances)(previousBalances.current)
            return renderAssetsTable(pools, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          // success state
          (balances: Balances): JSX.Element => {
            previousBalances.current = some(balances)
            return renderAssetsTable(balances)
          }
        )(balancesRD)}
      </>
    ),
    [balancesRD, renderAssetsTable]
  )

  return (
    <Row>
      <Col span={24}>{renderAssets}</Col>
    </Row>
  )
}

export default AssetsTable
