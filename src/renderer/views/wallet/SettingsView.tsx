import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Col, Row } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxO from 'rxjs/operators'

import Settings from '../../components/wallet/Settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { OnlineStatus, Network } from '../../services/app/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { UserAccountType } from '../../types/wallet'

const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock, removeKeystore } = keystoreService
  const { network$, changeNetwork } = useAppContext()
  const binanceContext = useBinanceContext()
  const ethContext = useEthereumContext()
  const bitcoinContext = useBitcoinContext()

  const binanceAddress$ = useMemo(
    () =>
      pipe(
        binanceContext.address$,
        RxO.map(
          O.map(
            (address) =>
              ({
                chainName: 'Binancechain',
                accounts: [
                  {
                    name: 'Main',
                    address,
                    type: 'internal'
                  }
                ]
              } as UserAccountType)
          )
        )
      ),
    [binanceContext.address$]
  )

  const ethAddress$ = useMemo(
    () =>
      pipe(
        ethContext.address$,
        RxO.map(
          O.map(
            (address) =>
              ({
                chainName: 'Ethereum chain',
                accounts: [
                  {
                    name: 'Main',
                    address,
                    type: 'internal'
                  }
                ]
              } as UserAccountType)
          )
        )
      ),
    [ethContext.address$]
  )

  const bitcoinAddress$ = useMemo(
    () =>
      pipe(
        bitcoinContext.address$,
        RxO.map(
          O.map(
            (address) =>
              ({
                chainName: 'Bitcoin chain',
                accounts: [
                  {
                    name: 'Main',
                    address,
                    type: 'internal'
                  }
                ]
              } as UserAccountType)
          )
        )
      ),
    [bitcoinContext.address$]
  )

  const { service: midgardService } = useMidgardContext()

  const { onlineStatus$ } = useAppContext()

  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const midgardEndpoint$ = useMemo(() => pipe(midgardService.apiEndpoint$, RxO.map(RD.toOption)), [
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
        Rx.combineLatest([binanceAddress$, ethAddress$, bitcoinAddress$]),
        RxO.map(A.filter(O.isSome)),
        RxO.map(sequenceTOptionFromArray)
      ),
    [binanceAddress$, ethAddress$, bitcoinAddress$]
  )
  const userAccounts = useObservableState(userAccounts$, O.none)

  const apiVersion = envOrDefault($VERSION, '-')

  return (
    <Row>
      <Col span={24}>
        <Settings
          apiVersion={apiVersion}
          selectedNetwork={network}
          changeNetwork={changeNetwork}
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
