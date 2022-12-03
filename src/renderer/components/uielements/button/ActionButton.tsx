import React from 'react'

import { Popover } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import type { Props as ButtonProps } from './FlatButton'
import { TextButton, FlatButton } from './index'

export type Action = { label: string; callback: FP.Lazy<void>; disabled?: boolean }
export type Props = Omit<ButtonProps, 'onClick'> & {
  actions: Action[]
  btnClassName?: string
  isTextView?: boolean
}

export const ActionButton: React.FC<Props> = (props): JSX.Element => {
  const { size, actions, isTextView = true, disabled = false, className = '', btnClassName = '' } = props

  const intl = useIntl()

  return (
    <Popover className={`relative ${className}`}>
      <Popover.Button as="div" className="group">
        {({ open }) => (
          <FlatButton className={`${btnClassName}`} size={size} disabled={disabled}>
            <span className={`${isTextView ? 'mr-10px' : 'hidden'}`}>
              {intl.formatMessage({ id: 'common.action' })}
            </span>
            <ChevronDownIcon
              className={`ease h-[20px] w-[20px] text-inherit group-hover:rotate-180 ${
                open ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </FlatButton>
        )}
      </Popover.Button>
      <Popover.Panel className="absolute left-[50%] z-[2000] min-w-[100%] translate-x-[-50%] bg-bg0 shadow-full dark:bg-bg0d dark:shadow-fulld ">
        {({ close }) => (
          <div>
            {FP.pipe(
              actions,
              A.mapWithIndex((index, { label, callback, disabled = false }) => (
                <TextButton
                  className={`w-full hover:bg-bg2 dark:hover:bg-bg2d`}
                  disabled={disabled}
                  size={size}
                  color="neutral"
                  key={index}
                  onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    event.preventDefault()
                    event.stopPropagation()
                    callback()
                    close()
                  }}>
                  {label}
                </TextButton>
              ))
            )}
          </div>
        )}
      </Popover.Panel>
    </Popover>
  )
}
