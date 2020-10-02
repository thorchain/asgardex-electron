import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { ASSETS_TESTNET } from '../../../../shared/mock/assets'
import AssetDetails from './AssetDetails'

const address = O.some(BNB_ADDRESS_TESTNET)

storiesOf('Wallet/AssetsDetails', module)
  .add('BNB', () => {
    return (
      <AssetDetails txsPageRD={RD.initial} assetsWB={O.none} address={address} asset={O.some(ASSETS_TESTNET.BNB)} />
    )
  })
  .add('RUNE', () => {
    return (
      <AssetDetails txsPageRD={RD.initial} assetsWB={O.none} address={address} asset={O.some(ASSETS_TESTNET.RUNE)} />
    )
  })
