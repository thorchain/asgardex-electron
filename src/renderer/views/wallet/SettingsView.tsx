import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import { BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
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
import { filterEnabledChains, isThorChain } from '../../helpers/chainHelper'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { useLedger } from '../../hooks/useLedger'
import { DEFAULT_NETWORK } from '../../services/const'
import { ledgerErrorIdToI18n } from '../../services/wallet/ledger'
import { WalletAddress } from '../../services/wallet/types'
import { getPhrase } from '../../services/wallet/util'
import { ClientSettingsView } from './CllientSettingsView'
import { walletAccount$ } from './SettingsView.helper'

export const SettingsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ } = keystoreService
  const { network$ } = useAppContext()

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { clientByChain$ } = useChainContext()

  const phrase$ = useMemo(() => FP.pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const { addressUI$: bnbAddressUI$ } = useBinanceContext()
  const { addressUI$: ethAddressUI$ } = useEthereumContext()
  const { addressUI$: btcAddressUI$ } = useBitcoinContext()
  const { address$: thorAddressUI$ } = useThorchainContext()
  const { addressUI$: ltcAddressUI$ } = useLitecoinContext()
  const { addressUI$: bchAddressUI$ } = useBitcoinCashContext()

  const {
    askAddress: askLedgerThorAddress,
    address: thorLedgerAddressRD,
    removeAddress: removeLedgerThorAddress
  } = useLedger(THORChain)

  const addLedgerAddressHandler = (chain: Chain) => {
    if (isThorChain(chain)) return askLedgerThorAddress()

    return FP.constVoid
  }

  const removeLedgerAddressHandler = (chain: Chain) => {
    if (isThorChain(chain)) return removeLedgerThorAddress()

    return FP.constVoid
  }

  const oRuneNativeAddress = useObservableState(thorAddressUI$, O.none)
  const runeNativeAddress = FP.pipe(
    oRuneNativeAddress,
    O.getOrElse(() => '')
  )

  const thorLedgerWalletAddress: WalletAddress = useMemo(
    () => ({
      type: 'ledger',
      address: FP.pipe(
        thorLedgerAddressRD,
        RD.mapLeft((errorId) => Error(ledgerErrorIdToI18n(errorId, intl)))
      )
    }),
    [intl, thorLedgerAddressRD]
  )

  const walletAccounts$ = useMemo(() => {
    const thorWalletAccount$ = walletAccount$({
      addressUI$: thorAddressUI$,
      ledgerAddress: thorLedgerWalletAddress,
      chain: THORChain
    })
    const btcWalletAccount$ = walletAccount$({ addressUI$: btcAddressUI$, chain: BTCChain })
    const ethWalletAccount$ = walletAccount$({ addressUI$: ethAddressUI$, chain: ETHChain })
    const bnbWalletAccount$ = walletAccount$({ addressUI$: bnbAddressUI$, chain: BNBChain })
    const bchWalletAccount$ = walletAccount$({ addressUI$: bchAddressUI$, chain: BCHChain })
    const ltcWalletAccount$ = walletAccount$({ addressUI$: ltcAddressUI$, chain: LTCChain })

    return FP.pipe(
      // combineLatest is for the future additional accounts
      Rx.combineLatest(
        filterEnabledChains({
          THOR: [thorWalletAccount$],
          BTC: [btcWalletAccount$],
          ETH: [ethWalletAccount$],
          BNB: [bnbWalletAccount$],
          BCH: [bchWalletAccount$],
          LTC: [ltcWalletAccount$]
        })
      ),
      RxOp.map(A.filter(O.isSome)),
      RxOp.map(sequenceTOptionFromArray)
    )
  }, [
    thorAddressUI$,
    thorLedgerWalletAddress,
    btcAddressUI$,
    ethAddressUI$,
    bnbAddressUI$,
    bchAddressUI$,
    ltcAddressUI$
  ])
  const walletAccounts = useObservableState(walletAccounts$, O.none)

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
        <Col span={24}>
          <Settings
            selectedNetwork={network}
            lockWallet={lock}
            removeKeystore={removeKeystore}
            exportKeystore={exportKeystore}
            addLedgerAddress={addLedgerAddressHandler}
            removeLedgerAddress={removeLedgerAddressHandler}
            runeNativeAddress={runeNativeAddress}
            walletAccounts={walletAccounts}
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
