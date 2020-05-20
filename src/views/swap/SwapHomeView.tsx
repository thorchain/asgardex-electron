import React, { useEffect } from 'react'
import { Button } from 'antd'
import { useHistory } from 'react-router-dom'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import View from '../View'
import { useObservableState } from 'observable-hooks'
import * as RD from '@devexperts/remote-data-ts'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useBinanceContext } from '../../contexts/BinanceContext'

type Props = {}

const SwapHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickHandler = (p: SwapRouteParams) => {
    history.push(swapRoutes.swap.path(p))
  }
  const { pools$ } = useMidgardContext()
  const { miniTickers$ } = useBinanceContext()

  const pools = useObservableState(pools$, RD.initial)
  const tickers = useObservableState(miniTickers$, [])

  useEffect(() => {
    console.log('tickers', tickers[0]?.s)
  }, [tickers])

  return (
    <View>
      <h1>Swap Home</h1>
      <h2>Raw pool data: {JSON.stringify(pools)}</h2>
      <h2>TICKER: {tickers[0]?.s}</h2>
      <Button onClick={() => clickHandler({ source: 'rune', target: 'bnb' })}>RUNE -&gt; BNB</Button>
      <Button onClick={() => clickHandler({ source: 'rune', target: 'tusdb' })}>RUNE -&gt; TUSDB</Button>
    </View>
  )
}

export default SwapHomeView
