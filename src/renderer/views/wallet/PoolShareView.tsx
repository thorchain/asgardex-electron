import React, { useCallback, useMemo, useRef, useEffect } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, Chain, THORChain } from '@xchainjs/xchain-util'
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
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isThorChain } from '../../helpers/chainHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { addressFromOptionalWalletAddress, addressFromWalletAddress } from '../../helpers/walletHelper'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { WalletAddress$ } from '../../services/clients/types'
import { ENABLED_CHAINS } from '../../services/const'
import { PoolSharesRD } from '../../services/midgard/types'
import { getPoolShareTableData } from './PoolShareView.helper'

export const PoolShareView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { network } = useNetwork()

  const { service: midgardService } = useMidgardContext()
  const {
    // TODO (@asgardex-team) Improve loading of pool details - no need to load all data
    // @see https://github.com/thorchain/asgardex-electron/issues/1205
    pools: { allPoolDetails$, selectedPricePool$, selectedPricePoolAsset$, reloadAllPools, haltedChains$ },
    reloadNetworkInfo,
    shares: { allSharesByAddresses$ }
  } = midgardService

  const { addressByChain$ } = useChainContext()

  const { getLedgerAddress$ } = useWalletContext()

  useEffect(() => {
    reloadAllPools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [oRuneNativeAddress] = useObservableState<O.Option<Address>>(
    () => FP.pipe(addressByChain$(THORChain), RxOp.map(addressFromOptionalWalletAddress)),
    O.none
  )

  const [symSharesRD]: [PoolSharesRD, unknown] = useObservableState(() => {
    // keystore addresses
    const addresses$: WalletAddress$[] = FP.pipe(
      ENABLED_CHAINS,
      A.filter((chain) => !isThorChain(chain)),
      A.map(addressByChain$)
    )

    // ledger addresses
    const ledgerAddresses$: WalletAddress$[] = FP.pipe(
      ENABLED_CHAINS,
      A.filter((chain) => !isThorChain(chain)),
      A.map((chain) => getLedgerAddress$(chain, network)),
      // Transform `LedgerAddress` -> `Option<WalletAddress>`
      A.map(RxOp.map(RD.toOption))
    )

    return FP.pipe(
      Rx.combineLatest([...addresses$, ...ledgerAddresses$]),
      RxOp.map((v) => v),
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
          // grab `address` from `WalletAddress`
          A.map(addressFromWalletAddress),
          /**
           * We have to get a new stake-stream for every new asset
           * @description /src/renderer/services/midgard/shares.ts
           */
          allSharesByAddresses$
        )
      )
    )
  }, RD.initial)

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])
  const { mimirHalt } = useMimirHalt()
  const poolDetailsRD = useObservableState(allPoolDetails$, RD.pending)
  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)
  const priceAsset = FP.pipe(oPriceAsset, O.toUndefined)

  // store previous data of pools to render these while reloading
  const previousPoolShares = useRef<O.Option<PoolShareTableRowData[]>>(O.none)

  const openExternalShareInfo = useCallback(() => {
    // `thoryield.com` does not support testnet, we ignore it here
    const oMainnet = O.fromPredicate<Network>(() => network === 'mainnet')(network)
    return FP.pipe(
      sequenceTOption(oRuneNativeAddress, oMainnet),
      O.map(([thorAddress, _]) => `https://app.thoryield.com/accounts?thor=${thorAddress}`),
      O.map(window.apiUrl.openExternal)
    )
  }, [network, oRuneNativeAddress])

  const renderPoolSharesTable = useCallback(
    (data: PoolShareTableRowData[], loading: boolean) => {
      previousPoolShares.current = O.some(data)
      return (
        <PoolSharesTable
          haltedChains={haltedChains}
          mimirHalt={mimirHalt}
          loading={loading}
          data={data}
          priceAsset={priceAsset}
          openShareInfo={openExternalShareInfo}
          network={network}
        />
      )
    },
    [haltedChains, mimirHalt, priceAsset, openExternalShareInfo, network]
  )

  const clickRefreshHandler = useCallback(() => {
    reloadAllPools()
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadAllPools])

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
        RD.combine(symSharesRD, poolDetailsRD),
        RD.fold(
          // initial state
          () => renderPoolSharesTable([], false),
          // loading state
          () => {
            const data: PoolShareTableRowData[] = FP.pipe(
              previousPoolShares.current,
              O.getOrElse<PoolShareTableRowData[]>(() => [])
            )
            return renderPoolSharesTable(data, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} extra={renderRefreshBtn} />
          },
          // success state
          ([poolShares, poolDetails]) => {
            const data = getPoolShareTableData(poolShares, poolDetails, pricePoolData)
            previousPoolShares.current = O.some(data)
            return renderPoolSharesTable(data, false)
          }
        )
      ),
    [symSharesRD, poolDetailsRD, renderPoolSharesTable, renderRefreshBtn, pricePoolData]
  )
}
