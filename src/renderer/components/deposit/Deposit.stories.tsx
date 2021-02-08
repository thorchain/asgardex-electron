import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { Default as AsymDeposit } from './add/AsymDeposit.stories'
import { Default as SymDeposit } from './add/SymDeposit.stories'
import { Deposit, Props as DepositProps } from './Deposit'
import { Default as Withdraw } from './withdraw/Withdraw.stories'

const defaultProps: DepositProps = {
  asset: AssetBNB,
  symPoolShare: RD.success(
    O.some({ units: assetToBase(assetAmount(3, THORCHAIN_DECIMAL)), asset: AssetBNB, type: 'sym' })
  ),
  asymPoolShare: RD.success(
    O.some({ units: assetToBase(assetAmount(1, THORCHAIN_DECIMAL)), asset: AssetBNB, type: 'sym' })
  ),
  ShareContent: DefaultPoolShare,
  SymDepositContent: SymDeposit,
  AsymDepositContent: AsymDeposit,
  WidthdrawContent: Withdraw,
  keystoreState: O.some(O.some({ phrase: 'phrase' }))
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
