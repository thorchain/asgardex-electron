import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import AssetDetails from './AssetDetails'

const address = O.some('bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m')

storiesOf('Wallet/AssetsDetails', module)
  .add('BNB', () => {
    return (
      <AssetDetails txsRD={RD.initial} balancesRD={RD.initial} address={address} asset={O.some(ASSETS_TESTNET.BNB)} />
    )
  })
  .add('RUNE', () => {
    return (
      <AssetDetails txsRD={RD.initial} balancesRD={RD.initial} address={address} asset={O.some(ASSETS_TESTNET.RUNE)} />
    )
  })
