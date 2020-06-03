import { UserTransactionType, TransactionPartyType } from '../types/wallet'

export const transactionParty = (address: string, tx: UserTransactionType): TransactionPartyType => {
  const from = tx.fromAddr
  const to = tx.toAddr
  switch (tx.txType) {
    case 'TRANSFER':
      if (from === address) {
        return { msg: 'send', label: 'to', address: to, color: 'error', op: '-' }
      } else {
        return { msg: 'receive', label: 'from', address: from, color: 'success', op: '+' }
      }
    case 'FREEZE_TOKEN':
      return { msg: 'freeze', label: 'from', address: from, color: 'info', op: '-' }
    case 'UN_FREEZE_TOKEN':
      return { msg: 'unfreeze', label: 'to', address: from, color: 'warning', op: '+' }
    case 'outboundTransferInfo':
      if (from === address) {
        return { msg: 'pending', label: 'to', address: to, color: 'secondary', op: '-' }
      } else {
        return { msg: 'pending', label: 'from', address: from, color: 'secondary', op: '+' }
      }

    default:
      return { msg: 'unkown', label: 'NA', address: '', color: '', op: '' }
  }
}
