import { useCallback } from 'react'

import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { KeystoreId } from '../../shared/api/types'
import { EthDerivationMode } from '../../shared/ethereum/types'
import { WalletAddress } from '../../shared/wallet/types'
import { useWalletContext } from '../contexts/WalletContext'
import { KeystoreLedgerAddress } from '../services/wallet/types'
import { keystoreLedgerAddressToWalletAddress } from '../services/wallet/util'
import { useNetwork } from './useNetwork'

export const useLedger = (chain: Chain, id: KeystoreId) => {
  const { network } = useNetwork()

  const { askLedgerAddress$, getLedgerAddress$, verifyLedgerAddress$, removeLedgerAddress } = useWalletContext()

  const verifyAddress = useCallback(
    (walletIndex: number, ethDerivationMode: O.Option<EthDerivationMode>) =>
      verifyLedgerAddress$({ chain, network, walletIndex, ethDerivationMode }),
    [chain, verifyLedgerAddress$, network]
  )
  const removeAddress = useCallback(
    () => removeLedgerAddress({ id, chain, network }),
    [removeLedgerAddress, chain, network, id]
  )
  const [address] = useObservableState<O.Option<WalletAddress>>(
    () =>
      FP.pipe(
        getLedgerAddress$(chain),
        // KeystoreLedgerAddress -> WalletAddress
        RxOp.map<O.Option<KeystoreLedgerAddress>, O.Option<WalletAddress>>(
          FP.flow(O.map(keystoreLedgerAddressToWalletAddress))
        ),
        // RxOp.map<KeystoreLedgerAddress, WalletAddress>(),
        RxOp.shareReplay(1)
      ),
    O.none
  )

  const askAddress = useCallback(
    (walletIndex: number, ethDerivationMode: O.Option<EthDerivationMode>) =>
      askLedgerAddress$({ id, chain, network, walletIndex, ethDerivationMode }),
    [askLedgerAddress$, chain, id, network]
  )

  return {
    askAddress,
    verifyAddress,
    removeAddress,
    address
  }
}
