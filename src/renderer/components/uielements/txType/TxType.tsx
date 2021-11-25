import React from 'react'

import { useIntl } from 'react-intl'

import { ReactComponent as DonateIcon } from '../../../assets/svg/tx-donate.svg'
import { ReactComponent as RefundIcon } from '../../../assets/svg/tx-refund.svg'
import { ReactComponent as DepositIcon } from '../../../assets/svg/tx-stake.svg'
import { ReactComponent as SwapIcon } from '../../../assets/svg/tx-swap.svg'
import { ReactComponent as WithdrawIcon } from '../../../assets/svg/tx-withdraw.svg'
import { getTxTypeI18n } from '../../../helpers/actionsHelper'
import { TxType as MidgardTxType } from '../../../services/midgard/types'
import * as Styled from './TxType.styles'

type Props = {
  type: MidgardTxType
  showTypeIcon: boolean
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
    case 'SWITCH':
      return <Styled.UpgradeIcon />
    default:
      return <></>
  }
}

export const TxType: React.FC<Props> = ({ type, showTypeIcon, className }) => {
  const intl = useIntl()

  return (
    <Styled.Container className={className}>
      {showTypeIcon && <Styled.IconContainer>{getIcon(type)}</Styled.IconContainer>}
      <Styled.Label>{getTxTypeI18n(type, intl)}</Styled.Label>
    </Styled.Container>
  )
}
