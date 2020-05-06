import antdData from 'antd/lib/locale-provider/en_US'
import { CommonMessages, StakeMessages, SwapMessages, WalletMessages, Messages } from './types'

const common: CommonMessages = {
  'common.greeting': 'Hello {name}',
  'common.copyright': '©'
}

const swap: SwapMessages = {
  'swap.title': 'Swap'
}

const stake: StakeMessages = {
  'stake.title': 'Stake'
}

const wallet: WalletMessages = {
  'wallet.title': 'Stake'
}

export default { ...antdData, ...common, ...stake, ...swap, ...wallet } as Messages
