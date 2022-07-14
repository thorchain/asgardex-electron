import React from 'react'

import { ComponentMeta } from '@storybook/react'

import { Radio, RadioLabel } from './Radio.styles'

const meta: ComponentMeta<typeof Radio> = {
  component: Radio,
  title: 'Components/shared/Radio',
  render: ({ disabled }) => (
    <Radio.Group defaultValue="1" disabled={true}>
      <Radio value="1">
        <RadioLabel disabled={disabled}>One</RadioLabel>
      </Radio>
      <Radio value="2">
        <RadioLabel disabled={disabled}>Two</RadioLabel>
      </Radio>
    </Radio.Group>
  ),

  argTypes: {
    disabled: {
      name: 'disabled',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  }
}

export default meta
