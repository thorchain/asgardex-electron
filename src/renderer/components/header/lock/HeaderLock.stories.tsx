import { ComponentMeta, StoryFn } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderLock as Component, Props } from './HeaderLock'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderLock',
  argTypes: {
    isDesktopView: {
      name: 'isDesktopView',
      control: {
        type: 'boolean'
      }
    }
  },
  args: {
    keystore: O.none,
    isDesktopView: false
  }
}

export default meta
