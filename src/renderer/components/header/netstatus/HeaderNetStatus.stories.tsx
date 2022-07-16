import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'

import { HeaderNetStatus as Component, Props } from './HeaderNetStatus'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderNetStatus',
  args: {
    midgardStatus: RD.initial,
    mimirStatus: RD.initial,
    midgardUrl: RD.initial,
    thorchainUrl: 'thorchain-url',
    isDesktopView: false
  }
}

export default meta
