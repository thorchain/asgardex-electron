import { ComponentMeta } from '@storybook/react'

import { ConfirmationModal } from './ConfirmationModal'

type Args = {
  title: string
  message: string
  okText: string
  visible: boolean
}

const Template = ({ title, message, okText, visible }: Args) => {
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

const meta: ComponentMeta<typeof Template> = {
  component: Template,
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
