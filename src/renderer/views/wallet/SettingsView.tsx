import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Col, notification, Row } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LedgerErrorId } from '../../../shared/api/types'
import { Settings } from '../../components/wallet/settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { OnlineStatus, Network } from '../../services/app/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { UserAccountType } from '../../types/wallet'

export const SettingsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { keystoreService } = useWalletContext()
  const { lock, removeKeystore } = keystoreService
  const { network$, changeNetwork } = useAppContext()
  const binanceContext = useBinanceContext()
  const ethContext = useEthereumContext()
  const bitcoinContext = useBitcoinContext()
  const chainContext = useChainContext()
  const { retrieveLedgerAddress, removeLedgerAddress } = chainContext

  const binanceAddress$ = useMemo(
    () =>
      pipe(
        binanceContext.address$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: 'BNB',
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
  // TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
  const _ethAddress$ = useMemo(
    () =>
      pipe(
        ethContext.address$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: 'ETH',
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

  const bitcoinLedgerAddress = useObservableState(bitcoinContext.ledgerAddress$, RD.initial)

  const bitcoinAddress$ = useMemo(
    () =>
      pipe(
        bitcoinContext.address$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: 'BTC',
                accounts: [
                  {
                    name: 'Main',
                    address,
                    type: 'internal'
                  },
                  {
                    name: 'Ledger',
                    address: RD.isSuccess(bitcoinLedgerAddress) ? bitcoinLedgerAddress.value : '',
                    type: 'external'
                  }
                ].filter(({ address }) => !!address)
              } as UserAccountType)
          )
        )
      ),
    [bitcoinContext.address$, bitcoinLedgerAddress]
  )

  const { service: midgardService } = useMidgardContext()

  const { onlineStatus$ } = useAppContext()

  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const midgardEndpoint$ = useMemo(() => pipe(midgardService.apiEndpoint$, RxOp.map(RD.toOption)), [
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
        Rx.combineLatest([
          binanceAddress$,
          /* TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH */
          /* ethAddress$, */
          bitcoinAddress$
        ]),
        RxOp.map(A.filter(O.isSome)),
        RxOp.map(sequenceTOptionFromArray)
      ),
    [binanceAddress$, bitcoinAddress$]
  )
  const userAccounts = useObservableState(userAccounts$, O.none)

  const apiVersion = envOrDefault($VERSION, '-')

  useEffect(() => {
    if (RD.isFailure(bitcoinLedgerAddress)) {
      let description
      switch (bitcoinLedgerAddress.error) {
        case LedgerErrorId.NO_DEVICE:
          description = intl.formatMessage({ id: 'ledger.errors.no.device' })
          break
        case LedgerErrorId.ALREADY_IN_USE:
          description = intl.formatMessage({ id: 'ledger.errors.already.in.use' })
          break
        case LedgerErrorId.NO_APP:
          description = intl.formatMessage({ id: 'ledger.errors.no.app' })
          break
        case LedgerErrorId.WRONG_APP:
          description = intl.formatMessage({ id: 'ledger.errors.wrong.app' })
          break
        case LedgerErrorId.DENIED:
          description = intl.formatMessage({ id: 'ledger.errors.denied' })
          break
        default:
          description = intl.formatMessage({ id: 'ledger.errors.unknown' })
          break
      }
      notification.error({
        message: intl.formatMessage({ id: 'ledger.add.device.error.title' }),
        description
      })
    }
  }, [bitcoinLedgerAddress, intl])

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
          retrieveLedgerAddress={retrieveLedgerAddress}
          removeLedgerAddress={removeLedgerAddress}
        />
      </Col>
    </Row>
  )
}
