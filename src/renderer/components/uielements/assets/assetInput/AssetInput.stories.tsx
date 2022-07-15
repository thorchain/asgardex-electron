import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase, BaseAmount, baseAmount } from '@xchainjs/xchain-util'

import { AssetInput } from './AssetInput'

const onChange = (value: BaseAmount) => {
  console.log('value ', value.amount().toString())
}

export const StoryDefault: Story = () => (
  <AssetInput
    title="swap amount"
    status="slip 2%"
    amount={baseAmount(1234500000)}
    maxAmount={baseAmount(1234600000)}
    asset={AssetBNB}
    onChange={onChange}
    maxInfoText={'max balance = balance - swap fees'}
  />
)
StoryDefault.storyName = 'default'

export const StoryDecimal2: Story = () => (
  <AssetInput
    title="amount"
    titleTooltip="Title Tooltip"
    amount={assetToBase(assetAmount(123, 2))}
    maxAmount={assetToBase(assetAmount(124, 2))}
    asset={AssetBNB}
    onChange={onChange}
    maxInfoText={'max balance = balance - swap fees'}
  />
)
StoryDecimal2.storyName = 'decimal 2'

const meta: Meta = {
  component: AssetInput,
  title: 'Components/Assets/AssetInput',
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
