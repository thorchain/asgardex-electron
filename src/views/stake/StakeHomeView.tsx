import React from 'react'
import { Button } from 'antd'
import { useHistory } from 'react-router-dom'
import { stakeRoute } from '../../routes'
import View from '../View'

type Props = {}

const StakeHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickHandler = (asset: string) => {
    history.push(stakeRoute.path({ asset }))
  }

  return (
    <View>
      <h1>Stake Home</h1>
      <Button onClick={() => clickHandler('BNB')}>BNB</Button>
      <Button onClick={() => clickHandler('TUSDB-000')}>TUSDB</Button>
    </View>
  )
}

export default StakeHomeView
