import { ComponentMeta } from '@storybook/react'

import baseMeta from './BaseButton.stories'
import { FlatButton as Component, Props } from './FlatButton'

export const FlatButton = ({ children, ...otherProps }: Props) => <Component {...otherProps}>{children}</Component>

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/FlatButton',
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
