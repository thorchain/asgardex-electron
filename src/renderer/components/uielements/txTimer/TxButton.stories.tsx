import React from 'react'

import { Story } from '@storybook/react'
import { Button as AntButton } from 'antd'
import { ButtonProps } from 'antd/lib/button'

const Template: Story<ButtonProps & { label?: string }> = ({ label = 'label', ...otherProps }) => (
  <AntButton {...otherProps}>{label}</AntButton>
)

export const Story1 = Template.bind({})

// const Story1: Story<TxTimerProps> = (args) => <TxTimer {...args} />
Story1.args = {
  type: 'dashed',
  value: 'value 1'
}

const Button = <AntButton />

export default {
  title: 'TxButton',
  component: Button,
  argTypes: {
    label: { name: 'label', type: { name: 'string' } },
    type: { control: { type: 'select', options: ['primary', 'dashed', 'link'] } },
    value: { control: { type: 'select', options: ['value 1', 'value 2', 'value 3'] } }
  }
}
