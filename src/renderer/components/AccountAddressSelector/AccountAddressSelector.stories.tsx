import React from 'react'

import { Address } from '@xchainjs/xchain-client'
import { BNBChain } from '@xchainjs/xchain-util'

import { WalletType } from '../../services/wallet/types'
import { AccountAddressSelector } from './AccountAddressSelector'

const addresses = [
  {
    walletAddress: 'bnb123123121' as Address,
    walletType: 'ledger' as WalletType,
    chain: BNBChain
  },
  {
    walletAddress: 'bnb123123122' as Address,
    walletType: 'ledger' as WalletType,
    chain: BNBChain
  },
  {
    walletAddress: 'bnb123123123' as Address,
    walletType: 'keystore' as WalletType,
    chain: BNBChain
  }
]

export const Default = () => (
  <AccountAddressSelector addresses={addresses} network={'testnet'} selectedAddress={addresses[0]} />
)

export default {
  title: 'AccountAddressSelector'
}
