import { ComponentMeta } from '@storybook/react'

import { BaseButton as Component, BaseButtonProps } from './BaseButton'

export const BaseButton = ({ size, loading, disabled, font, children }: BaseButtonProps) => (
  <Component size={size} loading={loading} font={font} disabled={disabled}>
    {children}
  </Component>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/BaseButton',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'normal', 'large']
      }
    },
    font: {
      control: {
        type: 'select',
        options: ['normal', 'semi', 'bold']
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
    font: 'normal',
    loading: false,
    disabled: false,
    uppercase: true
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
