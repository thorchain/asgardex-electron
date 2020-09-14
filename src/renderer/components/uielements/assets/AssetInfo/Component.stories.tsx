import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../../../shared/mock/assets'
import AssetInfo from './Component'

storiesOf('Wallet/AssetInfo', module)
  .add('default', () => {
    return <AssetInfo assetsWB={O.none} asset={O.some(ASSETS_TESTNET.RUNE)} />
  })
  .add('w/o price', () => {
    return <AssetInfo asset={O.some(ASSETS_TESTNET.RUNE)} />
  })
