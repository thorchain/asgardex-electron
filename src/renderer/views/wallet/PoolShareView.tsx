import React, { useCallback, useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { PoolShares as PoolSharesTable } from '../../components/PoolShares'
import { PoolShareTableRowData } from '../../components/PoolShares/PoolShares.types'
import { ErrorView } from '../../components/shared/error'
import { Button } from '../../components/uielements/button'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { PoolSharesLD, PoolSharesRD } from '../../services/midgard/types'
import { getPoolShareTableData } from './PoolShareView.helper'

export const PoolShareView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, selectedPricePool$, selectedPricePoolAsset$, reloadPools },
    reloadNetworkInfo,
    shares: { combineShares$ }
  } = midgardService

  const thorchainContext = useThorchainContext()
  const oRuneAddress = useObservableState(thorchainContext.address$, O.none)
  const bitcoinContext = useBitcoinContext()
  const oBitcoinAddress = useObservableState(bitcoinContext.address$, O.none)
  const binanceContext = useBinanceContext()
  const oBinanceAddress = useObservableState(binanceContext.address$, O.none)
  /**
   * We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/shares.ts
   */
  const bitcoinStakeData$: PoolSharesLD = useMemo(
    () =>
      FP.pipe(
        oBitcoinAddress,
        O.fold(
          () => Rx.EMPTY,
          (address) => combineShares$(address)
        )
      ),
    [combineShares$, oBitcoinAddress]
  )
  const bitcoinStakeData = useObservableState<PoolSharesRD>(bitcoinStakeData$, RD.initial)

  const binanceStakeData$: PoolSharesLD = useMemo(
    () =>
      FP.pipe(
        oBinanceAddress,
        O.fold(
          () => Rx.EMPTY,
          (address) => combineShares$(address)
        )
      ),
    [combineShares$, oBinanceAddress]
  )
  const binanceStakeData = useObservableState<PoolSharesRD>(binanceStakeData$, RD.initial)

  const poolsRD = useObservableState(poolsState$, RD.pending)
  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)
  const priceAsset = FP.pipe(oPriceAsset, O.toUndefined)

  // store previous data of pools to render these while reloading
  const previousPoolShares = useRef<O.Option<PoolShareTableRowData[]>>(O.none)

  const goToStakeInfo = useCallback(() => {
    FP.pipe(
      oRuneAddress,
      O.map((address) => window.apiUrl.openExternal(`https://runestake.info/home?address=${address}`))
    )
  }, [oRuneAddress])

  const renderPoolSharesTable = useCallback(
    (data: PoolShareTableRowData[]) => {
      previousPoolShares.current = O.some(data)
      return <PoolSharesTable data={data} priceAsset={priceAsset} goToStakeInfo={goToStakeInfo} />
    },
    [goToStakeInfo, priceAsset]
  )

  const clickRefreshHandler = useCallback(() => {
    reloadPools()
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadPools])

  const renderRefreshBtn = useMemo(
    () => (
      <Button onClick={clickRefreshHandler} typevalue="outline">
        <SyncOutlined />
        {intl.formatMessage({ id: 'common.refresh' })}
      </Button>
    ),
    [clickRefreshHandler, intl]
  )

  const renderPoolShares = useMemo(
    () =>
      FP.pipe(
        RD.combine(bitcoinStakeData, binanceStakeData, poolsRD),
        RD.fold(
          // initial state
          () => renderPoolSharesTable([]),
          // loading state
          () => {
            const data = O.getOrElse(() => [] as PoolShareTableRowData[])(previousPoolShares.current)
            return renderPoolSharesTable(data)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} extra={renderRefreshBtn} />
          },
          // success state
          ([bitcoinStakes, binanceStakes, { poolDetails }]) => {
            const data = getPoolShareTableData([...bitcoinStakes, ...binanceStakes], poolDetails, pricePoolData)
            previousPoolShares.current = O.some(data)
            return renderPoolSharesTable(data)
          }
        )
      ),
    [bitcoinStakeData, binanceStakeData, poolsRD, renderPoolSharesTable, renderRefreshBtn, pricePoolData]
  )

  return renderPoolShares
}
