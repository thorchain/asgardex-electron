import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import { Col, notification, Row } from 'antd'
import * as FP from 'fp-ts/function'
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
import { useBitcoinCashContext } from '../../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { filterEnabledChains } from '../../helpers/chainHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { OnlineStatus } from '../../services/app/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { getPhrase } from '../../services/wallet/util'
import { UserAccountType } from '../../types/wallet'

export const SettingsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ } = keystoreService
  const { network$, changeNetwork } = useAppContext()
  const bnbContext = useBinanceContext()
  const thorContext = useThorchainContext()
  const ethContext = useEthereumContext()
  const btcContext = useBitcoinContext()
  const ltcContext = useLitecoinContext()
  const bchContext = useBitcoinCashContext()

  const {
    retrieveLedgerAddress,
    removeLedgerAddress,
    removeAllLedgerAddress,
    getExplorerAddressByChain$
  } = useChainContext()

  const phrase$ = useMemo(() => pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const bnbLedgerAddress = useObservableState(bnbContext.ledgerAddress$, RD.initial)
  const bnbAccount$ = useMemo(
    () =>
      pipe(
        bnbContext.addressUI$,
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
                    address: RD.getOrElse(() => '')(bnbLedgerAddress),
                    type: 'external'
                  }
                ].filter(({ address }) => !!address)
              } as UserAccountType)
          )
        )
      ),
    [bnbContext.addressUI$, bnbLedgerAddress]
  )

  const ethAccount$ = useMemo(
    () =>
      pipe(
        ethContext.addressUI$,
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
    [ethContext.addressUI$]
  )

  const btcLedgerAddress = useObservableState(btcContext.ledgerAddress$, RD.initial)
  const btcAccount$ = useMemo(
    () =>
      pipe(
        btcContext.addressUI$,
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
                    address: RD.getOrElse(() => '')(btcLedgerAddress),
                    type: 'external'
                  }
                ].filter(({ address }) => !!address)
              } as UserAccountType)
          )
        )
      ),
    [btcContext.addressUI$, btcLedgerAddress]
  )

  const oRuneNativeAddress = useObservableState(thorContext.address$, O.none)
  const runeNativeAddress = pipe(
    oRuneNativeAddress,
    O.getOrElse(() => '')
  )

  const thorAccount$ = useMemo(
    () =>
      pipe(
        thorContext.addressUI$,
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
    [thorContext.addressUI$]
  )

  const ltcAddress$ = useMemo(
    () =>
      pipe(
        ltcContext.addressUI$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: LTCChain,
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
    [ltcContext.addressUI$]
  )

  const bchAccount$ = useMemo(
    () =>
      pipe(
        bchContext.addressUI$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: BCHChain,
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
    [bchContext.addressUI$]
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
        Rx.combineLatest(
          filterEnabledChains({
            THOR: [thorAccount$],
            BTC: [btcAccount$],
            ETH: [ethAccount$],
            BNB: [bnbAccount$],
            BCH: [bchAccount$],
            LTC: [ltcAddress$]
          })
        ),
        RxOp.map(A.filter(O.isSome)),
        RxOp.map(sequenceTOptionFromArray)
      ),
    [thorAccount$, bnbAccount$, ethAccount$, btcAccount$, bchAccount$, ltcAddress$]
  )
  const userAccounts = useObservableState(userAccounts$, O.none)

  const apiVersion = envOrDefault($VERSION, '-')

  const getBNBExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(BNBChain), O.none)
  const getBTCExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(BTCChain), O.none)
  const getBCHExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(BCHChain), O.none)
  const getETHExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(ETHChain), O.none)
  const getTHORExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(THORChain), O.none)
  const getLTCExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(LTCChain), O.none)
  const getCosmosExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(CosmosChain), O.none)
  const getPolkadotExplorerAddressUrl = useObservableState(getExplorerAddressByChain$(PolkadotChain), O.none)

  const clickAddressLinkHandler = (chain: Chain, address: Address) => {
    switch (chain) {
      case BNBChain:
        FP.pipe(getBNBExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case BTCChain:
        FP.pipe(getBTCExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case BCHChain:
        FP.pipe(getBCHExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case ETHChain:
        FP.pipe(getETHExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case THORChain:
        FP.pipe(getTHORExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case CosmosChain:
        FP.pipe(getCosmosExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case LTCChain:
        FP.pipe(getLTCExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
      case PolkadotChain:
        FP.pipe(getPolkadotExplorerAddressUrl, O.ap(O.some(address)), O.map(window.apiUrl.openExternal))
        break
    }
  }

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

    getLedgerErrorDescription(bnbLedgerAddress, 'BNB')
    getLedgerErrorDescription(btcLedgerAddress, 'BTC')
  }, [bnbLedgerAddress, btcLedgerAddress, intl, removeLedgerAddress])

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
          clickAddressLinkHandler={clickAddressLinkHandler}
          validatePassword$={validatePassword$}
        />
      </Col>
    </Row>
  )
}
