import { Story } from '@storybook/react'

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

export const Default: Story<{ type: InputType; showTypeIcon: boolean }> = ({ type, showTypeIcon }) => {
  return <TxType type={mapType(type)} showTypeIcon={showTypeIcon} />
}

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

Default.args = {
  type: argTypes.type.control.options[0]
}

export default {
  component: TxType,
  title: 'TxType',
  argTypes
}
