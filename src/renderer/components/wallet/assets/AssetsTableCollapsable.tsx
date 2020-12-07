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
import { WalletBalancesRD } from '../../../services/clients'
import { PoolDetails } from '../../../services/midgard/types'
import { ChainBalances, ApiError, ChainBalance } from '../../../services/wallet/types'
import { PricePool } from '../../../views/pools/Pools.types'
import { ErrorView } from '../../shared/error/'
import { AssetIcon } from '../../uielements/assets/assetIcon'
import { Label } from '../../uielements/label'
import * as Styled from './AssetsTableCollapsable.style'

const { Panel } = Collapse

type Props = {
  chainBalances: ChainBalances
  pricePool: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: Asset, walletAddress: string) => void
}

export const AssetsTableCollapsable: React.FC<Props> = (props): JSX.Element => {
  const { chainBalances = [], pricePool, poolDetails, selectAssetHandler = (_) => {} } = props

  const intl = useIntl()
  const screenMap: ScreenMap = Grid.useBreakpoint()

  // State to store open panel keys
  const [openPanelKeys, setOpenPanelKeys] = useState<string[]>()
  // State track that user has changed collpase state
  const [collapseChangedByUser, setCollapseChangedByUser] = useState(false)

  // store previous data of asset data to render these while reloading
  const previousAssetsTableData = useRef<Balances[]>([])

  const onRow = useCallback(
    (walletAddress: string) => ({ asset }: Balance) => {
      return {
        onClick: () => selectAssetHandler(asset, walletAddress)
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
    (balance: Balance) => {
      const oPrice = getPoolPriceValue(balance, poolDetails, pricePool.poolData)
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
    (tableData: Balances, walletAddress: string, loading = false) => {
      return (
        <Styled.Table
          showHeader={false}
          dataSource={tableData}
          loading={loading}
          rowKey={({ asset }) => asset.symbol}
          onRow={onRow(walletAddress)}
          columns={columns}
        />
      )
    },
    [onRow, columns]
  )

  const renderBalances = useCallback(
    (balancesRD: WalletBalancesRD, index: number, walletAddress: string) =>
      FP.pipe(
        balancesRD,
        RD.fold(
          // initial state
          () => renderAssetsTable([], walletAddress),
          // loading state
          () => {
            const data = previousAssetsTableData.current[index] ?? []
            return renderAssetsTable(data, walletAddress, true)
          },
          // error state
          ({ msg }: ApiError) => {
            return <ErrorView title={msg} />
          },
          // success state
          (assetsWB) => {
            const prev = previousAssetsTableData.current
            prev[index] = assetsWB
            return renderAssetsTable(assetsWB, walletAddress)
          }
        )
      ),
    [renderAssetsTable]
  )

  // Panel
  const renderPanel = useCallback(
    ({ chain, address, balances: balancesRD }: ChainBalance, key: number) => {
      /**
       * We need to push initial value to the ledger-based streams
       * 'cuz chainBalances$ stream is created by 'combineLatest'
       * which will not emit anything if some of stream has
       * not emitted at least once
       * @see btcLedgerChainBalance$'s getOrElse branch at src/renderer/services/wallet/balances.ts
       */
      if (!address && RD.isInitial(balancesRD)) {
        return null
      }
      const assetsTxt = FP.pipe(
        balancesRD,
        RD.fold(
          () => '',
          () => intl.formatMessage({ id: 'common.loading' }),
          (_: ApiError) => intl.formatMessage({ id: 'common.error' }),
          (balances) => {
            const length = balances.length
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
            <Styled.HeaderLabel
              color={RD.isFailure(balancesRD) ? 'error' : 'gray'}>{`${assetsTxt}`}</Styled.HeaderLabel>
          </Col>
        </Styled.HeaderRow>
      )
      return (
        <Panel header={header} key={key}>
          {renderBalances(balancesRD, key, address)}
        </Panel>
      )
    },
    [intl, renderBalances]
  )

  // open all panels by default
  useEffect(() => {
    // don't change openPanelKeys if user has already changed panel state
    if (!collapseChangedByUser) {
      const keys = chainBalances.map((_, i) => i.toString())
      setOpenPanelKeys(keys)
    }
  }, [chainBalances, collapseChangedByUser])

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
      {chainBalances.map(renderPanel)}
    </Styled.Collapse>
  )
}
