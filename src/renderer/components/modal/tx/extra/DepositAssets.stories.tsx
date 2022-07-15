import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { DepositAssets, Props as DepositAssetsProps } from './DepositAssets'

const defaultProps: DepositAssetsProps = {
  stepDescription: 'step 1',
  source: O.some({ asset: AssetRuneNative, amount: assetToBase(assetAmount(30)) }),
  target: { asset: AssetBNB, amount: assetToBase(assetAmount(1)) },
  network: 'testnet'
}

export const Sym: Story = () => <DepositAssets {...defaultProps} />
Sym.storyName = 'sym'

export const Asym: Story = () => {
  const props: DepositAssetsProps = {
    ...defaultProps,
    source: O.none
  }
  return <DepositAssets {...props} />
}
Asym.storyName = 'asym'

const meta: Meta = {
  component: DepositAssets,
  title: 'Components/modal/extra/DepositAssets',
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '30px',
          height: '100vH'
        }}>
        <div style={{ backgroundColor: 'white' }}>
          <Story />
        </div>
      </div>
    )
  ]
}

export default meta
