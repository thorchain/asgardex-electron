import React from 'react'

import { radios } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { AssetIcon } from './AssetIcon'
import { Size } from './AssetIcon.types'

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
        <AssetIcon asset={AssetBNB} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.BOLT} size={size} />
        <AssetIcon asset={AssetRuneNative} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.FTM} size={size} />
        <AssetIcon asset={ASSETS_MAINNET.TOMO} size={size} />
      </div>
    </div>
  )
})
