import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_DECIMAL, THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { DEFAULT_MIMIR_HALT } from '../../services/thorchain/const'
import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { Default as AsymDeposit } from './add/AsymDeposit.stories'
import { Default as SymDeposit } from './add/SymDeposit.stories'
import { Deposit, Props as DepositProps } from './Deposit'
import { Default as AsymWidthdraw } from './withdraw/AsymWithdraw.stories'
import { Default as Withdraw } from './withdraw/Withdraw.stories'

const defaultProps: DepositProps = {
  haltedChains: [],
  mimirHalt: DEFAULT_MIMIR_HALT,
  asset: { asset: AssetBNB, decimal: BNB_DECIMAL },
  poolDetail: RD.initial,
  shares: RD.success([
    {
      units: bn('300000000'),
      asset: AssetBNB,
      type: 'sym',
      assetAddedAmount: assetToBase(assetAmount(1.5, THORCHAIN_DECIMAL))
    },
    {
      units: bn('100000000'),
      asset: AssetBNB,
      type: 'asym',
      assetAddedAmount: assetToBase(assetAmount(1, THORCHAIN_DECIMAL))
    },
    {
      units: bn('200000000'),
      asset: AssetRuneNative,
      type: 'asym',
      assetAddedAmount: assetToBase(assetAmount(2, THORCHAIN_DECIMAL))
    }
  ]),
  ShareContent: DefaultPoolShare,
  SymDepositContent: SymDeposit,
  AsymDepositContent: AsymDeposit,
  WidthdrawContent: Withdraw,
  AsymWidthdrawContent: AsymWidthdraw,
  keystoreState: O.some(O.some({ phrase: 'phrase' })),
  liquidityProvider: RD.initial
}

export const Default: Story = () => <Deposit {...defaultProps} />
Default.storyName = 'default'

export const NoWallet: Story = () => {
  const props: DepositProps = {
    ...defaultProps,
    keystoreState: O.none
  }
  return <SymDeposit {...props} />
}
NoWallet.storyName = 'no wallet'

export const LockedWallet: Story = () => {
  const props: DepositProps = {
    ...defaultProps,
    keystoreState: O.some(O.none)
  }
  return <SymDeposit {...props} />
}
LockedWallet.storyName = 'locked wallet'

const meta: Meta = {
  component: Deposit,
  title: 'Components/Deposit/Deposit'
}

export default meta
