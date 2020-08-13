import React, { useMemo } from 'react'

import { Col, Row } from 'antd'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs/operators'

import Settings from '../../components/wallet/Settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { Network, OnlineStatus } from '../../services/app/types'

const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock, removeKeystore } = keystoreService
  const { network$, toggleNetwork } = useAppContext()
  const { explorerUrl$: binanceEndpoint$ } = useBinanceContext()

  const {
    service: { apiEndpoint$: midgardEndpoint$ }
  } = useMidgardContext()

  const { onlineStatus$ } = useAppContext()

  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)

  const network = useObservableState(network$, Network.TEST)

  const address$ = useMemo(
    () => (network === Network.MAIN ? binanceEndpoint$ : pipe(midgardEndpoint$, Rx.map(O.fromEither))),
    [network, binanceEndpoint$, midgardEndpoint$]
  )

  const endpointUrl = useObservableState(address$, O.none)

  const address = useMemo(() => (onlineStatus === OnlineStatus.OFF ? O.none : endpointUrl), [endpointUrl, onlineStatus])

  const apiVersion = envOrDefault($VERSION, '-')

  return (
    <Row>
      <Col span={24}>
        <Settings
          apiVersion={apiVersion}
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
