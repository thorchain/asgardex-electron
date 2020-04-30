import React from 'react'
import { Button } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { SwapRouteParams } from '../../routes'
import View from '../View'

type Props = {}

const SwapView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { source, target } = useParams<SwapRouteParams>()

  const clickHandler = () => {
    history.goBack()
  }

  return (
    <View>
      <h1>
        Swap {source.toUpperCase()} -&gt; {target.toUpperCase()}
      </h1>
      <Button onClick={clickHandler}>Back</Button>
    </View>
  )
}

export default SwapView
