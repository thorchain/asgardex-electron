import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, AssetRune67C, AssetBNB, baseAmount, AssetBTC } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AddStake } from './AddStake'

export const AddStakeStory = () => {
  return (
    <AddStake
      asset={AssetBNB}
      runeAsset={AssetRune67C}
      assetPrice={bn(2)}
      runePrice={bn(1)}
      assetBalance={assetToBase(assetAmount(200))}
      runeBalance={assetToBase(assetAmount(100))}
      onStake={console.log}
      onChangeAsset={console.log}
      poolData={{
        assetBalance: baseAmount('1000'),
        runeBalance: baseAmount('2000')
      }}
      priceAsset={AssetRune67C}
      assets={[AssetBNB, AssetBTC, ASSETS_MAINNET.TOMO]}
    />
  )
}

storiesOf('Components/Stake/AddStake', module).add('default', AddStakeStory)
