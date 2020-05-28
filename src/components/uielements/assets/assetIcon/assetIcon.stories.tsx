import React from 'react'

import { storiesOf } from '@storybook/react'

import AssetIcon from './assetIcon'

storiesOf('Components/Assets/AssetIcon', module)
  .add('small', () => {
    return (
      <div style={{ display: 'flex' }}>
        <AssetIcon type="bnb" size="small" />
        <AssetIcon type="bolt" size="small" />
        <AssetIcon type="rune" size="small" />
        <AssetIcon type="ankr" size="small" />
        <AssetIcon type="ftm" size="small" />
        <AssetIcon type="tomo" size="small" />
        <AssetIcon type="loki" size="small" />
      </div>
    )
  })
  .add('big', () => {
    return (
      <div style={{ display: 'flex' }}>
        <AssetIcon type="bnb" size="big" />
        <AssetIcon type="bolt" size="big" />
        <AssetIcon type="rune" size="big" />
        <AssetIcon type="ankr" size="big" />
        <AssetIcon type="ftm" size="big" />
        <AssetIcon type="tomo" size="big" />
        <AssetIcon type="blue" size="big" />
        <AssetIcon type="confirm" size="big" />
        <AssetIcon type="loki" size="big" />
      </div>
    )
  })
