import React from 'react'

import { ComponentMeta, StoryFn } from '@storybook/react'

import { ReloadButton as Component } from './'

type ArgTypes = { children: React.ReactNode }
const Template: StoryFn<ArgTypes> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/ReloadButton',
  argTypes: {
    children: {
      options: ['none', 'text'],
      mapping: {
        none: null,
        text: 'Reload child text'
      }
    },
    onClick: { action: 'onClick' }
  },
  args: { children: 'text' }
}

export default meta
