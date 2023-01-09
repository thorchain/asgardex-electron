import React from 'react'

import { ArrowPathIcon } from '@heroicons/react/24/outline'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { iconSize } from './BaseButton'
import type { Color, Size } from './Button.types'
import { FlatButton } from './FlatButton'

export type Props = {
  label?: string
  onClick?: React.MouseEventHandler<HTMLElement>
  size?: Size
  color?: Color
  disabled?: boolean
  className?: string
}

/**
 * `ReloadButton` - a `FlatButton` w/ an ReloadIcon
 */
export const ReloadButton: React.FC<Props> = (props): JSX.Element => {
  const { label, size = 'normal', color = 'primary', onClick = FP.constVoid, disabled, className = '' } = props
  const intl = useIntl()

  return (
    <FlatButton
      className={`group !pl-10px ${className}`}
      size={size}
      color={color}
      onClick={onClick}
      disabled={disabled}>
      <ArrowPathIcon className={`ease mr-5px ${iconSize[size]} text-inherit group-hover:rotate-180`} />
      <span className="hidden sm:inline-block">{label || intl.formatMessage({ id: 'common.reload' })}</span>
    </FlatButton>
  )
}
