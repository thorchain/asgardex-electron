import React from 'react'
import { Button } from 'antd'
import { useHistory } from 'react-router-dom'
import { swapRoute, SwapRouteParams } from '../../routes'
import View from '../View'
import { useObservableState } from 'observable-hooks'
import { usePoolsContext } from '../../contexts/PoolsContext'

type Props = {}

const SwapHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickHandler = (p: SwapRouteParams) => {
    history.push(swapRoute.path(p))
  }
  const pools$ = usePoolsContext()
  const pools = useObservableState(pools$)

  return (
    <View>
      <h1>Swap Home</h1>
      <h2>{JSON.stringify(pools)}</h2>
      <Button onClick={() => clickHandler({ source: 'rune', target: 'bnb' })}>RUNE -&gt; BNB</Button>
      <Button onClick={() => clickHandler({ source: 'rune', target: 'tusdb' })}>RUNE -&gt; TUSDB</Button>
    </View>
  )
}

export default SwapHomeView
