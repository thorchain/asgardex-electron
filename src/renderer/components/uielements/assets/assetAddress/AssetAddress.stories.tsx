import React from 'react'

import { Story, Meta } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_TESTNET } from '../../../../../shared/mock/address'
import { Size } from '../assetIcon'
import { AssetAddress as Component } from './AssetAddress'

type Args = {
  size: Size
  width: string
}
export const Template: Story<Args> = ({ size, width }) => (
  <div style={{ width, backgroundColor: 'red' }}>
    <Component asset={AssetBNB} size={size} address={BNB_ADDRESS_TESTNET} network="mainnet" />
  </div>
)

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta<Args> = {
  component: Component,
  title: 'Components/AssetAddress',
  argTypes: {
    size: {
      name: 'Size',
      control: {
        type: 'select',
        options: ['xsmall', 'small', 'normal', 'big', 'large']
      },
      defaultValue: 'normal'
    },
    width: {
      name: 'Wrapper width',
      control: {
        type: 'select',
        options: ['100%', '300px', '500px']
      },
      defaultValue: '100%'
    }
  }
}

export default meta
