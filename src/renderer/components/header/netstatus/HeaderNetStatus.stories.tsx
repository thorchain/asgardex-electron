import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta } from '@storybook/react'

import { HeaderNetStatus as Component } from './HeaderNetStatus'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderNetStatus',
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
    midgardStatus: RD.initial,
    mimirStatus: RD.initial,
    midgardUrl: RD.initial,
    thorchainUrl: 'thorchain-url'
  }
}

export default meta
