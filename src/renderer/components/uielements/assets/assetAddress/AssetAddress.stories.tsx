import { ComponentMeta } from '@storybook/react'

import { BNB_ADDRESS_TESTNET } from '../../../../../shared/mock/address'
import { AssetBNB } from '../../../../../shared/utils/asset'
import { Size } from '../assetIcon'
import { AssetAddress as Component } from './AssetAddress'

type Args = {
  size: Size
  width: string
}
const Template = ({ size, width }: Args) => (
  <div style={{ width }}>
    <Component asset={AssetBNB} size={size} address={BNB_ADDRESS_TESTNET} network="mainnet" />
  </div>
)

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
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
