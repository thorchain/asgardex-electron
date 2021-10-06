import React from 'react'

import { Meta } from '@storybook/react'
import { BNBChain } from '@xchainjs/xchain-util'

import { AccountAddressSelector, WalletAddress } from './AccountAddressSelector'

const addresses: WalletAddress[] = [
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
    selectedAddress={addresses[0]}
    onChangeAddress={() => console.log('change index')}
  />
)

const meta: Meta = {
  component: AccountAddressSelector,
  title: 'AccountAddressSelector'
}

export default meta
