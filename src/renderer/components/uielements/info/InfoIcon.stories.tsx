import { Meta, Story } from '@storybook/react'

import { InfoIcon } from './InfoIcon'

export const Default: Story = () => <InfoIcon tooltip="tooltip example" />

const meta: Meta = {
  component: InfoIcon,
  title: 'Components/InfoIcon'
}

export default meta
