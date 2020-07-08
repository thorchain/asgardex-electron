import React from 'react'

import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import AssetPairOverlapped from './AssetPairOverlapped'

storiesOf('Components/Assets/AssetPairOverlapped', module).add('default', () => {
  return (
    <div style={{ display: 'flex' }}>
      <AssetPairOverlapped from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size="small" />
      <AssetPairOverlapped from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size="big" />
    </div>
  )
})
