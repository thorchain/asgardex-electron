import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { EMPTY_ASSET, formatAssetAmountCurrency, baseToAsset, Asset, assetToString } from '@thorchain/asgardex-util'
import { Row, Col } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { RUNE_PRICE_POOL } from '../../const'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { getPoolPriceValue } from '../../services/binance/utils'
import { PoolDetails } from '../../services/midgard/types'
import { WalletBalancesRD, WalletBalances, WalletBalance } from '../../services/wallet/types'
import { PricePool } from '../../views/pools/types'
import ErrorView from '../shared/error/ErrorView'
import AssetIcon from '../uielements/assets/assetIcon'
import Label from '../uielements/label'
import { TableWrapper } from './AssetsTable.style'

type Props = {
  balancesRD: WalletBalancesRD
  pricePool?: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: O.Option<Asset>) => void
}

const AssetsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { balancesRD, pricePool = RUNE_PRICE_POOL, poolDetails, selectAssetHandler = (_) => {} } = props

  const intl = useIntl()

  // store previous data of balances to still render these while reloading new data
  const previousBalances = useRef<O.Option<WalletBalances>>(O.none)

  const iconColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      title: '',
      render: ({ asset: oAsset }: WalletBalance) => {
        const asset = FP.pipe(
          oAsset,
          O.getOrElse(() => EMPTY_ASSET)
        )
        return <AssetIcon asset={asset} size="normal" />
      }
    }),
    []
  )

  const renderNameColumn = ({ asset: oAsset }: WalletBalance) => {
    const name = FP.pipe(
      oAsset,
      O.map((a) => a.symbol),
      O.getOrElse(() => '--')
    )
    return <Label>{name}</Label>
  }

  const sortNameColumn = ({ asset: oAssetA }: WalletBalance, { asset: oAssetB }: WalletBalance) =>
    FP.pipe(
      sequenceTOption(oAssetA, oAssetB),
      O.map(([a, b]) => a.symbol.localeCompare(b.symbol)),
      O.getOrElse(() => 0)
    )

  const nameColumn: ColumnType<WalletBalance> = useMemo(
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

  const renderTickerColumn = ({ asset: oAsset }: WalletBalance) => {
    const ticker = FP.pipe(
      oAsset,
      O.map((a) => a.ticker),
      // "empty" label if we don't get a ticker
      O.getOrElse(() => '--')
    )
    return <Label nowrap>{ticker}</Label>
  }

  const sortTickerColumn = ({ asset: oAssetA }: WalletBalance, { asset: oAssetB }: WalletBalance) =>
    FP.pipe(
      sequenceTOption(oAssetA, oAssetB),
      O.map(([a, b]) => a.ticker.localeCompare(b.ticker)),
      O.getOrElse(() => 0)
    )

  const tickerColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.ticker' }),
      align: 'left',
      render: renderTickerColumn,
      sorter: sortTickerColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const renderBalanceColumn = ({ asset: oAsset, amount }: WalletBalance) => {
    const balance = FP.pipe(
      oAsset,
      O.map(assetToString),
      O.map((assetString) => formatAssetAmountCurrency(baseToAsset(amount), assetString, 3)),
      O.toUndefined
    )
    return <Label nowrap>{balance}</Label>
  }

  const balanceColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.balance' }),
      align: 'left',
      render: renderBalanceColumn,
      sorter: (a: WalletBalance, b: WalletBalance) => a.amount.amount().comparedTo(b.amount.amount()),
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const renderPriceColumn = useCallback(
    (balance: WalletBalance) => {
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

  const priceColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      title: intl.formatMessage({ id: 'wallet.column.value' }),
      align: 'left',
      render: renderPriceColumn,
      sorter: (a: WalletBalance, b: WalletBalance) => {
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
    ({ asset }: WalletBalance) => {
      return {
        onClick: () => selectAssetHandler(asset)
      }
    },
    [selectAssetHandler]
  )
  const renderAssetsTable = useCallback(
    (balances: WalletBalances, loading = false) => {
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
            const pools = O.getOrElse(() => [] as WalletBalances)(previousBalances.current)
            return renderAssetsTable(pools, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} />
          },
          // success state
          (balances: WalletBalances): JSX.Element => {
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
