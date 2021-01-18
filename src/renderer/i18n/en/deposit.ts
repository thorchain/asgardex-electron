import { DepositMessages } from '../types'

const deposit: DepositMessages = {
  'deposit.interact.title': 'Deposit',
  'deposit.interact.subtitle': 'Interact with THORchain',
  'deposit.interact.actions': 'Available actions',
  'deposit.interact.actions.bond': 'Bond',
  'deposit.interact.actions.unbond': 'Unbond',
  'deposit.interact.actions.leave': 'Leave',
  'deposit.share.title': 'Your pool share',
  'deposit.share.units': 'Liquidity units',
  'deposit.share.total': 'Total value',
  'deposit.share.poolshare': 'Pool share',
  'deposit.redemption.title': 'Current redemption value',
  'deposit.totalEarnings': 'Your total earnings from the pool',
  'deposit.add.asym': 'Add {asset}',
  'deposit.add.sym': 'Add {assetA} + {assetB}',
  'deposit.add.state.pending': 'Adding liquidity',
  'deposit.add.state.success': 'Successful deposit',
  'deposit.add.state.error': 'Deposit error',
  'deposit.add.error.chainFeeNotCovered': 'Needed fee of {fee} is not covered by your balance: {balance}',
  'deposit.add.error.nobalances': 'No balances',
  'deposit.add.error.nobalance1': "You don't have any balance of {asset} in your wallet to deposit.",
  'deposit.add.error.nobalance2': "You don't have any balances of {asset1} and {asset2} in your wallet to deposit.",
  'deposit.withdraw': 'Withdraw',
  'deposit.advancedMode': 'Advanced mode',
  'deposit.drag': 'Drag to deposit',
  'deposit.poolDetails.depth': 'Depth',
  'deposit.poolDetails.24hvol': '24hr volume',
  'deposit.poolDetails.allTimeVal': 'All time volume',
  'deposit.poolDetails.totalSwaps': 'Total swaps',
  'deposit.poolDetails.totalUsers': 'Total users',
  'deposit.wallet.add': 'Add wallet',
  'deposit.wallet.connect': 'Please connect your wallet',
  'deposit.pool.noDeposit': "You don't have any shares in this pool",
  'deposit.withdraw.title': 'Adjust withdrawal',
  'deposit.withdraw.choseText': 'Choose from 0 to 100% of how much to withdraw.',
  'deposit.withdraw.receiveText': 'You should receive.',
  'deposit.withdraw.fees': 'Transaction fee: {thorMemo}, Outbounding fees: {thorOut} + {assetOut}',
  'deposit.withdraw.feeNote': 'Note: {fee} BNB will be left in your wallet for the transaction fees.',
  'deposit.withdraw.drag': 'Drag to withdraw',
  'deposit.withdraw.add.error.thorMemoFeeNotCovered':
    'Transaction fee {fee} needs to be covered by your balance (currently {balance}).',
  'deposit.withdraw.add.error.outFeeNotCovered':
    'Outbounding fee of {fee} needs to be covered by receiving amount (currently {amount}).'
}

export default deposit
