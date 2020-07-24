import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import Receive from './Receive'

storiesOf('Wallet/Receive', module)
  .add('default', () => {
    return (
      <Receive address={O.some('tbnb1fps02hwdmgh3p49cfawhg3j3mcqk9f3ns6gstt')} asset={O.some(ASSETS_TESTNET.BNB)} />
    )
  })
  .add('no address, no asset', () => {
    return <Receive address={O.none} asset={O.none} />
  })
