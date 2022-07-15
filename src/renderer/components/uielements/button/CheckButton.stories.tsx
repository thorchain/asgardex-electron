import { ComponentMeta } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'

import { CheckButton } from './CheckButton'

type Args = {
  label: string
  disabled: boolean
  isChecked: boolean
  onClicked: FP.Lazy<void>
}

const Template = ({ label, disabled, isChecked, onClicked }: Args) => {
  return (
    <CheckButton disabled={disabled} checked={isChecked} clickHandler={onClicked}>
      {label}
    </CheckButton>
  )
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/button/CheckButton',
  argTypes: {
    label: {
      name: 'Label',
      control: {
        type: 'text'
      },
      defaultValue: 'Label'
    },
    disabled: {
      name: 'disabled',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    isChecked: {
      name: 'isChecked',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    onClicked: {
      action: 'onClicked'
    }
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
        <Story />
      </div>
    )
  ]
}

export default meta
