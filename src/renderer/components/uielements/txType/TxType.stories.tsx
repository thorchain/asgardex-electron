import { Story } from '@storybook/react'

import { TxTypes } from '../../../types/asgardex'
import { TxType } from './TxType'

const types = ['Swap', 'Deposit', 'Double swap', 'Withdraw'] as const

type InputType = typeof types[number]

const mapType = (type: InputType) => {
  switch (type) {
    case types[0]: {
      return TxTypes.SWAP
    }
    case types[1]: {
      return TxTypes.DEPOSIT
    }
    case types[2]: {
      return TxTypes.DOUBLE_SWAP
    }
    case types[3]: {
      return TxTypes.WITHDRAW
    }
  }
}

export const Default: Story<{ type: InputType }> = ({ type }) => {
  return <TxType type={mapType(type)} />
}

const argTypes = {
  type: {
    control: {
      type: 'select',
      options: types
    }
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
