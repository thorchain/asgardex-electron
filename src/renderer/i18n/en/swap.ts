import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Swapping',
  'swap.state.success': 'Successful swap',
  'swap.state.error': 'Swap error',
  'swap.input': 'Input',
  'swap.balance': 'Balance',
  'swap.output': 'Output',
  'swap.drag': 'Drag to swap',
  'swap.searchAsset': 'Search Asset',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaction fee {fee} needs to be covered by your balance (currently {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Outbounding fee of {fee} needs to be covered by receiving amount (currently {amount}).',
  'swap.note.lockedWallet': 'You need to unlock your wallet to swap',
  'swap.note.nowallet': 'Create or import a wallet to swap',
  'swap.errors.asset.missingSourceAsset': 'Missing source asset',
  'swap.errors.asset.missingTargetAsset': 'Missing target asset'
}

export default swap
