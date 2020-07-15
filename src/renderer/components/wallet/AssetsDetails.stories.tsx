import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'

import AssetDetails from './AssetDetails'

storiesOf('Wallet/AssetsDetails', module).add('default', () => {
  return <AssetDetails txsRD={RD.initial} />
})
