import React from 'react'

import { Story } from '@storybook/react'
import { AssetRuneNative, assetToBase, assetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { AssetInfo } from './AssetInfo'

export const AssetInfoStory: Story<{
  address: string
  balance: number
}> = ({ address, balance }) => {
  return (
    <AssetInfo
      walletInfo={FP.pipe(
        address,
        O.fromPredicate((s) => !!s),
        O.map((address) => ({ address, network: 'testnet' }))
      )}
      asset={O.some(AssetRuneNative)}
      assetsWB={O.some([
        {
          walletType: 'keystore',
          asset: AssetRuneNative,
          amount: assetToBase(assetAmount(balance)),
          walletAddress: ''
        }
      ])}
      network="testnet"
    />
  )
}

AssetInfoStory.args = {
  address: 'tthor18ngerf2l9c6ht7wr83ccyt02s6pws4lff8w0ug',
  balance: 123
}

export default {
  title: 'Wallet/AssetInfo',
  component: AssetInfo
}
