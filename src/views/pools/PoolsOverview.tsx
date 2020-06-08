import React, { useCallback, useMemo } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { bn } from '@thorchain/asgardex-util'
import { Grid, Row } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import { palette } from 'styled-theme'

import ErrorView from '../../components/shared/error/ErrorView'
import Button from '../../components/uielements/button'
import Coin from '../../components/uielements/coins/coin'
import Table from '../../components/uielements/table'
import Trend from '../../components/uielements/trend'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThemeContext } from '../../contexts/ThemeContext'
import { getPoolViewData } from '../../helpers/poolHelper'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { PoolsState } from '../../services/midgard/types'
import View from '../View'
import { ActionColumn, TableAction } from './PoolsOverview.style'
import { PoolRowType } from './types'

type Props = {}

const PoolsOverview: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { service: midgardService } = useMidgardContext()
  const pools = useObservableState(midgardService.poolState$, RD.pending)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const textColor = useMemo(() => palette('text', 0)({ theme }), [theme])

  const clickSwapHandler = (p: SwapRouteParams) => {
    history.push(swapRoutes.swap.path(p))
  }

  const clickStakeHandler = (asset: string) => {
    history.push(stakeRoutes.stake.path({ asset }))
  }

  const btnCol = {
    key: 'refresh',
    title: (
      <ActionColumn>
        <Button onClick={() => {}} typevalue="outline">
          <SyncOutlined />
          refresh
        </Button>
      </ActionColumn>
    ),
    render: (_: string, record: PoolRowType) => {
      const {
        pool: { asset, target }
      } = record

      return (
        <TableAction>
          <Button round="true" onClick={() => clickStakeHandler(target)} typevalue="outline">
            <PlusOutlined />
            liquidity
          </Button>
          <Button round="true" onClick={() => clickSwapHandler({ source: asset, target: target })}>
            <SwapOutlined />
            swap
          </Button>
        </TableAction>
      )
    }
  }

  const mobileColumns: ColumnsType<PoolRowType> = [
    {
      key: 'pool',
      title: 'pool',
      dataIndex: 'pool',
      render: ({ target }: { asset: string; target: string }) => (
        <Row justify="center" align="middle">
          <Coin type="rune" over={target} />
        </Row>
      )
    },
    btnCol
  ]

  const desktopColumns: ColumnsType<PoolRowType> = [
    {
      key: 'pool',
      title: 'pool',
      dataIndex: 'pool',
      render: ({ target }: { asset: string; target: string }) => <Coin type="rune" over={target} />
    },
    {
      key: 'asset',
      title: 'asset',
      dataIndex: 'pool',
      render: ({ target }: { target: string }) => <p>{target}</p>,
      sorter: (a: PoolRowType, b: PoolRowType) => a.pool.target.localeCompare(b.pool.target),
      sortDirections: ['descend', 'ascend']
    },
    {
      key: 'poolprice',
      title: 'pool price',
      dataIndex: 'poolPrice',
      sorter: (a: PoolRowType, b: PoolRowType) => a.raw.poolPrice.minus(b.raw.poolPrice).toNumber(),
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend'
    },
    {
      key: 'depth',
      title: 'depth',
      dataIndex: 'depth',
      sorter: (a: PoolRowType, b: PoolRowType) => a.raw.depth.minus(b.raw.depth).toNumber(),
      sortDirections: ['descend', 'ascend']
    },
    {
      key: 'vol',
      title: '24h vol',
      dataIndex: 'volume',
      sorter: (a: PoolRowType, b: PoolRowType) => a.raw.volume.minus(b.raw.volume).toNumber(),
      sortDirections: ['descend', 'ascend']
    },
    {
      key: 'transaction',
      title: 'avg. transaction',
      dataIndex: 'transaction',
      sorter: (a: PoolRowType, b: PoolRowType) => a.raw.transaction.minus(b.raw.transaction).toNumber(),
      sortDirections: ['descend', 'ascend']
    },
    {
      key: 'slip',
      title: 'avg. slip',
      dataIndex: 'slip',
      render: (slip: string) => <Trend amount={bn(slip)} />,
      sorter: (a: PoolRowType, b: PoolRowType) => a.raw.slip.minus(b.raw.slip).toNumber(),
      sortDirections: ['descend', 'ascend']
    },
    {
      key: 'trade',
      title: 'no. of trades',
      dataIndex: 'trade',
      sorter: (a: PoolRowType, b: PoolRowType) => a.raw.trade.minus(b.raw.trade).toNumber(),
      sortDirections: ['descend', 'ascend']
    },
    btnCol
  ]

  const renderTable = useCallback(
    (tableData: PoolRowType[], loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns
      return <Table columns={columns} dataSource={tableData} loading={loading} rowKey="key" />
    },
    [isDesktopView, desktopColumns, mobileColumns]
  )

  const renderPools = useMemo(
    () => (
      <>
        {RD.fold(
          // initial state
          () => renderTable([], true),
          // loading state
          () => renderTable([], true),
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          // success state
          (pools: PoolsState): JSX.Element => {
            const poolViewData = getPoolViewData(pools)
            return renderTable(poolViewData)
          }
        )(pools)}
      </>
    ),
    [pools, renderTable]
  )

  return (
    <View>
      <h1 style={{ color: textColor }}>AVAILABLE POOLS</h1>
      {renderPools}
    </View>
  )
}

export default PoolsOverview
