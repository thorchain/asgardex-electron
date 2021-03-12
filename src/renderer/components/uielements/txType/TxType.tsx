import React from 'react'

import { useIntl } from 'react-intl'

import { ReactComponent as DepositIcon } from '../../../assets/svg/tx-stake.svg'
import { ReactComponent as SwapIcon } from '../../../assets/svg/tx-swap.svg'
import { ReactComponent as WithdrawIcon } from '../../../assets/svg/tx-withdraw.svg'
import { CommonMessageKey } from '../../../i18n/types'
import { TxTypes } from '../../../types/asgardex'
import * as Styled from './TxType.styles'

type Props = {
  type: TxTypes
  className?: string
}

const getIcon = (type: TxTypes) => {
  switch (type) {
    case TxTypes.DEPOSIT:
      return <DepositIcon />
    case TxTypes.WITHDRAW:
      return <WithdrawIcon />
    case TxTypes.SWAP:
    case TxTypes.DOUBLE_SWAP:
    default:
      return <SwapIcon />
  }
}

const getTypeI18nKey = (type: TxTypes): CommonMessageKey => {
  switch (type) {
    case TxTypes.DEPOSIT:
      return 'common.tx.type.deposit'
    case TxTypes.WITHDRAW:
      return 'common.tx.type.withdraw'
    case TxTypes.SWAP:
      return 'common.tx.type.swap'
    case TxTypes.DOUBLE_SWAP:
      return 'common.tx.type.doubleSwap'
    default:
      return 'common.tx.type.swap'
  }
}
export const TxType: React.FC<Props> = ({ type, className }) => {
  const intl = useIntl()

  return (
    <Styled.Container className={className}>
      <Styled.Label>{intl.formatMessage({ id: getTypeI18nKey(type) })}</Styled.Label>
      {getIcon(type)}
    </Styled.Container>
  )
}
