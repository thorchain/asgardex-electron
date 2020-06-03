import React from 'react'

import { Button } from 'antd'
import { useHistory, useParams } from 'react-router-dom'

import { StakeRouteParams } from '../../routes/stake'
import View from '../View'

type Props = {}

const StakeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { asset } = useParams<StakeRouteParams>()

  const clickHandler = () => {
    history.goBack()
  }

  return (
    <View>
      <Button onClick={clickHandler}>Back</Button>
      <h1>Stake {asset}</h1>
    </View>
  )
}

export default StakeView
