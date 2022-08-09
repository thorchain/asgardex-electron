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
    keystore: AT.keystore
  },
  args: {
    keystore: O.none,
    unlock: (pw: string) => {
      console.log('unlock:', pw)
      return Promise.resolve()
    },
    removeKeystore: () => {
      console.log('removeKeystore')
      return Promise.resolve(1)
    }
  },
  decorators: [
    (Story) => (
      <div className="h-full w-full bg-bg2 p-20">
        <Story />
      </div>
    )
  ]
}

export default meta
