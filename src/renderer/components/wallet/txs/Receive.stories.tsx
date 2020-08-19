import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { WALLET_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { ASSETS_TESTNET } from '../../../../shared/mock/assets'
import Receive from './Receive'

storiesOf('Wallet/Receive', module)
  .add('default', () => {
    return <Receive address={O.some(WALLET_ADDRESS_TESTNET)} asset={O.some(ASSETS_TESTNET.BNB)} />
  })
  .add('no address, no asset', () => {
    return <Receive address={O.none} asset={O.none} />
  })
