import { Story, Meta } from '@storybook/react'

import { CopyLabel as Component } from './CopyLabel'

type Args = {
  label: string
  textToCopy: string
}

const Template: Story<Args> = ({ label, textToCopy }) => {
  return <Component label={label} textToCopy={textToCopy} />
}

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta<Args> = {
  component: Component,
  title: 'Components/CopyLabel',
  argTypes: {
    label: {
      name: 'label',
      control: {
        type: 'text'
      },
      defaultValue: 'label'
    },
    textToCopy: {
      name: 'textToCopy',
      control: {
        type: 'text'
      },
      defaultValue: 'text to copy'
    }
  }
}

export default meta
