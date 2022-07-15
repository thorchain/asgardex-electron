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

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/button/RefreshButton',
  argTypes: {
    label: {
      name: 'Label',
      control: {
        type: 'text'
      },
      defaultValue: 'Label'
    },
    disabled: {
      name: 'disabled',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    onClicked: {
      action: 'onClicked'
    }
  },
  decorators: [
    (S) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta
