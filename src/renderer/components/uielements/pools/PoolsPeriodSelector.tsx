import React from 'react'

import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { GetPoolsPeriodEnum } from '../../../types/generated/midgard'

type PeriodItem = { value: GetPoolsPeriodEnum; label: string }

const DEFAULT_ITEM: PeriodItem = { value: GetPoolsPeriodEnum._30d, label: '30 days' }
const LIST_ITEMS: PeriodItem[] = [
  { value: GetPoolsPeriodEnum._7d, label: '7 days' },
  DEFAULT_ITEM, // 30 days
  { value: GetPoolsPeriodEnum._90d, label: '90 days' },
  { value: GetPoolsPeriodEnum._180d, label: '180 days' },
  { value: GetPoolsPeriodEnum._365d, label: '365 days' }
]

export type Props = {
  selectedValue: GetPoolsPeriodEnum
  onChange: (value: GetPoolsPeriodEnum) => void
  className?: string
  disabled?: boolean
}

export const PoolsPeriodSelector: React.FC<Props> = (props): JSX.Element => {
  const { selectedValue, onChange, disabled = false, className = '' } = props

  const selectedItem: PeriodItem = FP.pipe(
    LIST_ITEMS,
    // get selected wallet
    A.findFirst(({ value }) => value === selectedValue),
    // use first if no wallet is selected
    O.getOrElse(() => DEFAULT_ITEM)
  )

  return (
    <Listbox
      value={selectedItem}
      disabled={disabled}
      onChange={({ value }) => {
        onChange(value)
      }}
      as="div"
      className={({ open }) => `
                    ${open ? 'shadow-full dark:shadow-fulld' : ''}
                    `}>
      <div
        className={`relative ${className}`}
        onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          event.preventDefault()
          event.stopPropagation()
        }}>
        <Listbox.Button
          as="div"
          className={() => `text-12
              group
              flex cursor-pointer
              items-center
                    bg-bg0
                    py-5px
                    pl-20px
                   pr-10px font-main
                   text-text0
                    transition
                    duration-300
                    ease-in-out hover:shadow-full
                    hover:dark:shadow-fulld
                    ${disabled && 'opacity-70'}
                    dark:bg-bg0d
                    dark:text-text0d
                    `}>
          {({ open }) => (
            <>
              <span className="w-full">{selectedItem.label}</span>
              <ChevronDownIcon
                className={`
                  ${open && 'rotate-180'}
                  ease
                  h-20px w-20px
                          group-hover:rotate-180

                  `}
              />
            </>
          )}
        </Listbox.Button>
        <Listbox.Options
          className="
              absolute z-[2000]
              mt-[0px]
            max-h-60 w-full overflow-auto
            border
            border-gray0 bg-bg0 focus:outline-none
            dark:border-gray0d  dark:bg-bg0d

            ">
          {FP.pipe(
            LIST_ITEMS,
            A.map((item) => {
              const selected = item.value === selectedItem.value
              return (
                <Listbox.Option
                  disabled={item.value === selectedItem.value}
                  className={({ selected }) =>
                    `flex w-full
                      select-none
                      justify-center whitespace-nowrap
                      py-[10px] pl-20px pr-10px
                      ${selected && 'text-gray2 dark:text-gray2d'}
                      ${selected ? 'cursor-disabled' : 'cursor-pointer'}
                      text-12 font-main
                      text-text0
                      dark:text-text0d
                      ${!selected && 'hover:bg-gray0 hover:text-gray2'}
                      ${!selected && 'hover:dark:bg-gray0d hover:dark:text-gray2d'}
                      `
                  }
                  key={item.value}
                  value={item}>
                  {item.label}
                  <CheckIcon className={`ml-5px h-20px w-20px text-turquoise ${selected ? 'visible' : 'invisible'}`} />
                </Listbox.Option>
              )
            })
          )}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}
