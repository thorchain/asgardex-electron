import React from 'react'

import { ArrowPathIcon } from '@heroicons/react/24/outline'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import type { Size } from './Button.types'
import { TextButton } from './TextButton'

type Props = {
  label?: string
  clickHandler?: React.MouseEventHandler<HTMLElement>
  size?: Size
  disabled?: boolean
  className?: string
}

export const RefreshButton: React.FC<Props> = (props): JSX.Element => {
  const { label, size = 'normal', clickHandler = FP.constVoid, disabled, className = '' } = props
  const intl = useIntl()

  return (
    <TextButton className={`group !p-0 ${className}`} size={size} onClick={clickHandler} disabled={disabled}>
      <ArrowPathIcon className="ease mr-5px h-[20px] w-[20px] text-inherit group-hover:rotate-180" />
      <span className="hidden sm:inline-block">{label || intl.formatMessage({ id: 'common.refresh' })}</span>
    </TextButton>
  )
}
