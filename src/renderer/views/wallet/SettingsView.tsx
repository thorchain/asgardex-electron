import React from 'react'

import { Col, Row } from 'antd'
import { useObservableState } from 'observable-hooks'

import { Network } from '../../../shared/api/types'
import { Settings } from '../../components/wallet/settings'
import { useAppContext } from '../../contexts/AppContext'
import { DEFAULT_NETWORK } from '../../services/const'
import { ClientSettingsView } from './CllientSettingsView'

export const SettingsView: React.FC = (): JSX.Element => {
  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  return (
    <>
      <Row>
        <Col span={24}>
          <Settings selectedNetwork={network} ClientSettingsView={ClientSettingsView} />
        </Col>
      </Row>
    </>
  )
}
