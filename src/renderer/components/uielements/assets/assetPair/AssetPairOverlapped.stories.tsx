import React from 'react'

import { radios, withKnobs } from '@storybook/addon-knobs'
import { RadiosTypeOptionsProp } from '@storybook/addon-knobs/dist/ts3.9/components/types'
import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { Size } from '../assetIcon/AssetIcon.types'
import { AssetPairOverlapped } from './AssetPairOverlapped'

const sizeOptions: RadiosTypeOptionsProp<Size> = {
  small: 'small',
  big: 'big',
  normal: 'normal',
  large: 'large'
}

storiesOf('Components/assets/AssetPairOverlapped', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const size = radios('size', sizeOptions, 'small')

    return (
      <div>
        <div style={{ display: 'flex' }}>
          <AssetPairOverlapped asset={AssetBNB} target={ASSETS_MAINNET.BOLT} size={size} network="testnet" />
          <AssetPairOverlapped asset={AssetBNB} target={AssetRuneNative} size={size} network="testnet" />
          <AssetPairOverlapped asset={AssetBNB} target={ASSETS_MAINNET.FTM} size={size} network="testnet" />
          <AssetPairOverlapped asset={AssetBNB} target={ASSETS_MAINNET.TOMO} size={size} network="testnet" />
        </div>
      </div>
    )
  })
