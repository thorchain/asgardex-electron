import React from 'react'

import { radios } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import AssetIcon from './AssetIcon'
import { Size } from './types'

type SizeOptions = {
  [key in Size]: Size
}

storiesOf('Components/assets/AssetIcon', module).add('default', () => {
  const sizeOptions: SizeOptions = {
    small: 'small',
    normal: 'normal',
    large: 'large',
    big: 'big'
  }

  const size = radios('size', sizeOptions, 'small')

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <AssetIcon asset={ASSETS_MAINNET.BNB} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.BOLT} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.RUNE} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.FTM} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.TOMO} size={size} />
      </div>
    </div>
  )
})
