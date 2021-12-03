import React from 'react'

import { Meta, Story } from '@storybook/react'

import { ConfirmationModal } from './ConfirmationModal'

type Args = {
  title: string
  message: string
  okText: string
  visible: boolean
}

const Template: Story<Args> = ({ title, message, okText, visible }) => {
  return (
    <ConfirmationModal
      title={title}
      visible={visible}
      onClose={() => console.log('onClose')}
      onSuccess={() => console.log('onSuccess')}
      content={message}
      okText={okText}
    />
  )
}

export const Default = Template.bind({})

const meta: Meta<Args> = {
  component: ConfirmationModal,
  title: 'Components/Modal/Confirmation',
  argTypes: {
    title: {
      name: 'Title',
      control: {
        type: 'text'
      },
      defaultValue: 'Title'
    },
    message: {
      name: 'Message',
      control: {
        type: 'text'
      },
      defaultValue: 'Message description'
    },
    okText: {
      name: 'Label Confirm',
      control: {
        type: 'text'
      },
      defaultValue: 'Ok'
    },
    visible: {
      name: 'Show / hide',
      control: {
        type: 'boolean'
      },
      defaultValue: true
    }
  }
}

export default meta
