import React from 'react'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import type { Size } from './Button.types'
import { TextButton } from './TextButton'

export type Props = {
  label?: string
  size?: Size
  path?: string
  className?: string
}

export const BackLinkButton: React.FC<Props> = ({ label, path, size = 'normal', className = '' }): JSX.Element => {
  const navigate = useNavigate()
  const intl = useIntl()

  const clickHandler = () => {
    if (path) {
      navigate(path)
    } else {
      // go back
      navigate(-1)
    }
  }
  return (
    <TextButton size={size} onClick={clickHandler} className={`mb-10px !p-0 sm:mb-20px ${className}`}>
      <ChevronLeftIcon className="h-20px w-20px text-inherit" />
      <span className="hidden sm:inline-block">{label || intl.formatMessage({ id: 'common.back' })}</span>
    </TextButton>
  )
}
