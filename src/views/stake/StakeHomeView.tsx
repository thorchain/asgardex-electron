import React, { useMemo, useCallback, useState } from 'react'
import { WS } from '@thorchain/asgardex-binance'
import { Button } from 'antd'
import { useHistory } from 'react-router-dom'
import * as stakeRoutes from '../../routes/stake'
import * as RD from '@devexperts/remote-data-ts'
import View from '../View'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useObservableState, useSubscription, useObservable } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useBinanceContext } from '../../contexts/BinanceContext'

type Props = {}

const StakeHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const intl = useIntl()

  const { subscribeTransfers } = useBinanceContext()

  const [memo, setMemo] = useState('')

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

  const clickHandler = (asset: string) => {
    history.push(stakeRoutes.asset.path({ asset }))
  }

  const renderPools = useMemo(
    () => (
      <>
        <h3>MEMO: {memo}</h3>
        <h3>Pools</h3>
        {RD.fold(
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
        )(pools)}
      </>
    ),
    [memo, pools]
  )

  return (
    <View>
      <h1>{intl.formatMessage({ id: 'common.greeting' }, { name: 'ASGARDEX' })}</h1>
      <h1>Stake Home</h1>
      {renderPools}
      <Button onClick={() => reloadPools()}>Reload pools</Button>
      <Button onClick={() => clickHandler('BNB')}>BNB</Button>
      <Button onClick={() => clickHandler('TUSDB-000')}>TUSDB</Button>
    </View>
  )
}

export default StakeHomeView
