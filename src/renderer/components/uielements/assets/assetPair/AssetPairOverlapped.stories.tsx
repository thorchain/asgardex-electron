import React from 'react'

import { radios, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { Size } from '../assetIcon/AssetIcon.types'
import { AssetPairOverlapped } from './AssetPairOverlapped'

type SizeOptions = Record<Size, Size>

const sizeOptions: SizeOptions = {
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
          <AssetPairOverlapped asset={AssetBNB} target={ASSETS_MAINNET.BOLT} size={size} />
          <AssetPairOverlapped asset={AssetBNB} target={AssetRuneNative} size={size} />
          <AssetPairOverlapped asset={AssetBNB} target={ASSETS_MAINNET.FTM} size={size} />
          <AssetPairOverlapped asset={AssetBNB} target={ASSETS_MAINNET.TOMO} size={size} />
        </div>
      </div>
    )
  })
