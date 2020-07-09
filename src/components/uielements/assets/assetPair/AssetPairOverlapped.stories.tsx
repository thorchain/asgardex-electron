import React from 'react'

import { radios, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import { Size } from '../assetIcon/types'
import AssetPairOverlapped from './AssetPairOverlapped'

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
          <AssetPairOverlapped asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.BOLT} size={size} />
          <AssetPairOverlapped asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.RUNE} size={size} />
          <AssetPairOverlapped asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.FTM} size={size} />
          <AssetPairOverlapped asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.TOMO} size={size} />
        </div>
      </div>
    )
  })
