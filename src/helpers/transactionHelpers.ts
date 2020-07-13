import { UserTransactionType, TransactionPartyType } from '../types/wallet'

export const transactionParty = (address: string, tx: UserTransactionType): TransactionPartyType => {
  const from = tx.fromAddr
  const to = tx.toAddr
  const timeStamp = tx.timeStamp
  switch (tx.txType) {
    case 'TRANSFER':
      if (from === address) {
        return { msg: 'send', label: 'to', address: to, timeStamp, color: 'error', op: '-' }
      } else {
        return { msg: 'receive', label: 'from', address: from, timeStamp, color: 'success', op: '+' }
      }
    case 'FREEZE_TOKEN':
      return { msg: 'freeze', label: 'from', address: from, timeStamp, color: 'info', op: '-' }
    case 'UN_FREEZE_TOKEN':
      return { msg: 'unfreeze', label: 'to', address: from, timeStamp, color: 'warning', op: '+' }
    case 'outboundTransferInfo':
      if (from === address) {
        return { msg: 'pending', label: 'to', address: to, timeStamp, color: 'secondary', op: '-' }
      } else {
        return { msg: 'pending', label: 'from', address: from, timeStamp, color: 'secondary', op: '+' }
      }

    default:
      return { msg: 'unkown', label: 'NA', address: '', timeStamp, color: '', op: '' }
  }
}
