import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBTC, AssetRuneNative, assetToBase, baseAmount, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../shared/mock/wallet'
import { ONE_BN } from '../../const'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import { Swap, SwapProps } from './Swap'

/* Mock all (default) data needed by `Swap` commponent */
const defaultProps: SwapProps = {
  availableAssets: [
    { asset: AssetBTC, priceRune: bn('56851.67420275761') },
    { asset: AssetRuneNative, priceRune: ONE_BN }
  ],
  sourceAsset: O.some(AssetRuneNative),
  targetAsset: O.some(AssetBTC),
  sourcePoolAddress: O.some('pool-address'),
  // mock successfull result of swap$
  swap$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('swap$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of({ ...INITIAL_SWAP_STATE, step: 3, txRD: RD.success('tx-hash'), txHash: O.some('tx-hash') })
      )
    ),
  poolDetails: [
    {
      asset: 'BNB.BNB',
      assetDepth: '3403524249',
      assetPrice: '25.249547241877167',
      poolAPY: '0',
      poolSlipAverage: '0',
      runeDepth: '85937446314',
      status: 'available',
      swappingTxCount: '0',
      units: '200000000000',
      volume24h: '0'
    },
    {
      asset: 'BTC.BTC',
      assetDepth: '17970413',
      assetPrice: '56851.67420275761',
      poolAPY: '0',
      poolSlipAverage: '0',
      runeDepth: '1021648065165',
      status: 'available',
      swappingTxCount: '0',
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
  reloadBalances: () => console.log('reloadBalances'),
  fees: RD.success({ source: baseAmount(10000000), target: baseAmount(3000) }),
  targetWalletAddress: O.some('wallet-address'),
  onChangePath: (path) => console.log('change path', path)
}

export const StoryDefault: Story = () => <Swap {...defaultProps} />
StoryDefault.storyName = 'default'

const meta: Meta = {
  component: Swap,
  title: 'Components/Swap'
}

export default meta
