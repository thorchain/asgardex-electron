import React from 'react'

import { Button } from 'antd'
import { useHistory } from 'react-router-dom'

import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import View from '../View'

type Props = {}

const PoolsOverview: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickSwapHandler = (p: SwapRouteParams) => {
    history.push(swapRoutes.swap.path(p))
  }
  const clickStakeHandler = (asset: string) => {
    history.push(stakeRoutes.stake.path({ asset }))
  }

  return (
    <View>
      <h1>Pools overview</h1>
      <Button onClick={() => clickSwapHandler({ source: 'rune', target: 'bnb' })}>Swap RUNE -&gt; BNB</Button>
      <Button onClick={() => clickSwapHandler({ source: 'rune', target: 'tusdb' })}>Swap RUNE -&gt; TUSDB</Button>
      <Button onClick={() => clickStakeHandler('BNB')}>Stake BNB</Button>
      <Button onClick={() => clickStakeHandler('TUSDB-000')}>Stake TUSDB</Button>
    </View>
  )
}

export default PoolsOverview
