import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balances, Balance } from '@thorchain/asgardex-binance'
import {
  EMPTY_ASSET,
  assetAmount,
  bnOrZero,
  formatAssetAmountCurrency,
  baseToAsset,
  assetFromString,
  Asset,
  assetToString
} from '@thorchain/asgardex-util'
import { Row, Col } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { RUNE_PRICE_POOL } from '../../const'
import * as walletRoutes from '../../routes/wallet'
import { BalancesRD } from '../../services/binance/types'
import { bncSymbolToAsset, bncSymbolToAssetString, getPoolPriceValue } from '../../services/binance/utils'
import { PoolDetails } from '../../services/midgard/types'
import { PricePool } from '../../views/pools/types'
import ErrorView from '../shared/error/ErrorView'
import AssetIcon from '../uielements/assets/assetIcon'
import Label from '../uielements/label'
import { TableWrapper } from './AssetsTable.style'

type Props = {
  balancesRD: BalancesRD
  pricePool?: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: O.Option<Asset>) => void
}

const AssetsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { balancesRD, pricePool = RUNE_PRICE_POOL, poolDetails, selectAssetHandler = (_) => {} } = props

  const history = useHistory()
  const intl = useIntl()

  // store previous data of balances to still render these while reloading new data
  const previousBalances = useRef<O.Option<Balances>>(O.none)

  const iconColumn: ColumnType<Balance> = useMemo(
    () => ({
      key: 'symbol',
      title: '',
      render: ({ symbol }: Balance) => {
        const asset = assetFromString(`BNB.${symbol}`) || EMPTY_ASSET
        return <AssetIcon asset={asset} size="normal" />
      }
    }),
    []
  )

  const nameColumn: ColumnType<Balance> = useMemo(
    () => ({
      key: 'symbol',
      title: intl.formatMessage({ id: 'wallet.column.name' }),
      align: 'left',
      render: ({ symbol }: Balance) => <Label>{symbol}</Label>,
      sorter: (a: Balance, b: Balance) => a.symbol.localeCompare(b.symbol),
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'ascend'
    }),
    [intl]
  )

  const tickerColumn: ColumnType<Balance> = useMemo(
    () => ({
      key: 'symbol',
      title: intl.formatMessage({ id: 'wallet.column.ticker' }),
      align: 'left',
      render: ({ symbol }: Balance) => <Label>{O.toNullable(bncSymbolToAsset(symbol))?.ticker ?? ''}</Label>,
      sorter: (a: Balance, b: Balance) => {
        const tickerA = O.toNullable(bncSymbolToAsset(a.symbol))?.ticker ?? ''
        const tickerB = O.toNullable(bncSymbolToAsset(b.symbol))?.ticker ?? ''
        return tickerA.localeCompare(tickerB)
      },
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const balanceColumn: ColumnType<Balance> = useMemo(
    () => ({
      key: 'free',
      title: intl.formatMessage({ id: 'wallet.column.balance' }),
      align: 'left',
      render: ({ free, symbol }: Balance) => {
        const amount = assetAmount(bnOrZero(free))
        const asset = bncSymbolToAssetString(symbol)
        const label = formatAssetAmountCurrency(amount, asset, 3)
        return <Label>{label}</Label>
      },
      sorter: (a: Balance, b: Balance) => bnOrZero(a.free).comparedTo(bnOrZero(b.free)),
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const priceColumn: ColumnType<Balance> = useMemo(
    () => ({
      key: 'free',
      title: intl.formatMessage({ id: 'wallet.column.value' }),
      align: 'left',
      render: (balance: Balance) => {
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
        const oPriceA = getPoolPriceValue(a, poolDetails, pricePool.poolData)
        const oPriceB = getPoolPriceValue(b, poolDetails, pricePool.poolData)
        return FP.pipe(
          sequenceT(O.option)(oPriceA, oPriceB),
          O.fold(
            () => 0,
            ([priceA, priceB]) => priceA.amount().comparedTo(priceB.amount())
          )
        )
      },
      sortDirections: ['descend', 'ascend']
    }),
    [poolDetails, pricePool, intl]
  )

  const columns = [iconColumn, nameColumn, tickerColumn, balanceColumn, priceColumn]

  const onRow = useCallback(
    ({ symbol }: Balance) => {
      return {
        onClick: () => {
          const oAsset = bncSymbolToAsset(symbol)
          selectAssetHandler(oAsset)
          FP.pipe(
            oAsset,
            O.map((asset) => history.push(walletRoutes.assetDetail.path({ asset: assetToString(asset) })))
          )
        }
      }
    },
    [history, selectAssetHandler]
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
            previousBalances.current = O.some(balances)
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
