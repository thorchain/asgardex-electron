import { ComponentMeta } from '@storybook/react'

import baseMeta from './BaseButton.stories'
import { LinkButton as Component, Props } from './LinkButton'

export const LinkButton = ({ children, ...otherProps }: Props) => <Component {...otherProps}>{children}</Component>

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/LinkButton',
  argTypes: {
    ...baseMeta.argTypes,
    color: {
      name: 'color',
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error']
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
