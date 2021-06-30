import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Swapping',
  'swap.state.success': 'Successful swap',
  'swap.state.error': 'Swap error',
  'swap.input': 'Input',
  'swap.output': 'Output',
  'swap.approve.checking': 'Checking allowance to swap {asset} ...',
  'swap.approve.error': 'Error while checking allowance to swap {asset}: {error}',
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
