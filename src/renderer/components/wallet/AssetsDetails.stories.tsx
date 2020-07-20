import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import AssetDetails from './AssetDetails'

storiesOf('Wallet/AssetsDetails', module).add('default', () => {
  return (
    <AssetDetails
      txsRD={RD.initial}
      balance={O.some(assetAmount(1.23))}
      address={O.some('bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m')}
      asset={O.some(ASSETS_TESTNET.RUNE)}
      openExternal={(url: string) => Promise.resolve(console.log(`open external ${url}`))}
    />
  )
})
