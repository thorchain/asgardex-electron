import { ComponentMeta, StoryFn } from '@storybook/react'

import { Radio, RadioLabel } from './Radio.styles'

type ArgTypes = { disabled: boolean }

const Template: StoryFn<ArgTypes> = ({ disabled }) => (
  <Radio.Group defaultValue="1" disabled={disabled}>
    <Radio value="1">
      <RadioLabel disabled={disabled}>One</RadioLabel>
    </Radio>
    <Radio value="2">
      <RadioLabel disabled={disabled}>Two</RadioLabel>
    </Radio>
  </Radio.Group>
)

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Radio> = {
  component: Radio,
  title: 'Components/shared/Radio',

  args: {
    disabled: false
  }
}

export default meta
