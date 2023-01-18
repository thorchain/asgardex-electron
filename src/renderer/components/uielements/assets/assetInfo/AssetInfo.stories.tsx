import { ComponentMeta } from '@storybook/react'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { AssetRuneNative } from '../../../../../shared/utils/asset'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { AssetInfo } from './AssetInfo'

type Args = {
  address: string
  balance: number
}
export const Template = ({ address, balance }: Args) => {
  return (
    <AssetInfo
      walletInfo={FP.pipe(
        address,
        O.fromPredicate((s) => !!s),
        O.map((address) => ({ address, network: 'testnet', walletType: 'keystore' }))
      )}
      asset={O.some(AssetRuneNative)}
      assetsWB={O.some([
        mockWalletBalance({
          amount: assetToBase(assetAmount(balance))
        })
      ])}
      network="testnet"
    />
  )
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Wallet/AssetInfo',
  argTypes: {
    address: {
      control: 'text',
      defaultValue: 'tthor18ngerf2l9c6ht7wr83ccyt02s6pws4lff8w0ug'
    },
    balance: {
      control: 'number',
      defaultValue: 123
    }
  }
}
export default meta
