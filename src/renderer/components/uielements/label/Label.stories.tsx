import { ComponentMeta, StoryFn } from '@storybook/react'

import { Label as Component, LabelProps } from './Label'

const Template: StoryFn<LabelProps> = (args) => <Component {...args} ref={null} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Label',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['tiny', 'small', 'normal', 'big', 'large']
      },
      defaultValue: 'normal'
    },
    weight: {
      control: {
        type: 'select',
        options: ['light', 'bold', 'normal']
      },
      defaultValue: 'normal'
    },
    color: {
      control: {
        type: 'select',
        options: ['primary', 'success', 'warning', 'error', 'normal', 'light', 'dark', 'input', 'gray', 'white']
      },
      defaultValue: 'normal'
    }
  },
  args: {
    size: 'normal',
    weight: 'normal',
    color: 'normal',
    children: 'Label Text',
    nowrap: false,
    textTransform: 'uppercase',
    align: 'left',
    loading: false,
    disabled: false
  }
}

export default meta
