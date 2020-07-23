import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import Receive from './Receive'

storiesOf('Wallet/Receive', module)
  .add('default', () => {
    return <Receive address={O.some('bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m')} asset={O.some(ASSETS_TESTNET.BNB)} />
  })
  .add('no address, no asset', () => {
    return <Receive address={O.none} asset={O.none} />
  })
