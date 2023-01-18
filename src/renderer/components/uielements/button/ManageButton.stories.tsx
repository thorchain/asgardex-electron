import { ComponentMeta } from '@storybook/react'

import { AssetRuneNative } from '../../../../shared/utils/asset'
import { ManageButton as Component, Props } from './ManageButton'

export const ManageButton = (args: Props) => <Component {...args} />

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/ManageButton',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'normal', 'large']
      }
    }
  },
  args: {
    isTextView: true,
    asset: AssetRuneNative,
    disabled: false,
    size: 'normal'
  }
}

export default meta
