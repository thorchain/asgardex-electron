import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../../../shared/mock/assets'
import AssetInfo from './Component'

storiesOf('Wallet/AssetInfo', module)
  .add('default', () => {
    return <AssetInfo balancesRD={RD.initial} asset={O.some(ASSETS_TESTNET.RUNE)} />
  })
  .add('w/o price', () => {
    return <AssetInfo asset={O.some(ASSETS_TESTNET.RUNE)} />
  })
