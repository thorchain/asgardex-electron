import { ComponentMeta } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'

import { RefreshButton } from './RefreshButton'

type Args = {
  label: string
  disabled: boolean
  onClicked: FP.Lazy<void>
}

const Template = ({ label, disabled, onClicked }: Args) => {
  return <RefreshButton disabled={disabled} clickHandler={onClicked} label={label} />
}
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/button/RefreshButton',
  argTypes: {
    onClicked: {
      action: 'onClicked'
    }
  },
  args: {
    label: 'Label',
    disabled: false
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
        <Story />
      </div>
    )
  ]
}

export default meta
