import { Meta } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { MOCK_WALLET_ADDRESSES } from '../../../shared/mock/wallet'
import { AccountAddressSelector } from './AccountAddressSelector'

export const Default = () => (
  <AccountAddressSelector
    addresses={MOCK_WALLET_ADDRESSES}
    network={'testnet'}
    selectedAddress={O.some(MOCK_WALLET_ADDRESSES[0])}
    onChangeAddress={() => console.log('change index')}
  />
)

const meta: Meta = {
  component: AccountAddressSelector,
  title: 'AccountAddressSelector'
}

export default meta
