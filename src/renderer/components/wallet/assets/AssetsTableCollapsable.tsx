import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset, baseToAsset, chainToString, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Col, Collapse, Grid, Row } from 'antd'
import { ScreenMap } from 'antd/lib/_util/responsiveObserve'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { getPoolPriceValue } from '../../../services/binance/utils'
import { PoolDetails } from '../../../services/midgard/types'
import { AssetsWBChains, BalancesRD, ApiError, ChainBalance } from '../../../services/wallet/types'
import { PricePool } from '../../../views/pools/Pools.types'
import { ErrorView } from '../../shared/error/'
import { AssetIcon } from '../../uielements/assets/assetIcon'
import { Label } from '../../uielements/label'
import * as Styled from './AssetsTableCollapsable.style'

const { Panel } = Collapse

type Props = {
  assetsWBChains: AssetsWBChains
  pricePool: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: Asset) => void
}

export const AssetsTableCollapsable: React.FC<Props> = (props): JSX.Element => {
  const { assetsWBChains = [], pricePool, poolDetails, selectAssetHandler = (_) => {} } = props

  const intl = useIntl()
  const screenMap: ScreenMap = Grid.useBreakpoint()

  // State to store open panel keys
  const [openPanelKeys, setOpenPanelKeys] = useState<string[]>()
  // State track that user has changed collpase state
  const [collapseChangedByUser, setCollapseChangedByUser] = useState(false)

  // store previous data of asset data to render these while reloading
  const previousAssetsTableData = useRef<Balances[]>([])

  const onRow = useCallback(
    ({ asset }: Balance) => {
      return {
        onClick: () => selectAssetHandler(asset)
      }
    },
    [selectAssetHandler]
  )

  const hideAssetHandler = useCallback((_asset: Asset) => {
    // TODO (@Veado) Add logic as part of
    // https://github.com/thorchain/asgardex-electron/issues/476
  }, [])

  const iconColumn: ColumnType<Balance> = useMemo(
    () => ({
      title: '',
      width: 120,
      render: ({ asset }: Balance) => (
        <Row justify="center" align="middle">
          <AssetIcon asset={asset} size="normal" />
        </Row>
      )
    }),
    []
  )

  const nameColumn: ColumnType<Balance> = useMemo(
    () => ({
      width: 140,
      render: ({ asset }: Balance) => <Label>{asset.symbol}</Label>
    }),
    []
  )

  const tickerColumn: ColumnType<Balance> = useMemo(
    () => ({
      width: 80,
      render: ({ asset }: Balance) => <Label nowrap>{asset.ticker}</Label>
    }),
    []
  )

  const renderBalanceColumn = ({ asset, amount }: Balance) => {
    const balance = formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: 3 })
    return (
      <Label nowrap align="right">
        {balance}
      </Label>
    )
  }

  const balanceColumn: ColumnType<Balance> = useMemo(
    () => ({
      render: renderBalanceColumn
    }),
    []
  )

  const renderPriceColumn = useCallback(
    (assetWB: Balance) => {
      const oPrice = getPoolPriceValue(assetWB, poolDetails, pricePool.poolData)
      const label = FP.pipe(
        oPrice,
        O.map((price) => formatAssetAmountCurrency({ amount: baseToAsset(price), asset: pricePool.asset, decimal: 3 })),
        // "empty" label if we don't get a price value
        O.getOrElse(() => '--')
      )
      return (
        <Label nowrap align="right">
          {label}
        </Label>
      )
    },
    [poolDetails, pricePool.asset, pricePool.poolData]
  )

  const priceColumn: ColumnType<Balance> = useMemo(
    () => ({
      width: 300,
      render: renderPriceColumn
    }),
    [renderPriceColumn]
  )

  const hideColumn: ColumnType<Balance> = useMemo(
    () => ({
      width: 20,
      render: ({ asset }: Balance) => (
        <Row
          justify="center"
          align="middle"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            hideAssetHandler(asset)
          }}>
          <Styled.HideIcon />
        </Row>
      )
    }),
    [hideAssetHandler]
  )

  const columns = useMemo(() => {
    // desktop
    if (screenMap?.lg) {
      return [iconColumn, nameColumn, tickerColumn, balanceColumn, priceColumn, hideColumn]
    }
    // tablet
    if (screenMap?.md) {
      return [iconColumn, tickerColumn, balanceColumn, hideColumn]
    }
    // mobile
    if (screenMap?.xs) {
      return [iconColumn, balanceColumn, hideColumn]
    }

    return []
  }, [balanceColumn, hideColumn, iconColumn, nameColumn, priceColumn, screenMap, tickerColumn])

  const renderAssetsTable = useCallback(
    (tableData: Balances, loading = false) => {
      return (
        <Styled.Table
          showHeader={false}
          dataSource={tableData}
          loading={loading}
          rowKey={({ asset }) => asset.symbol}
          onRow={onRow}
          columns={columns}
        />
      )
    },
    [onRow, columns]
  )

  const renderAssetsWBState = useCallback(
    (balancesRD: BalancesRD, index: number) =>
      FP.pipe(
        balancesRD,
        RD.fold(
          // initial state
          () => renderAssetsTable([]),
          // loading state
          () => {
            const data = previousAssetsTableData.current[index] ?? []
            return renderAssetsTable(data, true)
          },
          // error state
          ({ msg }: ApiError) => {
            return <ErrorView title={msg} />
          },
          // success state
          (assetsWB) => {
            const prev = previousAssetsTableData.current
            prev[index] = assetsWB
            return renderAssetsTable(assetsWB)
          }
        )
      ),
    [renderAssetsTable]
  )

  // Panel
  const renderPanel = useCallback(
    ({ chain, address, balances: assetsWB }: ChainBalance, key: number) => {
      const assetsTxt = FP.pipe(
        assetsWB,
        RD.fold(
          () => '',
          () => intl.formatMessage({ id: 'common.loading' }),
          (_: ApiError) => intl.formatMessage({ id: 'common.error' }),
          (assetsWB) => {
            const length = assetsWB.length
            const i18nKey = length === 1 ? 'common.asset' : 'common.assets'
            return `(${length} ${intl.formatMessage({ id: i18nKey })})`
          }
        )
      )
      const header = (
        <Styled.HeaderRow>
          <Col xs={14} md={6} lg={4}>
            <Styled.HeaderLabel>{chainToString(chain)}</Styled.HeaderLabel>
          </Col>
          <Col xs={0} md={12} lg={10}>
            <Styled.HeaderAddress>{address}</Styled.HeaderAddress>
          </Col>
          <Col xs={10} md={6} lg={10}>
            <Styled.HeaderLabel color={RD.isFailure(assetsWB) ? 'error' : 'gray'}>{`${assetsTxt}`}</Styled.HeaderLabel>
          </Col>
        </Styled.HeaderRow>
      )
      return (
        <Panel header={header} key={key}>
          {renderAssetsWBState(assetsWB, key)}
        </Panel>
      )
    },
    [intl, renderAssetsWBState]
  )

  // open all panels by default
  useEffect(() => {
    // don't change openPanelKeys if user has already changed panel state
    if (!collapseChangedByUser) {
      const keys = assetsWBChains.map((_, i) => i.toString())
      setOpenPanelKeys(keys)
    }
  }, [assetsWBChains, collapseChangedByUser])

  const onChangeCollpaseHandler = useCallback((key: string | string[]) => {
    if (Array.isArray(key)) {
      setOpenPanelKeys(key)
    } else {
      setOpenPanelKeys([key])
    }
    // user has changed collpase state
    setCollapseChangedByUser(true)
  }, [])

  return (
    <Styled.Collapse
      expandIcon={({ isActive }) => <Styled.ExpandIcon rotate={isActive ? 90 : 0} />}
      defaultActiveKey={openPanelKeys}
      activeKey={openPanelKeys}
      expandIconPosition="right"
      onChange={onChangeCollpaseHandler}
      ghost>
      {assetsWBChains.map(renderPanel)}
    </Styled.Collapse>
  )
}
