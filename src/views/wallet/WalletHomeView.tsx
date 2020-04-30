import React from 'react'
import { Button } from 'antd'
import { useHistory } from 'react-router-dom'
import View from '../View'

type Props = {}

const WalletHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickHandler = () => {
    history.goBack()
  }

  return (
    <View>
      <h1>Wallet Home</h1>
      <Button onClick={clickHandler}>Back</Button>
    </View>
  )
}

export default WalletHomeView
