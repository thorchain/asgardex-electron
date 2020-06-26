import React, { useMemo, useCallback, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Balances, Balance } from '@thorchain/asgardex-binance'
import { getAssetFromString, assetAmount, bnOrZero, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Row, Col, Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { Option, some, none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import ErrorView from '../../components/shared/error/ErrorView'
import DynamicCoin from '../../components/shared/icons/DynamicCoin'
import Button from '../../components/uielements/button'
import Label from '../../components/uielements/label'
import { useBinanceContext } from '../../contexts/BinanceContext'
import * as walletRoutes from '../../routes/wallet'

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const history = useHistory()

  const { balancesState$, reloadBalances } = useBinanceContext()
  const balancesRD = useObservableState(balancesState$, RD.initial)

  // store previous data of balances to still render these while reloading new data
  const previousBalances = useRef<Option<Balances>>(none)

  const clickReloadHandler = () => {
    reloadBalances()
  }

  const iconColumn: ColumnType<Balance> = {
    key: 'icon',
    // TODO(@Veado): i18n
    title: 'icon',
    dataIndex: 'symbol',
    render: (_, { symbol }) => <DynamicCoin type={symbol} size={'normal'} />
  }

  const nameColumn: ColumnType<Balance> = {
    // TODO(@Veado): i18n
    title: 'Name',
    dataIndex: 'symbol',
    render: (_, { symbol }) => <Label>{symbol}</Label>
  }

  const tickerColumn: ColumnType<Balance> = {
    // TODO(@Veado): i18n
    title: 'Ticker',
    dataIndex: 'symbol',
    render: (_, { symbol }) => <Label>{getAssetFromString(`.${symbol}`)?.ticker ?? ''}</Label>
  }

  const balanceColumn: ColumnType<Balance> = {
    // TODO(@Veado): i18n
    title: 'Balance',
    dataIndex: 'free',
    render: (_, { free }) => {
      const amount = assetAmount(bnOrZero(free))
      // TODO (@Veado) Get currency from symbol
      const label = formatAssetAmountCurrency(amount, '', 3)
      return <Label>{label}</Label>
    }
  }

  const priceColumn: ColumnType<Balance> = {
    // TODO(@Veado): i18n
    title: 'Asset Price',
    dataIndex: 'free',
    render: () => <Label>TODO</Label>
  }

  const columns = [iconColumn, nameColumn, tickerColumn, balanceColumn, priceColumn]

  const renderAssetsTable = useCallback(
    (balances: Balances, loading = false) => {
      return (
        <Table
          dataSource={balances}
          loading={loading}
          rowKey={({ symbol }) => symbol}
          onRow={(record) => {
            return {
              onClick: () => {
                history.push(walletRoutes.assetDetails.path({ symbol: record.symbol }))
              }
            }
          }}
          columns={columns}
        />
      )
    },
    [columns, history]
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
    <>
      <Button onClick={clickReloadHandler} typevalue="outline">
        <SyncOutlined />
        Reload
      </Button>
      <Row>
        <Col span={24}>{renderAssets}</Col>
      </Row>
    </>
  )
}

export default UserAssetsScreen
