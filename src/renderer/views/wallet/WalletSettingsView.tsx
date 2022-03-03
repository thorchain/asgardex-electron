/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import { BCHChain, BNBChain, BTCChain, Chain, DOGEChain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { WalletAddress } from '../../../shared/wallet/types'
import { WalletSettings } from '../../components/wallet/settings/'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinCashContext } from '../../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useDogeContext } from '../../contexts/DogeContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { filterEnabledChains, isBnbChain, isBtcChain, isLtcChain, isThorChain } from '../../helpers/chainHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { useLedger } from '../../hooks/useLedger'
import { DEFAULT_NETWORK } from '../../services/const'
import { WalletAddressAsync } from '../../services/wallet/types'
import { ledgerErrorIdToI18n } from '../../services/wallet/util'
import { getPhrase } from '../../services/wallet/util'
import { walletAccount$ } from './WalletSettingsView.helper'

export const WalletSettingsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ } = keystoreService

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { address$: thorAddressUI$ } = useThorchainContext()
  const { addressUI$: bnbAddressUI$ } = useBinanceContext()
  const { addressUI$: ethAddressUI$ } = useEthereumContext()
  const { addressUI$: btcAddressUI$ } = useBitcoinContext()
  const { addressUI$: ltcAddressUI$ } = useLitecoinContext()
  const { addressUI$: bchAddressUI$ } = useBitcoinCashContext()
  const { addressUI$: dogeAddressUI$ } = useDogeContext()
  const oRuneNativeAddress: O.Option<WalletAddress> = useObservableState(thorAddressUI$, O.none)
  const runeNativeAddress = FP.pipe(
    oRuneNativeAddress,
    O.fold(
      () => '',
      ({ address }) => address
    )
  )

  const phrase$ = useMemo(() => FP.pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const {
    askAddress: askLedgerThorAddress,
    verifyAddress: verifyLedgerThorAddress,
    address: thorLedgerAddressRD,
    removeAddress: removeLedgerThorAddress
  } = useLedger(THORChain)

  const {
    askAddress: askLedgerBnbAddress,
    verifyAddress: verifyLedgerBnbAddress,
    address: bnbLedgerAddressRD,
    removeAddress: removeLedgerBnbAddress
  } = useLedger(BNBChain)

  const {
    askAddress: askLedgerBtcAddress,
    verifyAddress: verifyLedgerBtcAddress,
    address: btcLedgerAddressRD,
    removeAddress: removeLedgerBtcAddress
  } = useLedger(BTCChain)

  const {
    askAddress: askLedgerLtcAddress,
    verifyAddress: verifyLedgerLtcAddress,
    address: ltcLedgerAddressRD,
    removeAddress: removeLedgerLtcAddress
  } = useLedger(LTCChain)

  const addLedgerAddressHandler = (chain: Chain, walletIndex: number) => {
    if (isThorChain(chain)) return askLedgerThorAddress(walletIndex)
    if (isBnbChain(chain)) return askLedgerBnbAddress(walletIndex)
    if (isBtcChain(chain)) return askLedgerBtcAddress(walletIndex)
    if (isLtcChain(chain)) return askLedgerLtcAddress(walletIndex)

    return FP.constVoid
  }

  const verifyLedgerAddressHandler = (chain: Chain, walletIndex: number) => {
    if (isThorChain(chain)) return verifyLedgerThorAddress(walletIndex)
    if (isBnbChain(chain)) return verifyLedgerBnbAddress(walletIndex)
    if (isBtcChain(chain)) return verifyLedgerBtcAddress(walletIndex)
    if (isLtcChain(chain)) return verifyLedgerLtcAddress(walletIndex)

    return FP.constVoid
  }

  const removeLedgerAddressHandler = (chain: Chain) => {
    if (isThorChain(chain)) return removeLedgerThorAddress()
    if (isBnbChain(chain)) return removeLedgerBnbAddress()
    if (isBtcChain(chain)) return removeLedgerBtcAddress()
    if (isLtcChain(chain)) return removeLedgerLtcAddress()

    return FP.constVoid
  }

  const { clientByChain$ } = useChainContext()

  const oBNBClient = useObservableState(clientByChain$(BNBChain), O.none)
  const oETHClient = useObservableState(clientByChain$(ETHChain), O.none)
  const oBTCClient = useObservableState(clientByChain$(BTCChain), O.none)
  const oBCHClient = useObservableState(clientByChain$(BCHChain), O.none)
  const oTHORClient = useObservableState(clientByChain$(THORChain), O.none)
  const oLTCClient = useObservableState(clientByChain$(LTCChain), O.none)
  const oDOGEClient = useObservableState(clientByChain$(DOGEChain), O.none)

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
      case DOGEChain:
        FP.pipe(oDOGEClient, O.map(openExplorerAddressUrl))
        break
      default:
        console.warn(`Chain ${chain} has not been implemented`)
    }
  }

  const thorLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        thorLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, thorLedgerAddressRD]
  )

  const bnbLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        bnbLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, bnbLedgerAddressRD]
  )

  const btcLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        btcLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, btcLedgerAddressRD]
  )

  const ltcLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        ltcLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, ltcLedgerAddressRD]
  )

  const walletAccounts$ = useMemo(() => {
    const thorWalletAccount$ = walletAccount$({
      addressUI$: thorAddressUI$,
      ledgerAddress: thorLedgerWalletAddress,
      chain: THORChain
    })
    const btcWalletAccount$ = walletAccount$({
      addressUI$: btcAddressUI$,
      ledgerAddress: btcLedgerWalletAddress,
      chain: BTCChain
    })
    const ethWalletAccount$ = walletAccount$({ addressUI$: ethAddressUI$, chain: ETHChain })
    const bnbWalletAccount$ = walletAccount$({
      addressUI$: bnbAddressUI$,
      ledgerAddress: bnbLedgerWalletAddress,
      chain: BNBChain
    })
    const bchWalletAccount$ = walletAccount$({ addressUI$: bchAddressUI$, chain: BCHChain })
    const ltcWalletAccount$ = walletAccount$({
      addressUI$: ltcAddressUI$,
      ledgerAddress: ltcLedgerWalletAddress,
      chain: LTCChain
    })
    const dogeWalletAccount$ = walletAccount$({ addressUI$: dogeAddressUI$, chain: DOGEChain })

    return FP.pipe(
      // combineLatest is for the future additional accounts
      Rx.combineLatest(
        filterEnabledChains({
          THOR: [thorWalletAccount$],
          BTC: [btcWalletAccount$],
          ETH: [ethWalletAccount$],
          BNB: [bnbWalletAccount$],
          BCH: [bchWalletAccount$],
          LTC: [ltcWalletAccount$],
          DOGE: [dogeWalletAccount$]
        })
      ),
      RxOp.map(A.filter(O.isSome)),
      RxOp.map(sequenceTOptionFromArray)
    )
  }, [
    thorAddressUI$,
    thorLedgerWalletAddress,
    btcAddressUI$,
    btcLedgerWalletAddress,
    ethAddressUI$,
    bnbAddressUI$,
    bnbLedgerWalletAddress,
    bchAddressUI$,
    ltcAddressUI$,
    ltcLedgerWalletAddress,
    dogeAddressUI$
  ])
  const walletAccounts = useObservableState(walletAccounts$, O.none)

  return (
    <WalletSettings
      network={network}
      runeNativeAddress={runeNativeAddress}
      lockWallet={lock}
      removeKeystore={removeKeystore}
      exportKeystore={exportKeystore}
      addLedgerAddress={addLedgerAddressHandler}
      verifyLedgerAddress={verifyLedgerAddressHandler}
      removeLedgerAddress={removeLedgerAddressHandler}
      phrase={phrase}
      walletAccounts={walletAccounts}
      clickAddressLinkHandler={clickAddressLinkHandler}
      validatePassword$={validatePassword$}
    />
  )
}
