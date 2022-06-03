/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  DOGEChain,
  ETHChain,
  LTCChain,
  TerraChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { WalletAddress } from '../../../shared/wallet/types'
import { WalletSettings, UnlockWalletSettings } from '../../components/settings'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinCashContext } from '../../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useDogeContext } from '../../contexts/DogeContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
import { useTerraContext } from '../../contexts/TerraContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import {
  filterEnabledChains,
  isBchChain,
  isDogeChain,
  isBnbChain,
  isBtcChain,
  isLtcChain,
  isThorChain,
  isTerraChain,
  isEthChain
} from '../../helpers/chainHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { useLedger } from '../../hooks/useLedger'
import * as walletRoutes from '../../routes/wallet'
import { DEFAULT_NETWORK } from '../../services/const'
import { WalletAddressAsync } from '../../services/wallet/types'
import { isLocked, hasImportedKeystore, ledgerErrorIdToI18n } from '../../services/wallet/util'
import { getPhrase } from '../../services/wallet/util'
import { walletAccount$ } from './WalletSettingsView.helper'

export const WalletSettingsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    keystoreService: { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ }
  } = useWalletContext()

  const keystore = useObservableState(keystore$, O.none)

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { address$: thorAddressUI$ } = useThorchainContext()
  const { addressUI$: bnbAddressUI$ } = useBinanceContext()
  const { addressUI$: ethAddressUI$ } = useEthereumContext()
  const { addressUI$: btcAddressUI$ } = useBitcoinContext()
  const { addressUI$: ltcAddressUI$ } = useLitecoinContext()
  const { addressUI$: bchAddressUI$ } = useBitcoinCashContext()
  const { addressUI$: dogeAddressUI$ } = useDogeContext()
  const { addressUI$: terraAddressUI$ } = useTerraContext()
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

  const {
    askAddress: askLedgerBchAddress,
    verifyAddress: verifyLedgerBchAddress,
    address: bchLedgerAddressRD,
    removeAddress: removeLedgerBchAddress
  } = useLedger(BCHChain)

  const {
    askAddress: askLedgerDOGEAddress,
    verifyAddress: verifyLedgerDOGEAddress,
    address: dogeLedgerAddressRD,
    removeAddress: removeLedgerDOGEAddress
  } = useLedger(DOGEChain)

  const {
    askAddress: askLedgerTerraAddress,
    verifyAddress: verifyLedgerTerraAddress,
    address: terraLedgerAddressRD,
    removeAddress: removeLedgerTerraAddress
  } = useLedger(TerraChain)

  const {
    askAddress: askLedgerEthAddress,
    verifyAddress: verifyLedgerEthAddress,
    address: ethLedgerAddressRD,
    removeAddress: removeLedgerEthAddress
  } = useLedger(ETHChain)

  const addLedgerAddressHandler = (chain: Chain, walletIndex: number) => {
    if (isThorChain(chain)) return askLedgerThorAddress(walletIndex)
    if (isBnbChain(chain)) return askLedgerBnbAddress(walletIndex)
    if (isBtcChain(chain)) return askLedgerBtcAddress(walletIndex)
    if (isLtcChain(chain)) return askLedgerLtcAddress(walletIndex)
    if (isBchChain(chain)) return askLedgerBchAddress(walletIndex)
    if (isDogeChain(chain)) return askLedgerDOGEAddress(walletIndex)
    if (isTerraChain(chain)) return askLedgerTerraAddress(walletIndex)
    if (isEthChain(chain)) return askLedgerEthAddress(walletIndex)

    return FP.constVoid
  }

  const verifyLedgerAddressHandler = async (chain: Chain, walletIndex: number) => {
    if (isThorChain(chain)) return verifyLedgerThorAddress(walletIndex)
    if (isBnbChain(chain)) return verifyLedgerBnbAddress(walletIndex)
    if (isBtcChain(chain)) return verifyLedgerBtcAddress(walletIndex)
    if (isLtcChain(chain)) return verifyLedgerLtcAddress(walletIndex)
    if (isBchChain(chain)) return verifyLedgerBchAddress(walletIndex)
    if (isDogeChain(chain)) return verifyLedgerDOGEAddress(walletIndex)
    if (isTerraChain(chain)) return verifyLedgerTerraAddress(walletIndex)
    if (isEthChain(chain)) return verifyLedgerEthAddress(walletIndex)

    return false
  }

  const removeLedgerAddressHandler = (chain: Chain) => {
    if (isThorChain(chain)) return removeLedgerThorAddress()
    if (isBnbChain(chain)) return removeLedgerBnbAddress()
    if (isBtcChain(chain)) return removeLedgerBtcAddress()
    if (isLtcChain(chain)) return removeLedgerLtcAddress()
    if (isBchChain(chain)) return removeLedgerBchAddress()
    if (isDogeChain(chain)) return removeLedgerDOGEAddress()
    if (isTerraChain(chain)) return removeLedgerTerraAddress()
    if (isEthChain(chain)) return removeLedgerEthAddress()

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
  const oTerraClient = useObservableState(clientByChain$(TerraChain), O.none)

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
      case TerraChain:
        FP.pipe(oTerraClient, O.map(openExplorerAddressUrl))
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

  const bchLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        bchLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, bchLedgerAddressRD]
  )

  const dogeLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        dogeLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, dogeLedgerAddressRD]
  )

  const terraLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        terraLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, terraLedgerAddressRD]
  )

  const ethLedgerWalletAddress: WalletAddressAsync = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        ethLedgerAddressRD,
        RD.mapLeft(({ errorId, msg }) => Error(`${ledgerErrorIdToI18n(errorId, intl)} (${msg})`))
      )
    }),
    [intl, ethLedgerAddressRD]
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
    const ethWalletAccount$ = walletAccount$({
      addressUI$: ethAddressUI$,
      ledgerAddress: ethLedgerWalletAddress,
      chain: ETHChain
    })
    const bnbWalletAccount$ = walletAccount$({
      addressUI$: bnbAddressUI$,
      ledgerAddress: bnbLedgerWalletAddress,
      chain: BNBChain
    })
    const bchWalletAccount$ = walletAccount$({
      addressUI$: bchAddressUI$,
      ledgerAddress: bchLedgerWalletAddress,
      chain: BCHChain
    })
    const ltcWalletAccount$ = walletAccount$({
      addressUI$: ltcAddressUI$,
      ledgerAddress: ltcLedgerWalletAddress,
      chain: LTCChain
    })
    const dogeWalletAccount$ = walletAccount$({
      addressUI$: dogeAddressUI$,
      ledgerAddress: dogeLedgerWalletAddress,
      chain: DOGEChain
    })
    const terraWalletAccount$ = walletAccount$({
      addressUI$: terraAddressUI$,
      ledgerAddress: terraLedgerWalletAddress,
      chain: TerraChain
    })

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
          DOGE: [dogeWalletAccount$],
          TERRA: [terraWalletAccount$]
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
    bchLedgerWalletAddress,
    ltcAddressUI$,
    ltcLedgerWalletAddress,
    dogeAddressUI$,
    dogeLedgerWalletAddress,
    terraAddressUI$,
    terraLedgerWalletAddress,
    ethAddressUI$,
    ethLedgerWalletAddress
  ])
  const walletAccounts = useObservableState(walletAccounts$, O.none)

  const noAccess = useMemo(() => isLocked(keystore) || !hasImportedKeystore(keystore), [keystore])

  const unlockWalletHandler = useCallback(() => {
    navigate(walletRoutes.base.path(location.pathname))
  }, [])

  return noAccess ? (
    <UnlockWalletSettings keystore={keystore} unlockHandler={unlockWalletHandler} />
  ) : (
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
