import React, { useCallback } from 'react'

import { Button } from 'antd'
import Text from 'antd/lib/typography/Text'
import { useHistory, useLocation } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'

const LockView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const location = useLocation<RedirectRouteState>()

  const { unlock } = useWalletContext()

  const clickHandler = useCallback(() => {
    const from = location.state?.from?.pathname ?? walletRoutes.assets.template
    unlock()
    history.push(from)
  }, [location, unlock, history])

  return (
    <>
      <Button onClick={clickHandler}>Unlock wallet</Button>
      <Text>Unlock your Wallet</Text>
    </>
  )
}
export default LockView
