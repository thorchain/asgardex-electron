import React, { useMemo } from 'react'

import { Address, XChainClient } from '@xchainjs/xchain-client'
import { BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Settings } from '../../components/wallet/settings'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { DEFAULT_NETWORK } from '../../services/const'
import { getPhrase } from '../../services/wallet/util'
import { ClientSettingsView } from './CllientSettingsView'

export const SettingsView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { keystore$, lock, removeKeystore, exportKeystore, validatePassword$ } = keystoreService
  const { network$ } = useAppContext()

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { clientByChain$ } = useChainContext()

  const phrase$ = useMemo(() => FP.pipe(keystore$, RxOp.map(getPhrase)), [keystore$])
  const phrase = useObservableState(phrase$, O.none)

  const { address$: thorAddressUI$ } = useThorchainContext()

  const oRuneNativeAddress = useObservableState(thorAddressUI$, O.none)
  const runeNativeAddress = FP.pipe(
    oRuneNativeAddress,
    O.getOrElse(() => '')
  )

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
            runeNativeAddress={runeNativeAddress}
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
