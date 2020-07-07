import React from 'react'

import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import AssetPair from './AssetPair'
import AssetPairOverlapped from './AssetPairOverlapped'

storiesOf('Components/Assets/AssetPair', module)
  .add('default', () => {
    return (
      <div style={{ display: 'flex' }}>
        <AssetPair from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size="small" />
        <AssetPair from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size="big" />
      </div>
    )
  })
  .add('overlapped', () => {
    return (
      <div style={{ display: 'flex' }}>
        <AssetPairOverlapped from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size="small" />
        <AssetPairOverlapped from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} size="big" />
      </div>
    )
  })
