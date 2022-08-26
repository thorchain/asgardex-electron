import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LedgerErrorId } from '../../../shared/api/types'
import { EthDerivationMode } from '../../../shared/ethereum/types'
import { WalletSettings } from '../../components/settings'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinCashContext } from '../../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useCosmosContext } from '../../contexts/CosmosContext'
import { useDogeContext } from '../../contexts/DogeContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
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
  isEthChain,
  isCosmosChain
} from '../../helpers/chainHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { useCollapsedSetting } from '../../hooks/useCollapsedSetting'
import { useKeystoreState } from '../../hooks/useKeystoreState'
import { useKeystoreWallets } from '../../hooks/useKeystoreWallets'
import { useLedger } from '../../hooks/useLedger'
import { useNetwork } from '../../hooks/useNetwork'
import { KeystoreLedgerAddressLD, KeystoreUnlocked, VerifiedLedgerAddressLD } from '../../services/wallet/types'
import { walletAccount$ } from './WalletSettingsView.helper'

type Props = {
  keystoreUnlocked: KeystoreUnlocked
}

export const WalletSettingsView: React.FC<Props> = ({ keystoreUnlocked }): JSX.Element => {
  const { id: keystoreId } = keystoreUnlocked

  const { walletsUI } = useKeystoreWallets()

  const {
    keystoreService: { exportKeystore, validatePassword$ }
  } = useWalletContext()

  const { lock, remove, change$, rename$ } = useKeystoreState()

  const { network } = useNetwork()

  const { collapsed, toggle: toggleCollapse } = useCollapsedSetting('wallet')

  const { address$: thorAddressUI$ } = useThorchainContext()
  const { addressUI$: bnbAddressUI$ } = useBinanceContext()
  const { addressUI$: ethAddressUI$ } = useEthereumContext()
  const { addressUI$: btcAddressUI$ } = useBitcoinContext()
  const { addressUI$: ltcAddressUI$ } = useLitecoinContext()
  const { addressUI$: bchAddressUI$ } = useBitcoinCashContext()
  const { addressUI$: dogeAddressUI$ } = useDogeContext()
  const { addressUI$: cosmosAddressUI$ } = useCosmosContext()

  const {
    askAddress: askLedgerThorAddress,
    verifyAddress: verifyLedgerThorAddress,
    address: oThorLedgerWalletAddress,
    removeAddress: removeLedgerThorAddress
  } = useLedger(THORChain, keystoreId)

  const {
    askAddress: askLedgerBnbAddress,
    verifyAddress: verifyLedgerBnbAddress,
    address: oBnbLedgerWalletAddress,
    removeAddress: removeLedgerBnbAddress
  } = useLedger(BNBChain, keystoreId)

  const {
    askAddress: askLedgerBtcAddress,
    verifyAddress: verifyLedgerBtcAddress,
    address: oBtcLedgerWalletAddress,
    removeAddress: removeLedgerBtcAddress
  } = useLedger(BTCChain, keystoreId)

  const {
    askAddress: askLedgerLtcAddress,
    verifyAddress: verifyLedgerLtcAddress,
    address: oLtcLedgerWalletAddress,
    removeAddress: removeLedgerLtcAddress
  } = useLedger(LTCChain, keystoreId)

  const {
    askAddress: askLedgerBchAddress,
    verifyAddress: verifyLedgerBchAddress,
    address: oBchLedgerWalletAddress,
    removeAddress: removeLedgerBchAddress
  } = useLedger(BCHChain, keystoreId)

  const {
    askAddress: askLedgerDOGEAddress,
    verifyAddress: verifyLedgerDOGEAddress,
    address: oDogeLedgerWalletAddress,
    removeAddress: removeLedgerDOGEAddress
  } = useLedger(DOGEChain, keystoreId)

  const {
    askAddress: askLedgerEthAddress,
    verifyAddress: verifyLedgerEthAddress,
    address: oEthLedgerWalletAddress,
    removeAddress: removeLedgerEthAddress
  } = useLedger(ETHChain, keystoreId)

  const {
    askAddress: askLedgerCosmosAddress,
    verifyAddress: verifyLedgerCosmosAddress,
    address: oCosmosLedgerWalletAddress,
    removeAddress: removeLedgerCosmosAddress
  } = useLedger(CosmosChain, keystoreId)

  const addLedgerAddressHandler = ({
    chain,
    walletIndex,
    ethDerivationMode
  }: {
    chain: Chain
    walletIndex: number
    ethDerivationMode: O.Option<EthDerivationMode>
  }): KeystoreLedgerAddressLD => {
    if (isThorChain(chain)) return askLedgerThorAddress(walletIndex, ethDerivationMode)
    if (isBnbChain(chain)) return askLedgerBnbAddress(walletIndex, ethDerivationMode)
    if (isBtcChain(chain)) return askLedgerBtcAddress(walletIndex, ethDerivationMode)
    if (isLtcChain(chain)) return askLedgerLtcAddress(walletIndex, ethDerivationMode)
    if (isBchChain(chain)) return askLedgerBchAddress(walletIndex, ethDerivationMode)
    if (isDogeChain(chain)) return askLedgerDOGEAddress(walletIndex, ethDerivationMode)
    if (isEthChain(chain)) return askLedgerEthAddress(walletIndex, ethDerivationMode)
    if (isCosmosChain(chain)) return askLedgerCosmosAddress(walletIndex, ethDerivationMode)

    return Rx.of(
      RD.failure({
        errorId: LedgerErrorId.GET_ADDRESS_FAILED,
        msg: `Adding Ledger for ${chain} has not been implemented`
      })
    )
  }

  const verifyLedgerAddressHandler = ({
    chain,
    walletIndex,
    ethDerivationMode
  }: {
    chain: Chain
    walletIndex: number
    ethDerivationMode: O.Option<EthDerivationMode>
  }): VerifiedLedgerAddressLD => {
    if (isThorChain(chain)) return verifyLedgerThorAddress(walletIndex, ethDerivationMode)
    if (isBnbChain(chain)) return verifyLedgerBnbAddress(walletIndex, ethDerivationMode)
    if (isBtcChain(chain)) return verifyLedgerBtcAddress(walletIndex, ethDerivationMode)
    if (isLtcChain(chain)) return verifyLedgerLtcAddress(walletIndex, ethDerivationMode)
    if (isBchChain(chain)) return verifyLedgerBchAddress(walletIndex, ethDerivationMode)
    if (isDogeChain(chain)) return verifyLedgerDOGEAddress(walletIndex, ethDerivationMode)
    if (isEthChain(chain)) return verifyLedgerEthAddress(walletIndex, ethDerivationMode)
    if (isCosmosChain(chain)) return verifyLedgerCosmosAddress(walletIndex, ethDerivationMode)

    return Rx.of(RD.failure(Error(`Ledger address verification for ${chain} has not been implemented`)))
  }

  const removeLedgerAddressHandler = (chain: Chain) => {
    if (isThorChain(chain)) return removeLedgerThorAddress()
    if (isBnbChain(chain)) return removeLedgerBnbAddress()
    if (isBtcChain(chain)) return removeLedgerBtcAddress()
    if (isLtcChain(chain)) return removeLedgerLtcAddress()
    if (isBchChain(chain)) return removeLedgerBchAddress()
    if (isDogeChain(chain)) return removeLedgerDOGEAddress()
    if (isEthChain(chain)) return removeLedgerEthAddress()
    if (isCosmosChain(chain)) return removeLedgerCosmosAddress()

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
  const oCosmosClient = useObservableState(clientByChain$(CosmosChain), O.none)

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
      case CosmosChain:
        FP.pipe(oCosmosClient, O.map(openExplorerAddressUrl))
        break
      default:
        console.warn(`Chain ${chain} has not been implemented`)
    }
  }

  const walletAccounts$ = useMemo(() => {
    const thorWalletAccount$ = walletAccount$({
      addressUI$: thorAddressUI$,
      ledgerAddress: oThorLedgerWalletAddress,
      chain: THORChain
    })
    const btcWalletAccount$ = walletAccount$({
      addressUI$: btcAddressUI$,
      ledgerAddress: oBtcLedgerWalletAddress,
      chain: BTCChain
    })
    const ethWalletAccount$ = walletAccount$({
      addressUI$: ethAddressUI$,
      ledgerAddress: oEthLedgerWalletAddress,
      chain: ETHChain
    })
    const bnbWalletAccount$ = walletAccount$({
      addressUI$: bnbAddressUI$,
      ledgerAddress: oBnbLedgerWalletAddress,
      chain: BNBChain
    })
    const bchWalletAccount$ = walletAccount$({
      addressUI$: bchAddressUI$,
      ledgerAddress: oBchLedgerWalletAddress,
      chain: BCHChain
    })
    const ltcWalletAccount$ = walletAccount$({
      addressUI$: ltcAddressUI$,
      ledgerAddress: oLtcLedgerWalletAddress,
      chain: LTCChain
    })
    const dogeWalletAccount$ = walletAccount$({
      addressUI$: dogeAddressUI$,
      ledgerAddress: oDogeLedgerWalletAddress,
      chain: DOGEChain
    })
    const cosmosWalletAccount$ = walletAccount$({
      addressUI$: cosmosAddressUI$,
      ledgerAddress: oCosmosLedgerWalletAddress,
      chain: CosmosChain
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
          GAIA: [cosmosWalletAccount$]
        })
      ),
      RxOp.map(A.filter(O.isSome)),
      RxOp.map(sequenceTOptionFromArray)
    )
  }, [
    thorAddressUI$,
    oThorLedgerWalletAddress,
    btcAddressUI$,
    oBtcLedgerWalletAddress,
    ethAddressUI$,
    oEthLedgerWalletAddress,
    bnbAddressUI$,
    oBnbLedgerWalletAddress,
    bchAddressUI$,
    oBchLedgerWalletAddress,
    ltcAddressUI$,
    oLtcLedgerWalletAddress,
    dogeAddressUI$,
    oDogeLedgerWalletAddress,
    cosmosAddressUI$,
    oCosmosLedgerWalletAddress
  ])

  const walletAccounts = useObservableState(walletAccounts$, O.none)

  return (
    <WalletSettings
      network={network}
      lockWallet={lock}
      removeKeystoreWallet={remove}
      changeKeystoreWallet$={change$}
      renameKeystoreWallet$={rename$}
      exportKeystore={exportKeystore}
      addLedgerAddress$={addLedgerAddressHandler}
      verifyLedgerAddress$={verifyLedgerAddressHandler}
      removeLedgerAddress={removeLedgerAddressHandler}
      keystoreUnlocked={keystoreUnlocked}
      wallets={walletsUI}
      walletAccounts={walletAccounts}
      clickAddressLinkHandler={clickAddressLinkHandler}
      validatePassword$={validatePassword$}
      collapsed={collapsed}
      toggleCollapse={toggleCollapse}
    />
  )
}
