import React from 'react'

import { Story, Meta } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'

import { RefreshButton } from './RefreshButton'

type Args = {
  label: string
  disabled: boolean
  onClicked: FP.Lazy<void>
}

const Template: Story<Args> = ({ label, disabled, onClicked }) => {
  return <RefreshButton disabled={disabled} clickHandler={onClicked} label={label} />
}

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta<Args> = {
  component: RefreshButton,
  title: 'Components/button/RefreshButton',
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
