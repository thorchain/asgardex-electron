import React from 'react'

import { Story, Meta } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'

import { CheckButton } from './CheckButton'

type Args = {
  label: string
  disabled: boolean
  isChecked: boolean
  onClicked: FP.Lazy<void>
}

const Template: Story<Args> = ({ label, disabled, isChecked, onClicked }) => {
  return (
    <CheckButton disabled={disabled} isChecked={isChecked} clickHandler={onClicked}>
      {label}
    </CheckButton>
  )
}

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta<Args> = {
  component: CheckButton,
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
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta
