import { ComponentMeta, StoryFn } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import * as AT from '../../../storybook/argTypes'
import { HeaderLock as Component, Props } from './HeaderLock'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderLock',
  argTypes: {
    keystore: AT.keystore,
    onPress: { action: 'onPress' }
  },
  args: {
    keystore: O.none,
    isDesktopView: false,
    disabled: false
  }
}

export default meta
