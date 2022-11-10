import { ComponentMeta, StoryFn } from '@storybook/react'

import { ActionButton as Component, Props } from './ActionButton'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  title: 'Components/button/ActionButton',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'normal', 'large']
      }
    }
  },
  args: {
    actions: [
      {
        label: 'swap',
        callback: () => {
          console.log('swap')
        },
        disabled: false
      },
      {
        label: 'manage',
        callback: () => {
          console.log('manage')
        },
        disabled: false
      },
      {
        label: 'savers',
        callback: () => {
          console.log('savers')
        },
        disabled: true
      },
      {
        label: 'send',
        callback: () => {
          console.log('send')
        },
        disabled: false
      },
      {
        label: 'deposit',
        callback: () => {
          console.log('deposit')
        },
        disabled: false
      },
      {
        label: 'upgrade',
        callback: () => {
          console.log('upgrade')
        },
        disabled: true
      }
    ],
    disabled: false,
    size: 'normal'
  },
  decorators: [
    (Story) => (
      <div className="flex h-full w-full items-center justify-center">
        <Story />
      </div>
    )
  ]
}

export default meta
