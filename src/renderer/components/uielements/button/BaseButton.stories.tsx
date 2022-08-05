import { ComponentMeta } from '@storybook/react'

import { BaseButton as Component, BaseButtonProps } from './BaseButton'

export const BaseButton = ({ size, loading, disabled, children }: BaseButtonProps) => (
  <Component size={size} loading={loading} disabled={disabled}>
    {children}
  </Component>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/BaseButton',
  argTypes: {
    size: {
      name: 'size',
      control: {
        type: 'select',
        options: ['small', 'normal', 'large']
      }
    },
    children: {
      control: {
        type: 'text'
      }
    }
  },
  args: {
    children: 'Button label',
    size: 'normal',
    loading: false,
    disabled: false
  },
  decorators: [
    (S) => (
      <div className="flex justify-center bg-white p-50px">
        <S />
      </div>
    )
  ]
}

export default meta
