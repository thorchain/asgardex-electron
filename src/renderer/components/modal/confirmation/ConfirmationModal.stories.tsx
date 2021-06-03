import React from 'react'

// import { } from '@storybook/addon-controls'
import { Meta, Story } from '@storybook/react'

import { ConfirmationModal } from './ConfirmationModal'

export const Default: Story = () => {
  return (
    <ConfirmationModal
      visible
      onClose={() => console.log('close')}
      onSuccess={() => console.log('success')}
      message={'Confirmation action text here'}
    />
  )
}
Default.storyName = 'default'

const meta: Meta = {
  component: ConfirmationModal,
  title: 'Components/Modal/Confirmation',
  argTypes: {
    asd: {
      control: {}
    }
  }
}

export default meta
