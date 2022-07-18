import { ComponentMeta, StoryFn } from '@storybook/react'
import { PaginationProps } from 'antd'

import { Pagination as Component } from './index'

const Template: StoryFn<PaginationProps> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Pagination',
  argTypes: {
    onChange: { action: 'onChange' }
  },
  args: {
    defaultCurrent: 1,
    total: 100,
    defaultPageSize: 5,
    showSizeChanger: false
  }
}

export default meta
