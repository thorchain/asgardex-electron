import { ComponentMeta } from '@storybook/react'

import baseMeta from './BaseButton.stories'
import { BorderButton as Component, Props } from './BorderButton'

export const BorderButton = ({ children, ...otherProps }: Props) => <Component {...otherProps}>{children}</Component>

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/BorderButton',
  argTypes: {
    ...baseMeta.argTypes,
    color: {
      name: 'color',
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error', 'neutral']
      }
    }
  },
  args: {
    ...baseMeta.args,
    color: 'primary'
  },
  decorators: baseMeta.decorators
}

export default meta
