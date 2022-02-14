import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Swapping',
  'swap.state.success': 'Successful swap',
  'swap.state.error': 'Swap error',
  'swap.input': 'Input',
  'swap.output': 'Output',
  'swap.recipient': 'Recipient',
  'swap.info.max.fee': 'Total asset balance substracted by estimated swap fees',
  'swap.slip.title': 'Slip',
  'swap.slip.tolerance': 'Slippage tolerance',
  'swap.slip.tolerance.info':
    'The higher the percentage, the more slippage you will accept. More slippage includes also a wider range for covering estimated fees to avoid aborted swaps.',
  'swap.slip.tolerance.btc-ledger-disabled.info':
    'Selecting slippage tolerance has been disabled due technical issues with Ledger and BTC.',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaction fee {fee} needs to be covered by your balance (currently {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Outbounding fee of {fee} needs to be covered by receiving amount (currently {amount}).',
  'swap.note.lockedWallet': 'You need to unlock your wallet to swap',
  'swap.note.nowallet': 'Create or import a wallet to swap',
  'swap.errors.asset.missingSourceAsset': 'Missing source asset',
  'swap.errors.asset.missingTargetAsset': 'Missing target asset',
  'swap.ledger.sign': 'Click "next" to sign the swap transaction on your device.'
}

export default swap
