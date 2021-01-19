import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Chain, THORChain } from '@xchainjs/xchain-util'
import { Col, notification, Row } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { Settings } from '../../components/wallet/settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { OnlineStatus } from '../../services/app/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { getPhrase } from '../../services/wallet/util'
import { UserAccountType } from '../../types/wallet'

export const SettingsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore } = keystoreService
  const { network$, changeNetwork } = useAppContext()
  const binanceContext = useBinanceContext()
  const thorchainContext = useThorchainContext()
  const ethContext = useEthereumContext()
  const bitcoinContext = useBitcoinContext()
  const thorchaincontext = useThorchainContext()
  const chainContext = useChainContext()
  const { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress } = chainContext

  const phrase$ = useMemo(() => pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const binanceLedgerAddress = useObservableState(binanceContext.ledgerAddress$, RD.initial)
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
                  },
                  {
                    name: 'Ledger',
                    address: RD.getOrElse(() => '')(binanceLedgerAddress),
                    type: 'external'
                  }
                ].filter(({ address }) => !!address)
              } as UserAccountType)
          )
        )
      ),
    [binanceContext.address$, binanceLedgerAddress]
  )

  const ethAddress$ = useMemo(
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
                    address: RD.getOrElse(() => '')(bitcoinLedgerAddress),
                    type: 'external'
                  }
                ].filter(({ address }) => !!address)
              } as UserAccountType)
          )
        )
      ),
    [bitcoinContext.address$, bitcoinLedgerAddress]
  )

  const oRuneNativeAddress = useObservableState(thorchaincontext.address$, O.none)
  const runeNativeAddress = pipe(
    oRuneNativeAddress,
    O.getOrElse(() => '')
  )

  const thorchainAddress$ = useMemo(
    () =>
      pipe(
        thorchainContext.address$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: THORChain,
                accounts: [
                  {
                    name: 'Main',
                    address,
                    type: 'internal'
                  }
                ].filter(({ address }) => !!address)
              } as UserAccountType)
          )
        )
      ),
    [thorchainContext.address$]
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
        Rx.combineLatest([thorchainAddress$, binanceAddress$, ethAddress$, bitcoinAddress$]),
        RxOp.map(A.filter(O.isSome)),
        RxOp.map(sequenceTOptionFromArray)
      ),
    [thorchainAddress$, binanceAddress$, bitcoinAddress$, ethAddress$]
  )
  const userAccounts = useObservableState(userAccounts$, O.none)

  const apiVersion = envOrDefault($VERSION, '-')

  useEffect(() => {
    const getLedgerErrorDescription = (ledgerAddress: RD.RemoteData<LedgerErrorId, string>, chain: Chain) => {
      if (RD.isFailure(ledgerAddress)) {
        let description
        switch (ledgerAddress.error) {
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
        removeLedgerAddress(chain)
      }
    }

    getLedgerErrorDescription(binanceLedgerAddress, 'BNB')
    getLedgerErrorDescription(bitcoinLedgerAddress, 'BTC')
  }, [binanceLedgerAddress, bitcoinLedgerAddress, intl, removeLedgerAddress])

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
          exportKeystore={exportKeystore}
          runeNativeAddress={runeNativeAddress}
          userAccounts={userAccounts}
          retrieveLedgerAddress={retrieveLedgerAddress}
          removeLedgerAddress={removeLedgerAddress}
          removeAllLedgerAddress={removeAllLedgerAddress}
          phrase={phrase}
        />
      </Col>
    </Row>
  )
}
