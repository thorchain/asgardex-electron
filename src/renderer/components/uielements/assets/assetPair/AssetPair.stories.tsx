import React from 'react'

import { withKnobs, radios } from '@storybook/addon-knobs'
import { RadiosTypeOptionsProp } from '@storybook/addon-knobs/dist/components/types'
import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { Size as CoinSize } from '../assetIcon/AssetIcon.types'
import { AssetPair } from './AssetPair'

const sizeOptions: RadiosTypeOptionsProp<CoinSize> = {
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
        <AssetPair from={AssetRuneNative} to={AssetBNB} size={size} network="testnet" />
        <AssetPair from={AssetRuneNative} to={AssetBNB} size={size} network="testnet" />
      </div>
    )
  })
