import { useMemo } from 'react'

import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { THORChain, unsafeChainFromAsset } from '../../shared/utils/chain'
import { isLedgerWallet } from '../../shared/utils/guard'
import { WalletType } from '../../shared/wallet/types'
import { useChainContext } from '../contexts/ChainContext'
import { useWalletContext } from '../contexts/WalletContext'
import { INITIAL_SYM_DEPOSIT_ADDRESSES } from '../services/chain/const'
import { SymDepositAddresses } from '../services/chain/types'
import { ledgerAddressToWalletAddress } from '../services/wallet/util'

/**
 * Hook to provide wallet addresses needed for sym. deposit
 *
 * As always: Use it at `view` level only (not in components)
 */
export const useSymDepositAddresses = ({
  asset: oAsset,
  assetWalletType,
  runeWalletType
}: {
  asset: O.Option<Asset>
  assetWalletType: WalletType
  runeWalletType: WalletType
}) => {
  const { addressByChain$ } = useChainContext()

  const { getLedgerAddress$ } = useWalletContext()

  const assetKeystoreAddress$ = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => Rx.of(O.none),
          (asset) => {
            const chain = unsafeChainFromAsset(asset)
            return addressByChain$(chain)
          }
        )
      ),

    [addressByChain$, oAsset]
  )

  // Track both keystore addresses at once to update global state once at once
  const [{ asset: assetKeystoreAddress, rune: runeKeystoreAddress }]: [SymDepositAddresses, unknown] =
    useObservableState(
      () =>
        FP.pipe(
          Rx.combineLatest([assetKeystoreAddress$, addressByChain$(THORChain)]),
          RxOp.switchMap(([asset, rune]) =>
            Rx.of({
              asset,
              rune
            })
          )
        ),
      INITIAL_SYM_DEPOSIT_ADDRESSES
    )

  const [assetLedgerAddress] = useObservableState(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => Rx.of(O.none),
          (asset) => {
            const chain = unsafeChainFromAsset(asset)
            return FP.pipe(getLedgerAddress$(chain), RxOp.map(O.map(ledgerAddressToWalletAddress)))
          }
        )
      ),
    O.none
  )

  const [runeLedgerAddress] = useObservableState(
    () => FP.pipe(getLedgerAddress$(THORChain), RxOp.map(O.map(ledgerAddressToWalletAddress))),
    O.none
  )

  const symDepositAddresses = {
    asset: isLedgerWallet(assetWalletType) ? assetLedgerAddress : assetKeystoreAddress,
    rune: isLedgerWallet(runeWalletType) ? runeLedgerAddress : runeKeystoreAddress
  }

  return {
    addresses: symDepositAddresses
  }
}
