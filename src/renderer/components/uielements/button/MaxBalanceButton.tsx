import React, { useCallback } from 'react'

import { Balance } from '@xchainjs/xchain-client'
import { BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

import { InfoIcon } from '../info'
import { TextButton, Props as ButtonProps } from './TextButton'

export type ComponentProps = {
  balance: Balance
  maxInfoText?: string
  onClick: (amount: BaseAmount) => void
  disabled?: boolean
  className?: string
  classNameButton?: string
  classNameIcon?: string
}

export type Props = ComponentProps & Omit<ButtonProps, 'onClick'>

export const MaxBalanceButton: React.FC<Props> = (props): JSX.Element => {
  const {
    balance,
    onClick,
    disabled = false,
    maxInfoText = '',
    color = 'primary',
    size = 'normal',
    className = '',
    classNameButton = '',
    classNameIcon = ''
  } = props
  const { amount, asset } = balance

  const intl = useIntl()

  const onClickHandler = useCallback(() => onClick(amount), [amount, onClick])

  return (
    <div className={`space-between flex items-center ${className}`}>
      <TextButton
        color={color}
        size={size}
        disabled={disabled}
        onClick={onClickHandler}
        className={`mr-5px w-auto !p-0 ${classNameButton}`}>
        <span className="underline">{intl.formatMessage({ id: 'common.max' })}:</span>
        &nbsp;
        {formatAssetAmountCurrency({
          amount: baseToAsset(amount),
          asset,
          trimZeros: true
        })}
      </TextButton>

      {maxInfoText && <InfoIcon tooltip={maxInfoText} className={classNameIcon} />}
    </div>
  )
}
