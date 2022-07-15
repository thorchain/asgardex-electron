import { ComponentMeta } from '@storybook/react'

import { Input as Component, InputPassword, InputTextArea } from './Input.styles'

const defaultInput: ComponentMeta<typeof InputPassword> = {
  component: InputPassword,
  title: 'Components/Input',
  decorators: [
    (Story) => (
      <div style={{ padding: '15px' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    typevalue: {
      control: {
        type: 'select',
        options: ['normal', 'ghost']
      },
      defaultValue: 'normal'
    },
    color: {
      control: {
        type: 'select',
        options: ['primary', 'success', 'warning', 'error']
      },
      defaultValue: 'primary'
    },
    size: {
      control: {
        type: 'select',
        options: ['small', 'middle', 'large']
      },
      defaultValue: 'middle'
    },
    value: {
      control: {
        type: 'text'
      },
      defaultValue: 'Input Text'
    }
  }
}

export default defaultInput

export const pwInput: ComponentMeta<typeof Component> = {
  component: InputPassword,
  title: 'Components/InputPassword',
  argTypes: { ...defaultInput.argTypes }
}

export const textAreaInput: ComponentMeta<typeof Component> = {
  component: InputTextArea,
  title: 'Components/InputTextArea',
  argTypes: { ...defaultInput.argTypes }
}
