import React from 'react'

import { radios, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import { Size } from '../coinIcon/types'
import Coin from './Coin'

type SizeOptions = Record<Size, Size>

const sizeOptions: SizeOptions = {
  small: 'small',
  big: 'big',
  normal: 'normal',
  large: 'large'
}

storiesOf('Components/Coins/Coin', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const size = radios('size', sizeOptions, 'small')

    return (
      <div>
        <div style={{ display: 'flex' }}>
          <Coin asset={ASSETS_MAINNET.BNB} size={size} />
          <Coin asset={ASSETS_MAINNET.BOLT} size={size} />
          <Coin asset={ASSETS_MAINNET.RUNE} size={size} />
          <Coin asset={ASSETS_MAINNET.FTM} size={size} />
          <Coin asset={ASSETS_MAINNET.TOMO} size={size} />
        </div>
        <div style={{ display: 'flex' }}>
          <Coin asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.BOLT} size={size} />
          <Coin asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.RUNE} size={size} />
          <Coin asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.FTM} size={size} />
          <Coin asset={ASSETS_MAINNET.BNB} target={ASSETS_MAINNET.TOMO} size={size} />
        </div>
      </div>
    )
  })
