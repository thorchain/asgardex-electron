import React, { useCallback } from 'react'

import { Button } from 'antd'
import { useHistory, useParams } from 'react-router-dom'

import { StakeRouteParams } from '../../routes/stake'

type Props = {}

const StakeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { asset } = useParams<StakeRouteParams>()

  const goBack = history.goBack
  const clickHandler = useCallback(() => {
    goBack()
  }, [goBack])

  return (
    <>
      <Button onClick={clickHandler}>Back</Button>
      <h1>Stake {asset}</h1>
    </>
  )
}

export default StakeView
