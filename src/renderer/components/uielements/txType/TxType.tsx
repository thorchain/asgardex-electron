import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { ReactComponent as DonateIcon } from '../../../assets/svg/tx-donate.svg'
import { ReactComponent as RefundIcon } from '../../../assets/svg/tx-refund.svg'
import { ReactComponent as DepositIcon } from '../../../assets/svg/tx-stake.svg'
import { ReactComponent as SwapIcon } from '../../../assets/svg/tx-swap.svg'
import { ReactComponent as WithdrawIcon } from '../../../assets/svg/tx-withdraw.svg'
import { CommonMessageKey } from '../../../i18n/types'
import { TxType as MidgardTxType } from '../../../services/midgard/types'
import * as Styled from './TxType.styles'

type Props = {
  type: MidgardTxType
  className?: string
}

const getIcon = (type: MidgardTxType) => {
  switch (type) {
    case 'DEPOSIT':
      return <DepositIcon />
    case 'WITHDRAW':
      return <WithdrawIcon />
    case 'SWAP':
      return <SwapIcon />
    case 'DONATE':
      return <DonateIcon />
    case 'REFUND':
      return <RefundIcon />
    default:
      return <></>
  }
}

const getTypeI18nKey = (type: MidgardTxType): CommonMessageKey | undefined => {
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
  }
}
export const TxType: React.FC<Props> = ({ type, className }) => {
  const intl = useIntl()

  const typeKey = useMemo(() => getTypeI18nKey(type), [type])

  return (
    <Styled.Container className={className}>
      <Styled.IconContainer>{getIcon(type)}</Styled.IconContainer>
      <Styled.Label>{typeKey ? intl.formatMessage({ id: typeKey }) : type}</Styled.Label>
    </Styled.Container>
  )
}
