import { ComponentMeta } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { UnlockForm as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/UnlockForm',
  argTypes: {
    keystore: {
      name: 'keystore',
      control: {
        type: 'select',
        options: ['empty', 'locked', 'unlocked'],
        mapping: {
          empty: O.none,
          locked: O.some(O.none),
          unlocked: O.some(O.some({ phrase: 'hello phrase' }))
        }
      },
      defaultValue: 'empty'
    }
  }
}

export default meta
