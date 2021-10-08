import React from 'react'

import { Meta } from '@storybook/react'
import { BNBChain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { WalletAddresses } from '../../../shared/wallet/types'
import { AccountAddressSelector } from './AccountAddressSelector'

const addresses: WalletAddresses = [
  {
    address: 'bnb123123121',
    type: 'ledger',
    chain: BNBChain
  },
  {
    address: 'bnb123123122',
    type: 'ledger',
    chain: BNBChain
  },
  {
    address: 'bnb123123123',
    type: 'keystore',
    chain: BNBChain
  }
]

export const Default = () => (
  <AccountAddressSelector
    addresses={addresses}
    network={'testnet'}
    selectedAddress={O.some(addresses[0])}
    onChangeAddress={() => console.log('change index')}
  />
)

const meta: Meta = {
  component: AccountAddressSelector,
  title: 'AccountAddressSelector'
}

export default meta
