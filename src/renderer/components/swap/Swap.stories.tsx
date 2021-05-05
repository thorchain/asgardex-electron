import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { assetAmount, AssetBTC, AssetRuneNative, assetToBase, baseAmount, bn } from '@xchainjs/xchain-util'
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
  keystore: O.none,
  availableAssets: [
    { asset: AssetBTC, assetPrice: bn('56851.67420275761') },
    { asset: AssetRuneNative, assetPrice: ONE_BN }
  ],
  assets: { inAsset: sourceAsset, outAsset: targetAsset },
  poolAddress: O.some({ chain: 'BNB', address: 'vault-address', router: O.some('router-address') }),
  // mock successfull result of swap$
  swap$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('swap$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of<SwapState>({ ...INITIAL_SWAP_STATE, step: 3, swapTx: RD.success('tx-hash'), swap: RD.success(true) })
      )
    ),
  poolDetails: [
    {
      asset: 'BNB.BNB',
      assetDepth: '3403524249',
      assetPrice: '25.249547241877167',
      assetPriceUSD: '272.13',
      poolAPY: '0',
      runeDepth: '85937446314',
      status: 'available',
      units: '200000000000',
      volume24h: '0'
    },
    {
      asset: 'BTC.BTC',
      assetDepth: '17970413',
      assetPrice: '56851.67420275761',
      assetPriceUSD: '59543.12',
      poolAPY: '0',
      runeDepth: '1021648065165',
      status: 'available',
      units: '700389963172',
      volume24h: '0'
    }
  ],
  walletBalances: O.some([
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
        outFee: { amount: baseAmount(1000000), asset: AssetBTC },
        refundFee: { amount: baseAmount(3000000), asset: AssetRuneNative }
      })
    ),
  approveFee$: () => Rx.of(RD.success(baseAmount(10000000))),
  targetWalletAddress: O.some('wallet-address'),
  onChangePath: (path) => console.log('change path', path),
  network: 'testnet',
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
