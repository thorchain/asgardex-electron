import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, baseToAsset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Col, Collapse, Row } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { RUNE_PRICE_POOL } from '../../../const'
import { getPoolPriceValue } from '../../../services/binance/utils'
import { PoolDetails } from '../../../services/midgard/types'
import { chainIdToString } from '../../../services/utils'
import {
  AssetWithBalance,
  AssetsWBChains,
  AssetsWithBalanceRD,
  AssetsWithBalance,
  ApiError,
  AssetsWBChain
} from '../../../services/wallet/types'
import { PricePool } from '../../../views/pools/types'
import ErrorView from '../../shared/error/ErrorView'
import AssetIcon from '../../uielements/assets/assetIcon'
import Label from '../../uielements/label'
import * as Styled from './AssetsTableCollapsable.style'

const { Panel } = Collapse

type Props = {
  assetsWBChains: AssetsWBChains
  pricePool?: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: Asset) => void
}

const AssetsTableCollapsable: React.FC<Props> = (props: Props): JSX.Element => {
  const { assetsWBChains = [], pricePool = RUNE_PRICE_POOL, poolDetails, selectAssetHandler = (_) => {} } = props

  const _intl = useIntl()

  const onRow = useCallback(
    ({ asset }: AssetWithBalance) => {
      return {
        onClick: () => selectAssetHandler(asset)
      }
    },
    [selectAssetHandler]
  )

  const hideAssetHandler = useCallback((asset: Asset) => {
    console.log('hideAssetHandler', assetToString(asset))
  }, [])

  const iconColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: '',
      width: 120,
      render: ({ asset }: AssetWithBalance) => (
        <Row justify="center" align="middle">
          <AssetIcon asset={asset} size="normal" />
        </Row>
      )
    }),
    []
  )

  const nameColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      width: 140,
      render: ({ asset }: AssetWithBalance) => <Label>{asset.symbol}</Label>
    }),
    []
  )

  const tickerColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      width: 80,
      render: ({ asset }: AssetWithBalance) => <Label nowrap>{asset.ticker}</Label>
    }),
    []
  )

  const renderBalanceColumn = ({ asset, amount }: AssetWithBalance) => {
    const assetString = assetToString(asset)
    const balance = formatAssetAmountCurrency(baseToAsset(amount), assetString, 3)
    return (
      <Label nowrap align="right">
        {balance}
      </Label>
    )
  }

  const balanceColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      render: renderBalanceColumn
    }),
    []
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
      return (
        <Label nowrap align="right">
          {label}
        </Label>
      )
    },
    [poolDetails, pricePool.asset, pricePool.poolData]
  )

  const priceColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      width: 300,
      render: renderPriceColumn
    }),
    [renderPriceColumn]
  )

  const hideColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      width: 20,
      render: ({ asset }: AssetWithBalance) => (
        <Row
          justify="center"
          align="middle"
          onClick={(event) => {
            event.preventDefault()
            hideAssetHandler(asset)
          }}>
          <Styled.HideIcon />
        </Row>
      )
    }),
    [hideAssetHandler]
  )

  const columns = [iconColumn, nameColumn, tickerColumn, balanceColumn, priceColumn, hideColumn]

  const renderAssetsTable = useCallback(
    (tableData: AssetsWithBalance, loading = false) => {
      return (
        <Styled.TableWrapper
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
    (assetsWB: AssetsWithBalanceRD) =>
      FP.pipe(
        assetsWB,
        RD.fold(
          // initial state
          () => renderAssetsTable([]),
          // loading state
          () => renderAssetsTable([], true),
          // error state
          ({ msg }: ApiError) => {
            return <ErrorView title={msg} />
          },
          // success state
          (assetsWB) => renderAssetsTable(assetsWB)
        )
      ),
    [renderAssetsTable]
  )

  // Panel
  const renderPanel = useCallback(
    ({ chainId, address, assetsWB }: AssetsWBChain, key: number) => {
      const assetsTxt = FP.pipe(
        assetsWB,
        RD.fold(
          () => '',
          () => 'loading',
          (_: ApiError) => 'error',
          (assetsWB) => `${assetsWB.length} assets`
        )
      )
      const header = (
        <Styled.HeaderRow>
          <Col xs={6} md={4}>
            <Styled.HeaderLabel>{chainIdToString(chainId)}</Styled.HeaderLabel>
          </Col>
          <Col xs={18} md={8}>
            <Styled.HeaderAddress>{address}</Styled.HeaderAddress>
          </Col>
          <Col xs={0} md={12}>
            <Styled.HeaderLabel>{`(${assetsTxt})`}</Styled.HeaderLabel>
          </Col>
        </Styled.HeaderRow>
      )
      return (
        <Panel header={header} key={key}>
          {renderAssetsWBState(assetsWB)}
        </Panel>
      )
    },
    [renderAssetsWBState]
  )

  // open all panels
  const collapseActiveKeys = useMemo(() => assetsWBChains.map((_, i) => i.toString()), [assetsWBChains])

  return (
    <Styled.Collapse
      expandIcon={({ isActive }) => <Styled.ExpandIcon rotate={isActive ? 90 : 0} />}
      defaultActiveKey={collapseActiveKeys}
      expandIconPosition="right"
      ghost>
      {assetsWBChains.map(renderPanel)}
    </Styled.Collapse>
  )
}

export default AssetsTableCollapsable
