import { Story, Meta } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'

import { CustomAddressInput, CustomAddressInputProps } from './CustomAddressInput'

const defaultProps: CustomAddressInputProps = {
  asset: AssetBNB,
  address: 'tbnb123123123123',
  onClickOpenAddress: () => console.log('open address in explorer'),
  onChangeAddress: () => console.log('address changed'),
  addressValidator: () => true
}
export const StoryDefault: Story = () => <CustomAddressInput {...defaultProps} />
StoryDefault.storyName = 'default'

const meta: Meta = {
  component: CustomAddressInput,
  title: 'Components/CustomAddressInput'
}

export default meta
