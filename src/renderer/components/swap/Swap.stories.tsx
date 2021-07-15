import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import {
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetRuneNative,
  assetToBase,
  assetToString,
  baseAmount,
  bn,
  BNBChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../shared/mock/wallet'
import { ONE_BN } from '../../const'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import { SwapState } from '../../services/chain/types'
import { AssetWithDecimal } from '../../types/asgardex'
import { Swap, SwapProps } from './Swap'

const sourceAsset: AssetWithDecimal = { asset: AssetRuneNative, decimal: THORCHAIN_DECIMAL }
const targetAsset: AssetWithDecimal = { asset: AssetBTC, decimal: BTC_DECIMAL }

/* Mock all (default) data needed by `Swap` commponent */
const defaultProps: SwapProps = {
  haltedChains: [],
  keystore: O.none,
  availableAssets: [
    { asset: AssetBTC, assetPrice: bn('56851.67420275761') },
    { asset: AssetRuneNative, assetPrice: ONE_BN }
  ],
  assets: { inAsset: sourceAsset, outAsset: targetAsset },
  poolAddress: O.some({
    chain: BNBChain,
    address: 'vault-address',
    router: O.some('router-address'),
    halted: false
  }),
  // mock successfull result of swap$
  swap$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('swap$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of<SwapState>({ ...INITIAL_SWAP_STATE, step: 3, swapTx: RD.success('tx-hash'), swap: RD.success(true) })
      )
    ),
  poolsData: {
    [assetToString(AssetBNB)]: {
      assetBalance: baseAmount(1),
      runeBalance: baseAmount(20)
    },
    [assetToString(AssetBTC)]: {
      assetBalance: baseAmount(1),
      runeBalance: baseAmount(3000)
    }
  },
  walletBalances: {
    balances: O.some([
      {
        asset: AssetRuneNative,
        amount: assetToBase(assetAmount(100)),
        walletType: 'keystore',
        walletAddress: 'wallet-address-rune'
      },
      {
        asset: AssetBTC,
        amount: assetToBase(assetAmount(1)),
        walletType: 'keystore',
        walletAddress: 'wallet-address-btc'
      }
    ]),
    loading: false
  },
  goToTransaction: (txHash) => {
    console.log(txHash)
  },
  // mock password validation
  // Password: "123"
  validatePassword$: mockValidatePassword$,
  reloadFees: () => console.log('reloadFees'),
  reloadApproveFee: () => console.log('reloadFees'),
  reloadBalances: () => console.log('reloadBalances'),
  fees$: () =>
    Rx.of(
      RD.success({
        inFee: { amount: baseAmount(10000000), asset: AssetRuneNative },
        outFee: { amount: baseAmount(1000000), asset: AssetBTC }
      })
    ),
  approveFee$: () => Rx.of(RD.success(baseAmount(10000000))),
  targetWalletAddress: O.some('wallet-address'),
  onChangePath: (path) => console.log('change path', path),
  network: 'testnet',
  slipTolerance: 5,
  changeSlipTolerance: () => console.log('changeSlipTolerance'),
  approveERC20Token$: () => Rx.of(RD.success('txHash')),
  isApprovedERC20Token$: () => Rx.of(RD.success(true)),
  importWalletHandler: () => console.log('import wallet')
}

export const StoryDefault: Story = () => <Swap {...defaultProps} />
StoryDefault.storyName = 'default'

const meta: Meta = {
  component: Swap,
  title: 'Components/Swap'
}

export default meta
