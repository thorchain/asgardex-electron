import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { WS } from '@thorchain/asgardex-binance'
import * as RD from '@devexperts/remote-data-ts'
import View from '../View'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useObservableState, useSubscription, useObservable } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { Button } from 'antd'

type Props = {}

const PlaygroundView: React.FC<Props> = (_): JSX.Element => {
  const intl = useIntl()

  const { subscribeTransfers, miniTickers$ } = useBinanceContext()

  const [memo, setMemo] = useState('')

  const tickers = useObservableState(miniTickers$, [])

  useEffect(() => {
    console.log('tickers', tickers[0]?.s)
  }, [tickers])

  // For debugging only - address will be provided by wallet
  const address = 'tbnb13egw96d95lldrhwu56dttrpn2fth6cs0axzaad'

  // 1. Create observable for incoming transfer messages of given address
  const transfers$ = useObservable<WS.Transfer>(() => subscribeTransfers(address))

  // 2. Define callback for handling incoming transfer messages
  const transferHandler = useCallback((transfer: WS.Transfer) => {
    // Do anything with transfer data
    // we just store memo here - just to demonstrate
    setMemo(transfer.M)
  }, [])

  // 3. Subscribe to incoming transfer events
  useSubscription(transfers$, transferHandler)

  const { pools$, reloadPools } = useMidgardContext()
  const pools = useObservableState(pools$, RD.initial)

  const renderPools = useMemo(
    () =>
      RD.fold(
        // initial state
        () => <div />,
        // loading state
        () => <h3>Loading...</h3>,
        // error state
        (error: Error) => <h3>`Loading of pools failed ${error?.message ?? ''}`</h3>,
        // success state
        (pools: string[]): JSX.Element => {
          const hasPools = pools.length > 0
          return (
            <>
              {!hasPools && <h3>No pools available.</h3>}
              {hasPools && (
                <ul>
                  {pools.map((pool: string, index: number) => (
                    <li key={index}>{pool}</li>
                  ))}
                </ul>
              )}
            </>
          )
        }
      )(pools),
    [pools]
  )

  return (
    <View>
      <h1>Playground</h1>
      <h1>i18n</h1>
      <h2>{intl.formatMessage({ id: 'common.greeting' }, { name: 'ASGARDEX' })}</h2>
      <h1>Pools</h1>
      <h2>Raw data: {JSON.stringify(pools)}</h2>
      {renderPools}
      <h1>Ticker</h1>
      <h2>{tickers[0]?.s}</h2>
      <Button onClick={() => reloadPools()}>Reload pools</Button>
      <h1>Memo</h1>
      <h2>{memo}</h2>
    </View>
  )
}

export default PlaygroundView
