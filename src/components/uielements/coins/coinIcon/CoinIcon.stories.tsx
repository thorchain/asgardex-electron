import React from 'react'

import { radios } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import CoinIcon from './CoinIcon'
import { Size } from './types'

type SizeOptions = {
  [key in Size]: Size
}

storiesOf('Components/Coins/CoinIcon', module).add('default', () => {
  const sizeOptions: SizeOptions = {
    small: 'small',
    big: 'big'
  }

  const size = radios('size', sizeOptions, 'small')

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <CoinIcon asset={ASSETS_MAINNET.BNB} size={size} />
        <CoinIcon asset={ASSETS_MAINNET.BOLT} size={size} />
        <CoinIcon asset={ASSETS_MAINNET.RUNE} size={size} />
        <CoinIcon asset={ASSETS_MAINNET.FTM} size={size} />
        <CoinIcon asset={ASSETS_MAINNET.TOMO} size={size} />
      </div>
    </div>
  )
})
