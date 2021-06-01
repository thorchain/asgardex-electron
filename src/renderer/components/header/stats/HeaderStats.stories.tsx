import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AssetBUSDBD1 } from '../../../const'
import { HeaderStats as Component, Props as ComponentProps } from './HeaderStats'

const defaultProps: ComponentProps = {
  runePrice: RD.success({
    asset: AssetBUSDBD1,
    amount: assetToBase(assetAmount('14.08'))
  }),
  volume24Price: RD.success({
    asset: AssetBUSDBD1,
    amount: assetToBase(assetAmount('24000000'))
  })
}

export const Default: Story = () => <Component {...defaultProps} />
Default.storyName = 'default'

const meta: Meta = {
  component: Component,
  title: 'Components/HeaderStats',
  decorators: [
    (Story) => (
      <div style={{ padding: '10px 0', backgroundColor: 'white', display: 'flex' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
