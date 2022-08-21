import { ComponentMeta } from '@storybook/react'

import { TxType as MidgardTxType } from '../../../services/midgard/types'
import { TxType } from './TxType'

const types = ['Swap', 'Deposit', 'Withdraw', 'Donate', 'Refund'] as const

type InputType = typeof types[number]

const mapType = (type: InputType): MidgardTxType => {
  switch (type) {
    case types[0]: {
      return 'SWAP'
    }
    case types[1]: {
      return 'DEPOSIT'
    }
    case types[2]: {
      return 'WITHDRAW'
    }
    case types[3]: {
      return 'DONATE'
    }
    case types[4]: {
      return 'REFUND'
    }
  }
}

const Template = ({ type, showTypeIcon }: { type: InputType; showTypeIcon: boolean }) => (
  <TxType type={mapType(type)} showTypeIcon={showTypeIcon} />
)
export const Default = Template.bind({})

const argTypes = {
  type: {
    control: {
      type: 'select',
      options: types
    }
  },
  showTypeIcon: {
    control: {
      type: 'boolean'
    },
    defaultValue: true
  }
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/TxType',
  argTypes,
  args: {
    type: argTypes.type.control.options[0]
  }
}

export default meta
