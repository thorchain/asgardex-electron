import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import { PoolAsset } from '../../../views/pools/types'
import { AddStake } from './AddStake'

export const AddStakeStory = () => {
  return (
    <AddStake
      asset={ASSETS_MAINNET.BOLT}
      runeAsset={PoolAsset.RUNE67C}
      assetPrice={bn(56)}
      runePrice={bn(1)}
      assetAmount={assetToBase(assetAmount(200))}
      runeAmount={assetToBase(assetAmount(200))}
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
