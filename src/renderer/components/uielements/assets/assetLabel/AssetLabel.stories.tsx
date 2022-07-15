import { Story, Meta } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'

import { AssetLabel } from './AssetLabel'

export const StoryAsset: Story = () => <AssetLabel asset={AssetBNB} />
StoryAsset.storyName = 'asset'

const meta: Meta = {
  component: AssetLabel,
  title: 'Components/AssetLabel'
}

export default meta
