import { Story, Meta } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { AssetBNB } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_TESTNET } from '../../../shared/mock/address'
import { eqString } from '../../helpers/fp/eq'
import { EditableAddress, EditableAddressProps } from './EditableAddress'

const bnbAddress = BNB_ADDRESS_TESTNET

const defaultProps: EditableAddressProps = {
  asset: AssetBNB,
  address: bnbAddress,
  network: 'testnet',
  onClickOpenAddress: () => console.log('open address in explorer'),
  onChangeAddress: () => console.log('address changed'),
  onChangeEditableMode: () => console.log('edit mode changed'),
  addressValidator: (address: Address) => eqString.equals(address, bnbAddress)
}
export const StoryDefault: Story = () => <EditableAddress {...defaultProps} />
StoryDefault.storyName = 'default'

const meta: Meta = {
  component: EditableAddress,
  title: 'Components/EditableAddress'
}

export default meta
