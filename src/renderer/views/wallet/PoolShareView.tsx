import React, { useCallback, useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { PoolShares as PoolSharesTable } from '../../components/PoolShares'
import { PoolShareTableRowData } from '../../components/PoolShares/PoolShares.types'
import { ErrorView } from '../../components/shared/error'
import { Button } from '../../components/uielements/button'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { isThorChain } from '../../helpers/chainHelper'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { DEFAULT_NETWORK, ENABLED_CHAINS } from '../../services/const'
import { PoolSharesRD } from '../../services/midgard/types'
import { getPoolShareTableData } from './PoolShareView.helper'

export const PoolShareView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, selectedPricePool$, selectedPricePoolAsset$, reloadPools },
    reloadNetworkInfo,
    shares: { combineSharesByAddresses$ }
  } = midgardService

  const thorchainContext = useThorchainContext()
  const oRuneAddress = useObservableState(thorchainContext.address$, O.none)
  const { addressByChain$ } = useChainContext()

  const [poolSharesRD]: [PoolSharesRD, unknown] = useObservableState(
    () =>
      FP.pipe(
        ENABLED_CHAINS,
        A.filter(FP.not(isThorChain)),
        A.map(addressByChain$),
        (addresses) => Rx.combineLatest(addresses),
        RxOp.switchMap(
          FP.flow(
            /**
             *
             * At previous step we have Array<O.Option<Address>>.
             * During the development not every chain address is O.some('stringAddress') but there
             * might be O.none which so we can not use sequencing here as whole sequence might fail
             * which is unacceptable. With filterMap(FP.identity) we filter up O.none values and
             * unwrap values to the plain Array<Address> at a single place
             */
            A.filterMap(FP.identity),
            /**
             * We have to get a new stake-stream for every new asset
             * @description /src/renderer/services/midgard/shares.ts
             */
            combineSharesByAddresses$
          )
        )
      ),
    RD.initial
  )

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
    (data: PoolShareTableRowData[], loading: boolean) => {
      previousPoolShares.current = O.some(data)
      return (
        <PoolSharesTable
          loading={loading}
          data={data}
          priceAsset={priceAsset}
          goToStakeInfo={goToStakeInfo}
          network={network}
        />
      )
    },
    [goToStakeInfo, priceAsset, network]
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

  return useMemo(
    () =>
      FP.pipe(
        RD.combine(poolSharesRD, poolsRD),
        RD.fold(
          // initial state
          () => renderPoolSharesTable([], false),
          // loading state
          () => {
            const data = O.getOrElse(() => [] as PoolShareTableRowData[])(previousPoolShares.current)
            return renderPoolSharesTable(data, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} extra={renderRefreshBtn} />
          },
          // success state
          ([poolShares, { poolDetails }]) => {
            const data = getPoolShareTableData(poolShares, poolDetails, pricePoolData)
            previousPoolShares.current = O.some(data)
            return renderPoolSharesTable(data, false)
          }
        )
      ),
    [poolSharesRD, poolsRD, renderPoolSharesTable, renderRefreshBtn, pricePoolData]
  )
}
