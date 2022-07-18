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

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Modal/Confirmation',
  args: {
    visible: true,
    title: 'Title',
    okText: 'Ok',
    message: 'Message description'
  }
}

export default meta
