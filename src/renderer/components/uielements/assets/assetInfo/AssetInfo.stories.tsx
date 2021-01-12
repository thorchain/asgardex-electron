import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { AssetInfo } from './AssetInfo'

storiesOf('Wallet/AssetInfo', module)
  .add('default', () => {
    return <AssetInfo assetsWB={O.none} asset={O.some(AssetRuneNative)} />
  })
  .add('w/o price', () => {
    return <AssetInfo asset={O.some(AssetRuneNative)} />
  })
