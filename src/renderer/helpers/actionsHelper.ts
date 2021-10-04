import { IntlShape } from 'react-intl'

import { CommonMessageKey } from '../i18n/types'
import { TxType as MidgardTxType } from '../services/midgard/types'

const getTxTypeI18nKey = (type: MidgardTxType): CommonMessageKey | undefined => {
  switch (type) {
    case 'DEPOSIT':
      return 'common.tx.type.deposit'
    case 'WITHDRAW':
      return 'common.tx.type.withdraw'
    case 'SWAP':
      return 'common.tx.type.swap'
    case 'DONATE':
      return 'common.tx.type.donate'
    case 'REFUND':
      return 'common.tx.type.refund'
    case 'SWITCH':
      return 'common.tx.type.upgrade'
  }
}

export const getTxTypeI18n = (type: MidgardTxType, intl: IntlShape): string => {
  const id = getTxTypeI18nKey(type)
  return id ? intl.formatMessage({ id }) : type
}
