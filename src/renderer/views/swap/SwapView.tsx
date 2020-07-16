import React, { useCallback } from 'react'

import { Button } from 'antd'
import { useHistory, useParams } from 'react-router-dom'

import { SwapRouteParams } from '../../routes/swap'

type Props = {}

const SwapView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { source, target } = useParams<SwapRouteParams>()

  const goBack = history.goBack
  const clickHandler = useCallback(() => {
    goBack()
  }, [goBack])

  return (
    <>
      <Button onClick={clickHandler}>Back</Button>
      <h1>
        Swap {source.toUpperCase()} -&gt; {target.toUpperCase()}
      </h1>
    </>
  )
}

export default SwapView
