import { Story, Meta } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { AssetBNB } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_TESTNET } from '../../../shared/mock/address'
import { eqString } from '../../helpers/fp/eq'
import { CustomAddressInput, CustomAddressInputProps } from './CustomAddressInput'

const bnbAddress = BNB_ADDRESS_TESTNET

const defaultProps: CustomAddressInputProps = {
  asset: AssetBNB,
  address: bnbAddress,
  onClickOpenAddress: () => console.log('open address in explorer'),
  onChangeAddress: () => console.log('address changed'),
  addressValidator: (address: Address) => eqString.equals(address, bnbAddress)
}
export const StoryDefault: Story = () => <CustomAddressInput {...defaultProps} />
StoryDefault.storyName = 'default'

const meta: Meta = {
  component: CustomAddressInput,
  title: 'Components/CustomAddressInput'
}

export default meta
