import React from 'react'

import { withKnobs, radios } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { Size as CoinSize } from '../assetIcon/AssetIcon.types'
import { AssetPair } from './AssetPair'

const sizeOptions: Record<CoinSize, CoinSize> = {
  small: 'small',
  big: 'big',
  normal: 'normal',
  large: 'large'
}

storiesOf('Components/Assets/AssetPair', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const size = radios('size', sizeOptions, 'small')
    return (
      <div style={{ display: 'flex' }}>
        <AssetPair from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size={size} />
        <AssetPair from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size={size} />
      </div>
    )
  })
