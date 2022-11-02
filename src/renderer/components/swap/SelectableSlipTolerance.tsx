import React, { useCallback } from 'react'

import { Popover } from '@headlessui/react'
import { Cog8ToothIcon } from '@heroicons/react/20/solid'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'

import { ChangeSlipToleranceHandler } from '../../services/app/types'
import { SlipTolerance } from '../../types/asgardex'
import { BaseButton } from '../uielements/button'

export const SLIP_PERCENTAGES: SlipTolerance[] = [0.5, 1, 3, 5, 10]
export const SLIP_TOLERANCE_KEY = 'asgdx-slip-tolerance'

export type Props = {
  value: SlipTolerance
  onChange: ChangeSlipToleranceHandler
}

export const SelectableSlipTolerance: React.FC<Props> = (props): JSX.Element => {
  const { onChange, value } = props

  const changeSlipToleranceHandler = useCallback(
    (slipTolerance: SlipTolerance) => {
      // TODO (@veado) Move storage to services/app, there is already a `changeSlipTolerance` state
      localStorage.setItem(SLIP_TOLERANCE_KEY, slipTolerance.toString())
      onChange(slipTolerance)
    },
    [onChange]
  )

  return (
    <Popover className="relative">
      <Popover.Button className="group flex items-center">
        {value.toString()} %
        <Cog8ToothIcon className="ease ml-5px h-[15px] w-[15px] text-gray2 group-hover:rotate-180 dark:text-gray2d" />
      </Popover.Button>
      <Popover.Panel className="absolute z-10 translate-y-[-100%] translate-x-[-50%] bg-bg0 shadow-full dark:bg-bg0d dark:shadow-fulld ">
        {({ close }) => (
          <div>
            {FP.pipe(
              SLIP_PERCENTAGES,
              A.map((slip) => (
                <BaseButton
                  font={slip === value ? 'bold' : 'normal'}
                  className={`w-full hover:bg-bg2 dark:hover:bg-bg2d `}
                  key={slip}
                  onClick={() => {
                    changeSlipToleranceHandler(slip)
                    close()
                  }}>
                  {slip}%
                </BaseButton>
              ))
            )}
          </div>
        )}
      </Popover.Panel>
    </Popover>
  )
}
