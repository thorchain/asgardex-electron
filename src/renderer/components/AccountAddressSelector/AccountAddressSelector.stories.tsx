import React from 'react'

import { Meta } from '@storybook/react'
import { BNBChain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { AccountAddressSelector } from './AccountAddressSelector'
import { AccountAddressSelectorType } from './AccountAddressSelector.types'

const addresses: AccountAddressSelectorType[] = [
  {
    walletAddress: 'bnb123123121',
    walletType: 'ledger',
    chain: BNBChain
  },
  {
    walletAddress: 'bnb123123122',
    walletType: 'ledger',
    chain: BNBChain
  },
  {
    walletAddress: 'bnb123123123',
    walletType: 'keystore',
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
