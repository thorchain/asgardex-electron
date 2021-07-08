import React, { useMemo } from 'react'

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
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Settings } from '../../components/wallet/settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinCashContext } from '../../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { filterEnabledChains } from '../../helpers/chainHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { DEFAULT_NETWORK } from '../../services/const'
import { getPhrase } from '../../services/wallet/util'
import { UserAccountType } from '../../types/wallet'
import { ClientSettingsView } from './CllientSettingsView'

export const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ } = keystoreService
  const { network$ } = useAppContext()
  const bnbContext = useBinanceContext()
  const thorContext = useThorchainContext()
  const ethContext = useEthereumContext()
  const btcContext = useBitcoinContext()
  const ltcContext = useLitecoinContext()
  const bchContext = useBitcoinCashContext()

  const { getExplorerAddressByChain$ } = useChainContext()

  const phrase$ = useMemo(() => FP.pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const bnbLedgerAddress = useObservableState(bnbContext.ledgerAddress$, RD.initial)
  const bnbAccount$ = useMemo(
    () =>
      FP.pipe(
        bnbContext.addressUI$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: BNBChain,
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
      FP.pipe(
        ethContext.addressUI$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: ETHChain,
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
      FP.pipe(
        btcContext.addressUI$,
        RxOp.map(
          O.map(
            (address) =>
              ({
                chainName: BTCChain,
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
  const runeNativeAddress = FP.pipe(
    oRuneNativeAddress,
    O.getOrElse(() => '')
  )

  const thorAccount$ = useMemo(
    () =>
      FP.pipe(
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
      FP.pipe(
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
      FP.pipe(
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

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const userAccounts$ = useMemo(
    () =>
      FP.pipe(
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

  return (
    <Row>
      <Col span={24}>
        <Settings
          selectedNetwork={network}
          lockWallet={lock}
          removeKeystore={removeKeystore}
          exportKeystore={exportKeystore}
          runeNativeAddress={runeNativeAddress}
          userAccounts={userAccounts}
          phrase={phrase}
          clickAddressLinkHandler={clickAddressLinkHandler}
          validatePassword$={validatePassword$}
          ClientSettingsView={ClientSettingsView}
        />
      </Col>
    </Row>
  )
}
