import { ComponentMeta } from '@storybook/react'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { LedgerConfirmationModal } from './'

type Args = {
  chain: Chain
  visible: boolean
  description: string
}

const Template = ({ chain, visible, description }: Args) => {
  return (
    <LedgerConfirmationModal
      visible={visible}
      onClose={() => console.log('onClose')}
      onSuccess={() => console.log('onSuccess')}
      chain={chain}
      description2={description}
      network="mainnet"
      addresses={O.some({
        sender: 'qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
        recipient: 'qr95sy3j9xwd2ap32xkykttr4cvcu7as4y0qverfuy'
      })}
    />
  )
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Modal/LedgerConfirmation',
  argTypes: {
    chain: {
      name: 'Chain',
      control: {
        type: 'select',
        options: ['BNB', 'BCH', 'BTC', 'ETH']
      },
      defaultValue: 'BCH'
    }
  },
  args: {
    visible: true,
    description: 'Any description'
  }
}

export default meta
