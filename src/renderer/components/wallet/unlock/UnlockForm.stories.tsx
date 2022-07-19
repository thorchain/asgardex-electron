import { ComponentMeta, StoryFn } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import * as AT from '../../../storybook/argTypes'
import { UnlockForm as Component, Props } from './UnlockForm'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/UnlockForm',
  argTypes: {
    keystore: AT.keystore,
    unlock: { action: 'unlock' },
    removeKeystore: { action: 'removeKeystore' }
  },
  args: {
    keystore: O.none
  }
}

export default meta
