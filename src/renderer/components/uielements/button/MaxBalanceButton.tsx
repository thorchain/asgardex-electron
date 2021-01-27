import React, { useCallback } from 'react'

import { Balance } from '@xchainjs/xchain-client'
import { BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import { useIntl } from 'react-intl'

import { ButtonProps } from './Button.types'
import * as Styled from './MaxBalanceButton.styles'

type ComponentProps = {
  balance: Balance
  onClick?: (amount: BaseAmount) => void
}

export type Props = ComponentProps & Omit<ButtonProps, 'onClick'>

export const MaxBalanceButton: React.FC<Props> = (props): JSX.Element => {
  const { balance, onClick = (_) => {}, disabled = false, ...otherProps } = props
  const { amount, asset } = balance

  const intl = useIntl()

  const onClickHandler = useCallback((_) => onClick(amount), [amount, onClick])

  return (
    <Row align="middle">
      <Col>
        <Styled.Button onClick={onClickHandler} disabled={disabled} typevalue="underline" {...otherProps}>
          {intl.formatMessage({ id: 'common.max' })}:
        </Styled.Button>
      </Col>
      <Col flex="auto">
        <Styled.Label disabled={disabled}>
          {formatAssetAmountCurrency({
            amount: baseToAsset(amount),
            asset,
            trimZeros: true
          })}
        </Styled.Label>
      </Col>
    </Row>
  )
}
