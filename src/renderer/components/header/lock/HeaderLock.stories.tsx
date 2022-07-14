import { ComponentMeta } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderLock as Component } from './HeaderLock'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderLock',
  argTypes: {
    isDesktopView: {
      name: 'isDesktopView',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  },
  args: {
    keystore: O.none
  }
}

export default meta
