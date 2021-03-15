import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { ReactComponent as DepositIcon } from '../../../assets/svg/tx-stake.svg'
import { ReactComponent as SwapIcon } from '../../../assets/svg/tx-swap.svg'
import { ReactComponent as WithdrawIcon } from '../../../assets/svg/tx-withdraw.svg'
import { CommonMessageKey } from '../../../i18n/types'
import * as Styled from './TxType.styles'
import { UITxType } from './TxType.types'

type Props = {
  type: UITxType
  className?: string
}

const getIcon = (type: UITxType) => {
  switch (type) {
    case 'DEPOSIT':
      return <DepositIcon />
    case 'WITHDRAW':
      return <WithdrawIcon />
    case 'SWAP':
    case 'DOUBLE_SWAP':
      return <SwapIcon />
    default:
      return <></>
  }
}

const getTypeI18nKey = (type: UITxType): CommonMessageKey | undefined => {
  switch (type) {
    case 'DEPOSIT':
      return 'common.tx.type.deposit'
    case 'WITHDRAW':
      return 'common.tx.type.withdraw'
    case 'SWAP':
      return 'common.tx.type.swap'
    case 'DOUBLE_SWAP':
      return 'common.tx.type.doubleSwap'
  }
}
export const TxType: React.FC<Props> = ({ type, className }) => {
  const intl = useIntl()

  const typeKey = useMemo(() => getTypeI18nKey(type), [type])

  return (
    <Styled.Container className={className}>
      <Styled.Label>{typeKey ? intl.formatMessage({ id: typeKey }) : type}</Styled.Label>
      {getIcon(type)}
    </Styled.Container>
  )
}
