import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

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
    },
    wallets: [
      { id: 0, name: 'wallet 0', selected: false },
      { id: 1, name: 'wallet 1', selected: false },
      { id: 2, name: 'wallet 2', selected: true },
      { id: 3, name: 'wallet 3', selected: false }
    ],
    changeKeystore$: (_) => Rx.of(RD.initial)
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
