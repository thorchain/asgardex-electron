import React from 'react'

import { Button } from 'antd'
import { useHistory } from 'react-router-dom'

import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import View from '../View'

type Props = {}

const SwapHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickHandler = (p: SwapRouteParams) => {
    history.push(swapRoutes.swap.path(p))
  }

  return (
    <View>
      <h1>Swap Home</h1>
      <Button onClick={() => clickHandler({ source: 'rune', target: 'bnb' })}>RUNE -&gt; BNB</Button>
      <Button onClick={() => clickHandler({ source: 'rune', target: 'tusdb' })}>RUNE -&gt; TUSDB</Button>
    </View>
  )
}

export default SwapHomeView
