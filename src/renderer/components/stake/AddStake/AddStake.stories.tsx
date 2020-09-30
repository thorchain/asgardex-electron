import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase, AssetRune67C, baseAmount } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import { AddStake } from './AddStake'

export const AddStakeStory = () => {
  return (
    <AddStake
      asset={ASSETS_MAINNET.BNB}
      runeAsset={AssetRune67C}
      assetPrice={bn(59.6)}
      runePrice={bn(1)}
      assetAmount={baseAmount(bn('5787505638239'))}
      runeAmount={baseAmount(bn('342861416698484'))}
      onStake={console.log}
      onChangeAsset={console.log}
      assetData={[
        {
          asset: ASSETS_MAINNET.BNB,
          price: ONE_ASSET_BASE_AMOUNT
        },
        {
          asset: ASSETS_MAINNET.TOMO,
          price: ONE_ASSET_BASE_AMOUNT
        }
      ]}
    />
  )
}

storiesOf('Components/Stake/AddStake', module).add('default', AddStakeStory)
