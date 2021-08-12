import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import { BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Button } from '../../components/uielements/button'
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
import { useLedger } from '../../hooks/useLedger'
import { DEFAULT_NETWORK } from '../../services/const'
import { WalletAccount, WalletAddressRD } from '../../services/wallet/types'
import { getPhrase } from '../../services/wallet/util'
import { ClientSettingsView } from './CllientSettingsView'

export const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ } = keystoreService
  const { network$ } = useAppContext()

  const { clientByChain$ } = useChainContext()

  const phrase$ = useMemo(() => FP.pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const { addressUI$: bnbAddressUI$ } = useBinanceContext()
  const bnbAccount$: Rx.Observable<O.Option<WalletAccount>> = useMemo(
    () =>
      FP.pipe(
        bnbAddressUI$,
        RxOp.map(
          O.map((address) => ({
            chain: BNBChain,
            accounts: [
              RD.success({
                address,
                type: 'keystore'
              })
            ]
          }))
        )
      ),
    [bnbAddressUI$]
  )

  const { addressUI$: ethAddressUI$ } = useEthereumContext()
  const ethAccount$: Rx.Observable<O.Option<WalletAccount>> = useMemo(
    () =>
      FP.pipe(
        ethAddressUI$,
        RxOp.map(
          O.map((address) => ({
            chain: ETHChain,
            accounts: [
              RD.success({
                address,
                type: 'keystore'
              })
            ]
          }))
        )
      ),
    [ethAddressUI$]
  )

  const { addressUI$: btcAddressUI$ } = useBitcoinContext()
  const btcAccount$: Rx.Observable<O.Option<WalletAccount>> = useMemo(
    () =>
      FP.pipe(
        btcAddressUI$,
        RxOp.map(
          O.map((address) => ({
            chain: BTCChain,
            accounts: [
              RD.success({
                address,
                type: 'keystore'
              })
            ]
          }))
        )
      ),
    [btcAddressUI$]
  )

  const { address$: thorAddressUI$ } = useThorchainContext()
  const { getAddress: getLedgerThorAddress, address: thorLedgerAddressRD } = useLedger()

  const oRuneNativeAddress = useObservableState(thorAddressUI$, O.none)
  const runeNativeAddress = FP.pipe(
    oRuneNativeAddress,
    O.getOrElse(() => '')
  )

  const thorLedgerAccount: WalletAddressRD = useMemo(
    () =>
      FP.pipe(
        thorLedgerAddressRD,
        RD.mapLeft((errorID) => Error(`Could not get THOR address from Ledger ${errorID}`)),
        RD.map((address) => ({
          address,
          type: 'ledger'
        }))
      ),
    [thorLedgerAddressRD]
  )
  const thorAccount$: Rx.Observable<O.Option<WalletAccount>> = useMemo(
    () =>
      FP.pipe(
        thorAddressUI$,
        RxOp.map(
          O.map((address) => ({
            chain: THORChain,
            accounts: [
              RD.success({
                address,
                type: 'keystore'
              }),
              thorLedgerAccount
            ]
          }))
        )
      ),
    [thorAddressUI$, thorLedgerAccount]
  )

  const { addressUI$: ltcAddressUI$ } = useLitecoinContext()
  const ltcAddress$: Rx.Observable<O.Option<WalletAccount>> = useMemo(
    () =>
      FP.pipe(
        ltcAddressUI$,
        RxOp.map(
          O.map((address) => ({
            chain: LTCChain,
            accounts: [
              RD.success({
                address,
                type: 'ledger'
              })
            ]
          }))
        )
      ),
    [ltcAddressUI$]
  )

  const { addressUI$: bchAddressUI$ } = useBitcoinCashContext()
  const bchAccount$: Rx.Observable<O.Option<WalletAccount>> = useMemo(
    () =>
      FP.pipe(
        bchAddressUI$,
        RxOp.map(
          O.map((address) => ({
            chain: BCHChain,
            accounts: [
              RD.success({
                address,
                type: 'ledger'
              })
            ]
          }))
        )
      ),
    [bchAddressUI$]
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

  const oBNBClient = useObservableState(clientByChain$(BNBChain), O.none)
  const oETHClient = useObservableState(clientByChain$(ETHChain), O.none)
  const oBTCClient = useObservableState(clientByChain$(BTCChain), O.none)
  const oBCHClient = useObservableState(clientByChain$(BCHChain), O.none)
  const oTHORClient = useObservableState(clientByChain$(THORChain), O.none)
  const oLTCClient = useObservableState(clientByChain$(LTCChain), O.none)

  const clickAddressLinkHandler = (chain: Chain, address: Address) => {
    const openExplorerAddressUrl = (client: XChainClient) => {
      const url = client.getExplorerAddressUrl(address)
      window.apiUrl.openExternal(url)
    }
    switch (chain) {
      case BNBChain:
        FP.pipe(oBNBClient, O.map(openExplorerAddressUrl))
        break
      case BTCChain:
        FP.pipe(oBTCClient, O.map(openExplorerAddressUrl))
        break
      case BCHChain:
        FP.pipe(oBCHClient, O.map(openExplorerAddressUrl))
        break
      case ETHChain:
        FP.pipe(oETHClient, O.map(openExplorerAddressUrl))
        break
      case THORChain:
        FP.pipe(oTHORClient, O.map(openExplorerAddressUrl))
        break
      case LTCChain:
        FP.pipe(oLTCClient, O.map(openExplorerAddressUrl))
        break
      default:
        console.warn(`Chain ${chain} has not been implemented`)
    }
  }

  return (
    <>
      <Row>
        <Col>
          <Button onClick={() => getLedgerThorAddress(THORChain)}>Get Ledger THOR address</Button>
        </Col>
        <Col>ledgerAddressRD: {JSON.stringify(thorLedgerAddressRD)}</Col>
      </Row>
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
    </>
  )
}
