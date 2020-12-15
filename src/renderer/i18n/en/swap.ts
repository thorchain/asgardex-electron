import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.swapping': 'You are swapping',
  'swap.state.pending': 'You are swapping',
  'swap.state.success': 'You are swapped',
  'swap.viewTransaction': 'View transaction',
  'swap.input': 'Input',
  'swap.balance': 'Balance',
  'swap.output': 'Output',
  'swap.drag': 'Drag to swap',
  'swap.searchAsset': 'Search Asset',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaction fee {fee} needs to be covered by your balance (currently {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Outbounding fee of {fee} needs to be covered by receiving amount (currently {amount}).'
}

export default swap
