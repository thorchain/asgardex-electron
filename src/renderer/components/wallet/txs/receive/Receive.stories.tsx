import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET } from '../../../../../shared/mock/address'
import { Receive } from './index'

storiesOf('Wallet/Receive', module)
  .add('default', () => {
    return <Receive address={O.some(BNB_ADDRESS_TESTNET)} asset={O.some(AssetBNB)} network="testnet" />
  })
  .add('no address, no asset', () => {
    return <Receive address={O.none} asset={O.none} network="mainnet" />
  })
