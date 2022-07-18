import { StoryFn, ComponentMeta } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'

import { AssetLabel as Component } from './AssetLabel'

export const Default: StoryFn = () => <Component asset={AssetBNB} />

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Assets/AssetLabel'
}

export default meta
