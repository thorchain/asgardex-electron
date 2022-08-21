import { ComponentMeta } from '@storybook/react'

import baseMeta from './BaseButton.stories'
import { TextButton as Component, Props } from './TextButton'

export const TextButton = ({ children, ...otherProps }: Props) => <Component {...otherProps}>{children}</Component>

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/TextButton',
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
