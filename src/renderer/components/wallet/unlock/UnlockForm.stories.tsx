import { ComponentMeta } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import * as AT from '../../../storybook/argTypes'
import { UnlockForm as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/UnlockForm',
  argTypes: {
    keystore: AT.keystore
  },
  args: {
    keystore: O.none
  }
}

export default meta
