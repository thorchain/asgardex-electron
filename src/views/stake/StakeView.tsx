import React from 'react'
import { Button } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { StakeRouteParams } from '../../routes'
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
      <h1>Stake {asset}</h1>
      <Button onClick={clickHandler}>Back</Button>
    </View>
  )
}

export default StakeView
