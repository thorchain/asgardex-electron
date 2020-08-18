import React, { useMemo } from 'react'

import { Col, Row } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOperators from 'rxjs/operators'

import Settings from '../../components/wallet/Settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { Network, OnlineStatus } from '../../services/app/types'

const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock, removeKeystore } = keystoreService
  const { network$, toggleNetwork } = useAppContext()
  const binanceContext = useBinanceContext()

  const binanceAddress$ = useMemo(
    () =>
      pipe(
        binanceContext.address$,
        RxOperators.map(
          O.map((address) => ({
            chainName: 'Binancechain',
            accounts: [
              {
                name: 'Main',
                address,
                type: 'internal'
              }
            ]
          }))
        )
      ),
    [binanceContext.address$]
  )

  const { service: midgardService } = useMidgardContext()

  const { onlineStatus$ } = useAppContext()

  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)

  const network = useObservableState(network$, Network.TEST)

  const midgardEndpoint$ = useMemo(() => pipe(midgardService.apiEndpoint$, RxOperators.map(O.fromEither)), [
    midgardService.apiEndpoint$
  ])

  const endpointUrl = useObservableState(midgardEndpoint$, O.none)

  const clientUrl = useMemo(() => (onlineStatus === OnlineStatus.OFF ? O.none : endpointUrl), [
    endpointUrl,
    onlineStatus
  ])

  const userAccounts$ = useMemo(
    () =>
      pipe(
        // combineLatest is for the future additional accounts
        Rx.combineLatest([binanceAddress$]),
        RxOperators.map(A.filter(O.isSome)),
        RxOperators.map(sequenceTOptionFromArray)
      ),
    [binanceAddress$]
  )
  const userAccounts = useObservableState(userAccounts$, O.none)

  const apiVersion = envOrDefault($VERSION, '-')

  return (
    <Row>
      <Col span={24}>
        <Settings
          apiVersion={apiVersion}
          network={network}
          toggleNetwork={toggleNetwork}
          clientUrl={clientUrl}
          lockWallet={lock}
          removeKeystore={removeKeystore}
          userAccounts={userAccounts}
        />
      </Col>
    </Row>
  )
}

export default SettingsView
