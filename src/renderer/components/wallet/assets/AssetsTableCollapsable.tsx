import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, baseToAsset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Col, Collapse, Grid, Row } from 'antd'
import { ScreenMap } from 'antd/lib/_util/responsiveObserve'
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

  const intl = useIntl()
  const screenMap: ScreenMap = Grid.useBreakpoint()

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
            <Styled.HeaderLabel>{chainIdToString(chainId)}</Styled.HeaderLabel>
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
          {renderAssetsWBState(assetsWB)}
        </Panel>
      )
    },
    [intl, renderAssetsWBState]
  )

  // open all panels by default
  const openPanelKeys = useMemo(() => assetsWBChains.map((_, i) => i.toString()), [assetsWBChains])

  return (
    <Styled.Collapse
      expandIcon={({ isActive }) => <Styled.ExpandIcon rotate={isActive ? 90 : 0} />}
      defaultActiveKey={openPanelKeys}
      expandIconPosition="right"
      ghost>
      {assetsWBChains.map(renderPanel)}
    </Styled.Collapse>
  )
}

export default AssetsTableCollapsable
