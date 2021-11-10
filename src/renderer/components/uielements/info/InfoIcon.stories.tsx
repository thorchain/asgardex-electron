import { Meta, Story } from '@storybook/react'

import { InfoIcon } from './InfoIcon'
import * as Styled from './InfoIcon.styles'

type Args = {
  color: Styled.Color
  tooltip: string
}

export const Default: Story<Args> = ({ color, tooltip }) => <InfoIcon color={color} tooltip={tooltip} />

const meta: Meta<Args> = {
  component: InfoIcon,
  title: 'Components/InfoIcon',
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error']
      },
      defaultValue: 'primary'
    },
    tooltip: {
      control: {
        type: 'text'
      },
      defaultValue: 'Tooltip example text'
    }
  }
}

export default meta
