import React from 'react'

import { Row, Col } from 'antd'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import Settings from '../../components/wallet/Settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { Network } from '../../services/app/types'

const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock, removeKeystore } = keystoreService
  const { network$, toggleNetwork } = useAppContext()
  const { address$ } = useBinanceContext()

  const network = useObservableState(network$, Network.TEST)
  const address = useObservableState(address$, O.none)

  return (
    <Row>
      <Col span={24}>
        <Settings
          network={network}
          toggleNetwork={toggleNetwork}
          address={address}
          lockWallet={lock}
          removeKeystore={removeKeystore}
        />
      </Col>
    </Row>
  )
}

export default SettingsView
