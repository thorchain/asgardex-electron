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

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/button/CheckButton',
  argTypes: {
    onClicked: {
      action: 'onClicked'
    }
  },
  args: {
    label: 'Label',
    disabled: false,
    isChecked: false
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
