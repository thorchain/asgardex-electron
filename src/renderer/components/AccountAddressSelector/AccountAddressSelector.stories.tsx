import { ComponentMeta } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { MOCK_WALLET_ADDRESSES } from '../../../shared/mock/wallet'
import { AccountAddressSelector as Component } from './AccountAddressSelector'

export const Default = () => (
  <Component
    addresses={MOCK_WALLET_ADDRESSES}
    network={'testnet'}
    selectedAddress={O.some(MOCK_WALLET_ADDRESSES[0])}
    onChangeAddress={({ address }) => console.log(`change address ${address}`)}
  />
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/AccountAddressSelector'
}

export default meta
