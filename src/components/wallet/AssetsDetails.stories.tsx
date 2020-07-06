import React from 'react'

import { storiesOf } from '@storybook/react'

import AssetDetails from './AssetDetails'

storiesOf('Wallet/AssetsDetails', module).add('default', () => {
  return <AssetDetails />
})
